import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";
import type { RiskOverviewData, Severity } from "@/lib/report-types";

const severityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

interface RiskOverviewSectionProps {
  data: RiskOverviewData;
}

export function RiskOverviewSection({ data }: RiskOverviewSectionProps) {
  return (
    <ReportSection
      number="3"
      title="Risk Overview"
      description="Distribution of open risks across the portfolio by severity, with the six-month trend."
    >
      <ReportTable
        columns={[
          {
            header: "Severity",
            render: (row) => (
              <Badge tone={severityTone[row.severity]}>
                {row.severity}
              </Badge>
            ),
          },
          {
            header: "Count",
            render: (row) => (
              <span className="font-medium text-foreground">{row.count}</span>
            ),
          },
          {
            header: "Change (MoM)",
            render: (row) => (
              <span
                className={
                  row.positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }
              >
                {row.change}
              </span>
            ),
          },
          {
            header: "Share",
            render: (row) => (
              <span className="text-muted-foreground">{row.share}</span>
            ),
          },
        ]}
        rows={data.distribution}
      />

      <h3 className="mt-6 text-sm font-semibold text-foreground">
        Risk trend · last six months
      </h3>
      <div className="mt-2">
        <ReportTable
          columns={[
            {
              header: "Period",
              render: (row) => (
                <span className="font-medium text-foreground">
                  {row.period}
                </span>
              ),
            },
            { header: "High", render: (row) => row.high },
            { header: "Medium", render: (row) => row.medium },
            { header: "Low", render: (row) => row.low },
          ]}
          rows={data.trends}
        />
      </div>

      <h3 className="mt-6 text-sm font-semibold text-foreground">
        Highest exposure areas
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {data.exposureAreas.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>
    </ReportSection>
  );
}
