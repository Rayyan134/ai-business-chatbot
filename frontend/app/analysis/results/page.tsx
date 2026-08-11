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

export default function AnalysisResultsPage() {
  return (
    <AppShell title="AI Analysis Results">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              AI Analysis Results
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generated {analysisSummary.generatedAt} · Meridian Bank
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RiskScoreCard score={overallScore} />
          <div className="lg:col-span-2">
            <ExecutiveSummary summary={analysisSummary} />
          </div>
        </div>

        <section
          aria-label="Risk metrics"
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              icon={metricIcons[metric.id]}
            />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RiskHeatmap rows={riskHeatmap} />
          </div>
          <Card className="lg:col-span-2">
            <CardHeader
              title="AI Recommendations"
              subtitle="Prioritized by estimated risk impact"
            />
            <div className="divide-y divide-border-subtle">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </Card>
        </div>

        <RiskTrendChart data={riskTrend} />

        <KeyFindingsTable findings={keyFindings} />

        <CopilotTrigger />
      </div>
    </AppShell>
  );
}
