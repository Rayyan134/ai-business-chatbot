import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";
import { severityTone, trendToneClass } from "@/lib/presentation-tone";

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function SlideTopRisks({ slide, index, total, meta }: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "top-risks") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      kicker="Top Risks"
      title="Five Highest Exposure Risks"
    >
      <ol className="space-y-2.5">
        {content.items.map((item) => {
          const TrendIcon = trendIcon[item.trend];
          return (
            <li
              key={item.rank}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated/50 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.division} · {item.likelihood} likelihood · {item.impact}{" "}
                  impact
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {item.score}
                </p>
                <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 ${trendToneClass[item.trend]}`} />
                  vs June
                </p>
              </div>
              <Badge
                tone={severityTone[item.severity]}
                className="shrink-0"
              >
                {item.severity}
              </Badge>
            </li>
          );
        })}
      </ol>
    </SlideFrame>
  );
}
