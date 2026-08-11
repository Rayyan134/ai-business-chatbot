import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import type { Recommendation, Severity } from "@/lib/analysis-types";

const priorityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={priorityTone[recommendation.priority]}>
          {recommendation.priority}
        </Badge>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {recommendation.category}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        {recommendation.action}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          Estimated impact:{" "}
        </span>
        {recommendation.impact}
      </p>
    </div>
  );
}
