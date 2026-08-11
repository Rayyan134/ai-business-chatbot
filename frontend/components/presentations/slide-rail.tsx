"use client";

import type { DeckSlide } from "@/lib/presentation-types";

interface SlideRailProps {
  slides: DeckSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function SlideRail({ slides, activeIndex, onSelect }: SlideRailProps) {
  return (
    <nav
      aria-label="Slide navigation"
      className="hidden w-48 shrink-0 space-y-3 lg:block"
    >
      {slides.map((slide, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={active ? "true" : undefined}
            className={`w-full rounded-lg border p-2 text-left transition-colors ${
              active
                ? "border-primary bg-surface ring-2 ring-primary/30"
                : "border-border-subtle bg-surface hover:bg-surface-elevated"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-semibold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {slide.shortTitle}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="mt-2 block h-9 rounded bg-surface-elevated p-1.5"
            >
              <span className="block h-1.5 w-8 rounded-full bg-primary/40" />
              <span className="mt-1.5 block h-1 w-10 rounded-full bg-muted-foreground/30" />
              <span className="mt-1.5 block h-1 w-7 rounded-full bg-muted-foreground/20" />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
