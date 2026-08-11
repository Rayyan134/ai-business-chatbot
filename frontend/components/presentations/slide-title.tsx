import { Badge } from "@/components/badge";
import { SlideFrame } from "@/components/presentations/presentation-slide";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";

export function SlideTitle({ slide, index, total, meta }: SlideComponentProps) {
  const content = slide.content;
  if (content.kind !== "title") return null;

  return (
    <SlideFrame
      meta={meta}
      index={index}
      total={total}
      centered
      accent
    >
      <div className="flex flex-col items-center gap-3">
        <Badge tone="slate">{meta.classification}</Badge>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {meta.bankName}
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {content.title}
        </h1>
        <p className="text-base text-muted-foreground">{content.subtitle}</p>
        <div className="mt-4 flex flex-col items-center gap-1 text-sm text-muted-foreground">
          <p>Prepared for {content.preparedFor}</p>
          <p>{content.presenter}</p>
          <p>{content.date}</p>
        </div>
      </div>
    </SlideFrame>
  );
}
