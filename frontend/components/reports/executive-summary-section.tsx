import type { ExecutiveSummaryData } from "@/lib/report-types";
import { ReportSection } from "@/components/reports/report-section";

const statTone: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  blue: "text-blue-600 dark:text-blue-400",
};

interface ExecutiveSummarySectionProps {
  data: ExecutiveSummaryData;
}

export function ExecutiveSummarySection({
  data,
}: ExecutiveSummarySectionProps) {
  return (
    <ReportSection
      number="1"
      title="Executive Summary"
      description="Overview of the bank's operational risk position for the reporting period."
    >
      <div className="space-y-3 text-sm leading-relaxed text-foreground">
        {data.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-subtle px-4 py-3"
          >
            <p
              className={`text-2xl font-bold tabular-nums ${statTone[stat.tone] ?? "text-foreground"}`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}
