import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";
import type { ReportAuditFinding } from "@/lib/report-types";

const ratingTone: Record<string, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

const statusTone: Record<string, BadgeTone> = {
  Open: "amber",
  "In Progress": "blue",
  Closed: "emerald",
  Overdue: "rose",
};

interface AuditFindingsSectionProps {
  data: ReportAuditFinding[];
}

export function AuditFindingsSection({ data }: AuditFindingsSectionProps) {
  return (
    <ReportSection
      number="6"
      title="Audit Findings"
      description="Open GIA and internal audit findings with owners and due dates."
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
          { header: "Division", render: (row) => row.division },
          {
            header: "Rating",
            render: (row) => (
              <Badge tone={ratingTone[row.rating] ?? "slate"}>
                {row.rating}
              </Badge>
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
          { header: "Due date", render: (row) => row.dueDate },
          { header: "Owner", render: (row) => row.owner },
        ]}
        rows={data}
      />
    </ReportSection>
  );
}
