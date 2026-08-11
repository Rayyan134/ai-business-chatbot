import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";
import { ReportTable } from "@/components/reports/report-table";
import { severityTone, statusTone } from "@/lib/presentation-tone";

export function SlideAuditFindings({
  slide,
  index,
  total,
  meta,
}: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "audit-findings") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      kicker="Audit Findings"
      title="Open Findings by Division"
    >
      <ReportTable
        columns={[
          {
            header: "Finding",
            render: (row) => (
              <div>
                <span className="font-mono text-xs text-muted-foreground">
                  {row.id}
                </span>
                <p className="font-medium text-foreground">{row.title}</p>
              </div>
            ),
          },
          { header: "Division", render: (row) => row.division },
          {
            header: "Rating",
            render: (row) => (
              <Badge tone={severityTone[row.rating]}>{row.rating}</Badge>
            ),
          },
          {
            header: "Status",
            render: (row) => (
              <Badge tone={statusTone[row.status] ?? "slate"}>{row.status}</Badge>
            ),
          },
          { header: "Due", render: (row) => row.dueDate },
        ]}
        rows={content.findings}
      />
    </SlideFrame>
  );
}
