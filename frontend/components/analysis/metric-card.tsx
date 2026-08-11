import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/card";
import type { AnalysisMetric } from "@/lib/analysis-types";

interface MetricCardProps {
  metric: AnalysisMetric;
  icon?: ReactNode;
}

export function MetricCard({ metric, icon }: MetricCardProps) {
  const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
  const trendClass = metric.positive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </p>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
        {metric.value}
      </p>
      <p
        className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trendClass}`}
      >
        <TrendIcon className="h-3.5 w-3.5" />
        {metric.change}
      </p>
    </Card>
  );
}
