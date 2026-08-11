import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";
import { severityTone } from "@/lib/presentation-tone";

const TOTAL_RISKS = 351;
const MAX_SCORE = 100;

export function SlideRiskLandscape({
  slide,
  index,
  total,
  meta,
}: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "risk-landscape") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      kicker="Risk Landscape"
      title="Where Exposure Sits"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overall risk score
          </p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums text-foreground">
              {content.score}
            </span>
            <div className="pb-1">
              <Badge tone={severityTone[content.level]}>
                {content.level} risk
              </Badge>
              <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {content.change}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2.5">
          {content.distribution.map((row) => (
            <div key={row.severity} className="flex items-center gap-3">
              <Badge tone={severityTone[row.severity]} className="w-24 justify-center">
                {row.severity}
              </Badge>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className={`h-full rounded-full ${
                    row.severity === "Critical"
                      ? "bg-rose-500"
                      : row.severity === "High"
                        ? "bg-amber-500"
                        : row.severity === "Medium"
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.round((row.count / TOTAL_RISKS) * 100)}%`,
                  }}
                />
              </div>
              <div className="w-24 text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {row.count}
                </p>
                <p className="text-[11px] text-muted-foreground">{row.share}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Score trend (Feb — Jul)
          </p>
          <div className="mt-3 flex h-28 items-end gap-2">
            {content.trend.map((point) => (
              <div
                key={point.period}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {point.score}
                </span>
                <div
                  className="w-full rounded-t bg-primary/70"
                  style={{
                    height: `${(point.score / MAX_SCORE) * 100}%`,
                    minHeight: "6px",
                  }}
                />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {point.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Highest exposure areas
          </p>
          <ul className="mt-3 space-y-2">
            {content.exposureAreas.map((area) => (
              <li
                key={area}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <span className="mt-0.5 text-primary">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}
