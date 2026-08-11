import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import type { RiskScoreInfo, Severity } from "@/lib/report-types";

const levelTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

interface RiskScoreSectionProps {
  data: RiskScoreInfo;
}

export function RiskScoreSection({ data }: RiskScoreSectionProps) {
  const maxScore = Math.max(...data.history.map((point) => point.score));

  return (
    <ReportSection
      number="4"
      title="Risk Score"
      description="Overall operational risk score for the period and its trajectory."
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums text-foreground">
            {data.score}
          </p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            out of 100
          </p>
        </div>
        <div className="space-y-1">
          <Badge tone={levelTone[data.level]}>{data.level} risk</Badge>
          <p className="text-xs text-muted-foreground">{data.change}</p>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          {data.description}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-foreground">Score history</p>
        <div className="mt-3 flex items-end gap-4">
          {data.history.map((point) => (
            <div
              key={point.period}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-xs font-medium text-foreground">
                {point.score}
              </span>
              <div
                className="w-full rounded-t bg-primary/80"
                style={{
                  height: `${Math.max(8, (point.score / maxScore) * 96)}px`,
                }}
              />
              <span className="text-[11px] text-muted-foreground">
                {point.period}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ReportSection>
  );
}
