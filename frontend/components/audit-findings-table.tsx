import { ArrowUpRight } from "lucide-react";
import type { AuditFinding, FindingStatus, RiskLevel } from "@/lib/types";
import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { Card, CardHeader } from "@/components/card";

const riskTone: Record<RiskLevel, BadgeTone> = {
  High: "rose",
  Medium: "amber",
  Low: "emerald",
};

const statusTone: Record<FindingStatus, BadgeTone> = {
  Open: "amber",
  "In Progress": "blue",
  Closed: "emerald",
  Overdue: "rose",
};

function formatDueDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface AuditFindingsTableProps {
  findings: AuditFinding[];
}

export function AuditFindingsTable({ findings }: AuditFindingsTableProps) {
  return (
    <Card>
      <CardHeader
        title="Recent Audit Findings"
        subtitle="Latest GIA and internal audit findings"
        action={
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </a>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Finding</th>
              <th className="px-5 py-3 font-semibold">Division</th>
              <th className="px-5 py-3 font-semibold">Risk</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Owner</th>
              <th className="px-5 py-3 font-semibold">Due date</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => (
              <tr
                key={finding.id}
                className="border-b border-border-subtle last:border-b-0 hover:bg-surface-elevated"
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{finding.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {finding.id}
                  </p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {finding.division}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={riskTone[finding.riskLevel]}>
                    {finding.riskLevel}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone[finding.status]}>
                    {finding.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {finding.owner}
                </td>
                <td
                  className={`px-5 py-3 ${
                    finding.status === "Overdue"
                      ? "font-medium text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatDueDate(finding.dueDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
