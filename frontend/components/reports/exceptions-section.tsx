import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportException, Severity } from "@/lib/report-types";

const severityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

const statusTone: Record<string, BadgeTone> = {
  Open: "amber",
  Approved: "emerald",
  Closed: "emerald",
  Overdue: "rose",
};

interface ExceptionsSectionProps {
  data: ReportException[];
}

export function ExceptionsSection({ data }: ExceptionsSectionProps) {
  return (
    <ReportSection
      number="7"
      title="Exceptions"
      description="Active exceptions raised during the period, including items exceeding reporting thresholds."
    >
      <ReportTable
        columns={[
          {
            header: "Ref",
            render: (row) => (
              <span className="font-mono text-xs text-muted-foreground">
                {row.id}
              </span>
            ),
          },
          {
            header: "Description",
            render: (row) => (
              <span className="font-medium text-foreground">
                {row.description}
              </span>
            ),
          },
          { header: "Division", render: (row) => row.division },
          { header: "Raised", render: (row) => row.raisedDate },
          {
            header: "Severity",
            render: (row) => (
              <Badge tone={severityTone[row.severity]}>{row.severity}</Badge>
            ),
          },
          {
            header: "Status",
            render: (row) => (
              <Badge tone={statusTone[row.status] ?? "slate"}>
                {row.status}
              </Badge>
            ),
          },
          {
            header: "Days open",
            render: (row) => (
              <span
                className={
                  row.status === "Overdue"
                    ? "font-medium text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                }
              >
                {row.daysOpen}
              </span>
            ),
          },
          { header: "Owner", render: (row) => row.owner },
        ]}
        rows={data}
      />
    </ReportSection>
  );
}
