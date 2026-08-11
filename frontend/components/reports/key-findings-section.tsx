import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportFinding, Severity } from "@/lib/report-types";

const severityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

interface KeyFindingsSectionProps {
  data: ReportFinding[];
}

export function KeyFindingsSection({ data }: KeyFindingsSectionProps) {
  return (
    <ReportSection
      number="5"
      title="Key Findings"
      description="AI-ranked findings across the uploaded documents, ordered by severity."
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
            header: "Finding",
            render: (row) => (
              <span className="font-medium text-foreground">{row.title}</span>
            ),
          },
          { header: "Area", render: (row) => row.area },
          {
            header: "Severity",
            render: (row) => (
              <Badge tone={severityTone[row.severity]}>{row.severity}</Badge>
            ),
          },
          { header: "Likelihood", render: (row) => row.likelihood },
          { header: "Exposure", render: (row) => row.exposure },
        ]}
        rows={data}
      />
    </ReportSection>
  );
}
