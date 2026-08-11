"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";

type ActionState = "idle" | "generating" | "done";

const GENERATE_DURATION = 2000;
const DONE_DURATION = 4000;

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-wait disabled:opacity-70";

export function ReportToolbar() {
  const [docxState, setDocxState] = useState<ActionState>("idle");
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
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border-subtle bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/analysis/results"
          className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </a>
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => handleAction(docxState, setDocxState)}
            disabled={docxState !== "idle"}
            className={buttonClass}
          >
            {docxState === "generating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : docxState === "done" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Downloaded
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Download .docx
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
