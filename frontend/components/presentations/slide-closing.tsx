import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";

export function SlideClosing({ slide, index, total, meta }: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "closing") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      centered
      accent
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge tone="slate">{meta.deckTitle} · {meta.period}</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {content.title}
        </h1>
        <p className="text-base text-muted-foreground">{content.subtitle}</p>

        <div className="mt-5 w-full max-w-xl rounded-lg border border-border-subtle bg-surface-elevated/50 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next steps
          </p>
          <ul className="mt-3 space-y-2">
            {content.nextSteps.map((step) => (
              <li key={step} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{content.contact}</p>
      </div>
    </SlideFrame>
  );
}
