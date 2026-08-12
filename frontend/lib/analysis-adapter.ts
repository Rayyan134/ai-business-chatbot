import type {
  AnalysisResult,
  KeyFindingDetail,
  RecommendationDetail,
} from "@/lib/analysis-api-types";
import type {
  AnalysisMetric,
  ExecutiveSummary,
  HeatmapRow,
  KeyFinding,
  OverallScore,
  Recommendation,
  RiskTrendPoint,
  SourceChip,
} from "@/lib/analysis-types";
import type { ReportFinding } from "@/lib/report-types";

export interface AnalysisViewData {
  overallScore: OverallScore;
  analysisSummary: ExecutiveSummary;
  metrics: AnalysisMetric[];
  recommendations: Recommendation[];
  riskHeatmap: HeatmapRow[];
  riskTrend: RiskTrendPoint[];
  keyFindings: KeyFinding[];
}

export function formatGeneratedAt(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toKeyFinding(finding: KeyFindingDetail): KeyFinding {
  return {
    id: finding.id,
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    likelihood: finding.likelihood,
    exposure: finding.exposure,
  };
}

function toRecommendation(
  recommendation: RecommendationDetail,
): Recommendation {
  return {
    id: recommendation.id,
    priority: recommendation.priority,
    category: recommendation.category,
    action: recommendation.action,
    impact: recommendation.impact,
  };
}

function toSourceChip(source: { label: string; count: string }): SourceChip {
  return { label: source.label, count: source.count };
}

export function toAnalysisData(result: AnalysisResult): AnalysisViewData {
  return {
    overallScore: {
      score: result.overallScore.score,
      level: result.overallScore.level,
      description: result.overallScore.description,
      change: result.overallScore.change,
    },
    analysisSummary: {
      generatedAt: formatGeneratedAt(result.summary.generatedAt),
      paragraphs: result.summary.paragraphs,
      sources: result.summary.sources.map(toSourceChip),
    },
    metrics: result.metrics.map((metric) => ({ ...metric })),
    recommendations: result.recommendations.map(toRecommendation),
    riskHeatmap: result.heatmap,
    riskTrend: result.trend,
    keyFindings: result.keyFindings.map(toKeyFinding),
  };
}

export function toReportFindings(
  result: AnalysisResult,
  limit = 10,
): ReportFinding[] {
  return result.keyFindings.slice(0, limit).map((finding) => ({
    id: finding.id,
    title: finding.title,
    area: finding.category,
    severity: finding.severity,
    likelihood: finding.likelihood,
    exposure: finding.exposure,
  }));
}

export function severityCounts(result: AnalysisResult) {
  const counts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  for (const finding of result.keyFindings) {
    counts[finding.severity] = (counts[finding.severity] ?? 0) + 1;
  }
  const total = Math.max(
    1,
    result.keyFindings.length || result.metrics.reduce((sum, m) => sum + m.value, 0),
  );
  return (Object.keys(counts) as Array<"Critical" | "High" | "Medium" | "Low">)
    .map((severity) => ({
      severity,
      count: counts[severity],
      change: "",
      share: `${Math.round((counts[severity] / total) * 100)}%`,
      positive: severity === "Low" || severity === "Medium",
    }))
    .filter((entry) => entry.count > 0);
}
