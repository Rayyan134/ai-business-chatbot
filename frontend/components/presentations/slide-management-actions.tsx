import { Target } from "lucide-react";
import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";
import { ReportTable } from "@/components/reports/report-table";
import { severityTone, statusTone } from "@/lib/presentation-tone";

export function SlideManagementActions({
  slide,
  index,
  total,
  meta,
}: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "management-actions") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      kicker="Management Actions"
      title="Required Actions and Decisions"
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
          { header: "Dept", render: (row) => row.department },
          { header: "Due", render: (row) => row.dueDate },
          {
            header: "Priority",
            render: (row) => (
              <Badge tone={severityTone[row.priority]}>{row.priority}</Badge>
            ),
          },
          {
            header: "Status",
            render: (row) => (
              <Badge tone={statusTone[row.status] ?? "slate"}>{row.status}</Badge>
            ),
          },
        ]}
        rows={content.actions}
      />

      <div className="mt-4 rounded-lg border border-border-subtle bg-surface-elevated/50 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Target className="h-4 w-4 text-primary" />
          Decisions required from the Board
        </p>
        <ul className="mt-3 space-y-2">
          {content.decisions.map((decision) => (
            <li key={decision.decision} className="text-sm text-foreground">
              <span className="font-medium">{decision.decision}</span>
              <span className="text-muted-foreground">
                {" "}
                — {decision.owner}, by {decision.target}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  );
}
