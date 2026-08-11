import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import { Card, CardHeader } from "@/components/card";
import type { KeyFinding, Severity } from "@/lib/analysis-types";

const severityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

interface KeyFindingsTableProps {
  findings: KeyFinding[];
}

export function KeyFindingsTable({ findings }: KeyFindingsTableProps) {
  return (
    <Card>
      <CardHeader
        title="Key Findings"
        subtitle="AI-ranked findings across the uploaded documents"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Finding</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Severity</th>
              <th className="px-5 py-3 font-semibold">Likelihood</th>
              <th className="px-5 py-3 font-semibold">Exposure</th>
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
                  {finding.category}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={severityTone[finding.severity]}>
                    {finding.severity}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {finding.likelihood}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {finding.exposure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
