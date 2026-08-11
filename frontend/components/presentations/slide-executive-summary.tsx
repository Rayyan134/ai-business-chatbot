import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";
import { statToneClass } from "@/lib/presentation-tone";

export function SlideExecutiveSummary({
  slide,
  index,
  total,
  meta,
}: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "executive-summary") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      kicker="Executive Summary"
      title="Operational Risk Position at a Glance"
    >
      <p className="text-sm leading-relaxed text-foreground">
        {content.paragraph}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {content.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-subtle bg-surface-elevated/50 px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${statToneClass[stat.tone]}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2">
        {content.bullets.map((bullet, bulletIndex) => (
          <li
            key={bulletIndex}
            className="flex items-start gap-2.5 text-sm text-foreground"
          >
            <span className="mt-0.5 text-primary">•</span>
            <span
              className={
                bullet.tone === "highlight"
                  ? "font-semibold text-rose-600 dark:text-rose-400"
                  : ""
              }
            >
              {bullet.text}
            </span>
          </li>
        ))}
      </ul>
    </SlideFrame>
  );
}
