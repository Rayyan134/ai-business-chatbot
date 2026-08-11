"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Loader2,
  Maximize,
  Minimize,
  Presentation,
  Printer,
  StickyNote,
} from "lucide-react";

type ActionState = "idle" | "generating" | "done";

const GENERATE_DURATION = 2000;
const DONE_DURATION = 4000;

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-wait disabled:opacity-70";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40";

interface PresentationToolbarProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  notesOpen: boolean;
  onToggleNotes: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PresentationToolbar({
  current,
  total,
  onPrevious,
  onNext,
  notesOpen,
  onToggleNotes,
  fullscreen,
  onToggleFullscreen,
}: PresentationToolbarProps) {
  const [pptxState, setPptxState] = useState<ActionState>("idle");
  const [pdfState, setPdfState] = useState<ActionState>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  function handleAction(
    state: ActionState,
    setState: (next: ActionState) => void,
  ) {
    if (state !== "idle") return;
    setState("generating");
    timersRef.current.push(
      setTimeout(() => setState("done"), GENERATE_DURATION),
      setTimeout(
        () => setState("idle"),
        GENERATE_DURATION + DONE_DURATION,
      ),
    );
  }

  return (
    <div className="sticky top-16 z-20 -mx-4 border-b border-border-subtle bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/analysis/results"
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </a>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-xs text-muted-foreground">
            {current} / {total}
          </span>
          <button
            type="button"
            onClick={onPrevious}
            disabled={current <= 1}
            className={iconButtonClass}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={current >= total}
            className={iconButtonClass}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleNotes}
            aria-pressed={notesOpen}
            className={`${buttonClass} ${notesOpen ? "bg-surface-elevated" : ""}`}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={buttonClass}
          >
            {fullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
            {fullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className={buttonClass}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={() => handleAction(pptxState, setPptxState)}
            disabled={pptxState !== "idle"}
            className={buttonClass}
          >
            {pptxState === "generating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : pptxState === "done" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Downloaded
              </>
            ) : (
              <>
                <Presentation className="h-4 w-4" />
                Download .pptx
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleAction(pdfState, setPdfState)}
            disabled={pdfState !== "idle"}
            className={buttonClass}
          >
            {pdfState === "generating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : pdfState === "done" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Downloaded
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
