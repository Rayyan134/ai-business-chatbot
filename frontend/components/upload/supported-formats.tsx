import {
  Check,
  FileSpreadsheet,
  FileText,
  FileType,
  Table,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/card";

const formats: Array<{ icon: LucideIcon; label: string }> = [
  { icon: FileSpreadsheet, label: "Excel" },
  { icon: FileText, label: "PDF" },
  { icon: FileType, label: "Word" },
  { icon: Table, label: "CSV" },
];

const aiSupports = [
  "Risk Registers",
  "Audit Reports",
  "Exceptions",
  "Policies",
  "MIS Reports",
];

export function SupportedFormats() {
  return (
    <Card>
      <CardHeader
        title="Supported Formats"
        subtitle="File types accepted by the analysis pipeline"
      />
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {formats.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-3 transition-colors hover:border-primary/30"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-border-subtle pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI supports
          </p>
          <ul className="mt-3 space-y-2">
            {aiSupports.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
