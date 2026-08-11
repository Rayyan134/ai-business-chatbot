import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { Card, CardHeader } from "@/components/card";
import type { OverallScore } from "@/lib/analysis-types";

const ARC_RADIUS = 80;
const ARC_LENGTH = Math.PI * ARC_RADIUS;

function scoreTone(score: number): BadgeTone {
  if (score >= 67) return "rose";
  if (score >= 34) return "amber";
  return "emerald";
}

interface RiskScoreCardProps {
  score: OverallScore;
}

export function RiskScoreCard({ score }: RiskScoreCardProps) {
  const arcOffset = ARC_LENGTH - (score.score / 100) * ARC_LENGTH;

  return (
    <Card>
      <CardHeader
        title="Overall Risk Score"
        subtitle="Computed from 73 uploaded documents"
      />
      <div className="flex flex-col items-center px-5 py-6">
        <div className="relative w-64">
          <svg viewBox="0 0 200 112" className="w-full">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--risk-high)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={ARC_LENGTH}
              strokeDashoffset={arcOffset}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-5xl font-bold tabular-nums text-foreground">
              {score.score}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              out of 100
            </p>
          </div>
        </div>
        <Badge tone={scoreTone(score.score)} className="mt-5">
          {score.level} risk
        </Badge>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {score.description}
        </p>
        <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {score.change}
        </p>
      </div>
    </Card>
  );
}
