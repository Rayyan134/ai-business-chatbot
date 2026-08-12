"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DeckSlide, PresentationMeta } from "@/lib/presentation-types";
import { PresentationShell } from "@/components/presentations/presentation-shell";
import { PresentationToolbar } from "@/components/presentations/presentation-toolbar";
import { SlideAuditFindings } from "@/components/presentations/slide-audit-findings";
import { SlideClosing } from "@/components/presentations/slide-closing";
import { SlideExecutiveSummary } from "@/components/presentations/slide-executive-summary";
import { SlideManagementActions } from "@/components/presentations/slide-management-actions";
import { SlideRail } from "@/components/presentations/slide-rail";
import { SlideRiskLandscape } from "@/components/presentations/slide-risk-landscape";
import { SlideTitle } from "@/components/presentations/slide-title";
import { SlideTopRisks } from "@/components/presentations/slide-top-risks";
import type { SlideComponentProps } from "@/components/presentations/presentation-slide";

interface SlideViewerProps {
  slides: DeckSlide[];
  meta: PresentationMeta;
  runId?: string | null;
  resultId?: string | null;
}

function renderSlide({ slide, index, total, meta }: SlideComponentProps) {
  switch (slide.content.kind) {
    case "title":
      return <SlideTitle slide={slide} index={index} total={total} meta={meta} />;
    case "executive-summary":
      return (
        <SlideExecutiveSummary
          slide={slide}
          index={index}
          total={total}
          meta={meta}
        />
      );
    case "risk-landscape":
      return (
        <SlideRiskLandscape slide={slide} index={index} total={total} meta={meta} />
      );
    case "top-risks":
      return <SlideTopRisks slide={slide} index={index} total={total} meta={meta} />;
    case "audit-findings":
      return (
        <SlideAuditFindings slide={slide} index={index} total={total} meta={meta} />
      );
    case "management-actions":
      return (
        <SlideManagementActions
          slide={slide}
          index={index}
          total={total}
          meta={meta}
        />
      );
    case "closing":
      return <SlideClosing slide={slide} index={index} total={total} meta={meta} />;
  }
}

export function SlideViewer({
  slides,
  meta,
  runId = null,
  resultId = null,
}: SlideViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(Math.max(index, 0), total - 1));
    },
    [total],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        setActiveIndex((index) => Math.min(index + 1, total - 1));
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "Home") {
        setActiveIndex(0);
      } else if (event.key === "End") {
        setActiveIndex(total - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(document.fullscreenElement !== null);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  const active = slides[activeIndex];

  return (
    <div className="space-y-4">
      <PresentationToolbar
        current={activeIndex + 1}
        total={total}
        onPrevious={() => goTo(activeIndex - 1)}
        onNext={() => goTo(activeIndex + 1)}
        notesOpen={notesOpen}
        onToggleNotes={() => setNotesOpen((open) => !open)}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        runId={runId}
        resultId={resultId}
      />

      <div className="flex items-start gap-4">
        <SlideRail slides={slides} activeIndex={activeIndex} onSelect={goTo} />

        <div className="relative min-w-0 flex-1">
          <PresentationShell>
            {renderSlide({ slide: active, index: activeIndex, total, meta })}
          </PresentationShell>

          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex <= 0}
            aria-label="Previous slide"
            className="absolute left-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground shadow-md transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex >= total - 1}
            aria-label="Next slide"
            className="absolute right-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground shadow-md transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {notesOpen ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Presenter notes — Slide {activeIndex + 1} of {total}
          </p>
          <p className="mt-2 text-sm text-foreground">
            {active.notes ?? "No presenter notes for this slide."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
