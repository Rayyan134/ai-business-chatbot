import { Target } from "lucide-react";
import type { BoardSummaryData } from "@/lib/report-types";
import { ReportSection } from "@/components/reports/report-section";
import { ReportTable } from "@/components/reports/report-table";

interface BoardSummarySectionProps {
  data: BoardSummaryData;
}

export function BoardSummarySection({ data }: BoardSummarySectionProps) {
  return (
    <ReportSection
      number="2"
      title="Board-Level Summary"
      description="Key messages and decisions required by senior management."
    >
      <div className="space-y-3 text-sm leading-relaxed text-foreground">
        {data.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {data.keyMessages.map((message) => (
          <li
            key={message}
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{message}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-foreground">
          Decisions required
        </p>
        <ReportTable
          columns={[
            {
              header: "Decision",
              render: (decision) => (
                <span className="font-medium text-foreground">
                  {decision.decision}
                </span>
              ),
            },
            { header: "Owner", render: (decision) => decision.owner },
            { header: "Target", render: (decision) => decision.target },
          ]}
          rows={data.decisions}
        />
      </div>
    </ReportSection>
  );
}
