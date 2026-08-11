import { Fragment } from "react";
import { Card, CardHeader } from "@/components/card";
import type { HeatmapLevel, HeatmapRow } from "@/lib/analysis-types";

const LEVEL_CLASSES: Record<HeatmapLevel, string> = {
  0: "bg-border-subtle/70",
  1: "bg-emerald-200/80 dark:bg-emerald-500/20",
  2: "bg-amber-200/90 dark:bg-amber-500/25",
  3: "bg-orange-300 dark:bg-orange-500/35",
  4: "bg-rose-400 dark:bg-rose-500/45",
};

const LEVEL_LABELS = ["None", "Low", "Medium", "High", "Critical"];

interface RiskHeatmapProps {
  rows: HeatmapRow[];
}

export function RiskHeatmap({ rows }: RiskHeatmapProps) {
  const categories = rows[0]?.cells.map((cell) => cell.category) ?? [];

  return (
    <Card>
      <CardHeader
        title="Risk Heatmap"
        subtitle="Exposure by division and risk category"
      />
      <div className="px-5 py-5">
        <div className="grid grid-cols-[7rem_repeat(5,1fr)] gap-2">
          <div />
          {categories.map((category) => (
            <p
              key={category}
              className="mb-1 text-center text-xs font-medium text-muted-foreground"
            >
              {category}
            </p>
          ))}
          {rows.map((row) => (
            <Fragment key={row.division}>
              <p className="flex items-center pr-3 text-xs font-medium text-foreground">
                {row.division}
              </p>
              {row.cells.map((cell) => (
                <div
                  key={cell.category}
                  title={`${row.division} · ${cell.category} · ${LEVEL_LABELS[cell.level]}`}
                  className={`flex h-11 items-center justify-center rounded-lg text-xs font-semibold ${LEVEL_CLASSES[cell.level]}`}
                >
                  {LEVEL_LABELS[cell.level].charAt(0)}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {LEVEL_LABELS.map((label, index) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className={`h-3 w-3 rounded ${LEVEL_CLASSES[index as HeatmapLevel]}`}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
