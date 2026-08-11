import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";
import type { ManagementAction, Severity } from "@/lib/report-types";

const priorityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

const statusTone: Record<string, BadgeTone> = {
  "Not started": "amber",
  "In Progress": "blue",
  Completed: "emerald",
};

interface ManagementActionsSectionProps {
  data: ManagementAction[];
}

export function ManagementActionsSection({
  data,
}: ManagementActionsSectionProps) {
  return (
    <ReportSection
      number="9"
      title="Management Actions"
      description="Action items assigned to management to address the findings and recommendations in this report."
    >
      <ReportTable
        columns={[
          {
            header: "Action",
            render: (row) => (
              <span className="font-medium text-foreground">{row.action}</span>
            ),
          },
          { header: "Owner", render: (row) => row.owner },
          { header: "Department", render: (row) => row.department },
          { header: "Due date", render: (row) => row.dueDate },
          {
            header: "Priority",
            render: (row) => (
              <Badge tone={priorityTone[row.priority]}>{row.priority}</Badge>
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
        ]}
        rows={data}
      />
    </ReportSection>
  );
}
