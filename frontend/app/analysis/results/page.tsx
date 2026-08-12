import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ExecutiveSummary } from "@/components/analysis/executive-summary";
import { KeyFindingsTable } from "@/components/analysis/key-findings-table";
import { MetricCard } from "@/components/analysis/metric-card";
import { RecommendationCard } from "@/components/analysis/recommendation-card";
import { RiskHeatmap } from "@/components/analysis/risk-heatmap";
import { RiskScoreCard } from "@/components/analysis/risk-score-card";
import { RiskTrendChart } from "@/components/analysis/risk-trend-chart";
import { CopilotTrigger } from "@/components/copilot/copilot-trigger";
import { Card, CardHeader } from "@/components/card";
import {
  analysisSummary,
  keyFindings,
  metrics,
  overallScore,
  recommendations,
  riskHeatmap,
  riskTrend,
} from "@/lib/analysis-data";
import { toAnalysisData } from "@/lib/analysis-adapter";
import { resolveAnalysisSource } from "@/lib/analysis-flow";

export const metadata: Metadata = {
  title: "AI Analysis Results · Risk Copilot",
  description:
    "AI-generated operational risk analysis results for Meridian Bank.",
};

const metricIcons: Record<string, React.ReactNode> = {
  "high-risks": <Flame className="h-4 w-4 text-rose-500 dark:text-rose-400" />,
  "medium-risks": (
    <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
  ),
  "low-risks": (
    <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
  ),
  "critical-findings": (
    <Target className="h-4 w-4 text-rose-500 dark:text-rose-400" />
  ),
};

export default async function AnalysisResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ runId?: string; resultId?: string }>;
}) {
  const params = await searchParams;
  const source = await resolveAnalysisSource({
    runId: params.runId ?? null,
    resultId: params.resultId ?? null,
  });

  const view =
    source.kind === "real" ? toAnalysisData(source.result) : null;
  const warnings =
    source.kind === "real" ? source.result.warnings : null;

  const display = view ?? {
    overallScore,
    analysisSummary,
    metrics,
    recommendations,
    riskHeatmap,
    riskTrend,
    keyFindings,
  };

  return (
    <AppShell title="AI Analysis Results">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              AI Analysis Results
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generated {display.analysisSummary.generatedAt} · Meridian Bank
            </p>
          </div>
          <a
            href="/upload"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated sm:self-auto"
          >
            New analysis
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {warnings && warnings.length > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              {warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RiskScoreCard score={display.overallScore} />
          <div className="lg:col-span-2">
            <ExecutiveSummary summary={display.analysisSummary} />
          </div>
        </div>

        <section
          aria-label="Risk metrics"
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          {display.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              icon={metricIcons[metric.id]}
            />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RiskHeatmap rows={display.riskHeatmap} />
          </div>
          <Card className="lg:col-span-2">
            <CardHeader
              title="AI Recommendations"
              subtitle="Prioritized by estimated risk impact"
            />
            <div className="divide-y divide-border-subtle">
              {display.recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </Card>
        </div>

        <RiskTrendChart data={display.riskTrend} />

        <KeyFindingsTable findings={display.keyFindings} />

        <CopilotTrigger
          runId={params.runId ?? null}
          resultId={source.kind === "real" ? source.result.id : null}
        />
      </div>
    </AppShell>
  );
}
