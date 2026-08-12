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
import { ApiError, downloadExport } from "@/lib/api-client";

type ActionState = "idle" | "generating" | "done";

const GENERATE_DURATION = 2000;
const DONE_DURATION = 4000;

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-wait disabled:opacity-70";

interface ReportToolbarProps {
  runId?: string | null;
  resultId?: string | null;
}

export function ReportToolbar({
  runId = null,
  resultId = null,
}: ReportToolbarProps) {
  const [docxState, setDocxState] = useState<ActionState>("idle");
  const [pdfState, setPdfState] = useState<ActionState>("idle");
  const [docxError, setDocxError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hasExportTarget = Boolean(runId || resultId);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  function handleSimulated(
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

  async function handleDocxDownload() {
    if (docxState !== "idle") return;
    setDocxState("generating");
    setDocxError(null);
    try {
      await downloadExport("word", { runId, resultId });
      setDocxState("done");
      timersRef.current.push(
        setTimeout(() => setDocxState("idle"), DONE_DURATION),
      );
    } catch (error) {
      setDocxState("idle");
      setDocxError(
        error instanceof ApiError
          ? error.message
          : "Report download failed. Please try again.",
      );
    }
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
            onClick={() => void handleDocxDownload()}
            disabled={docxState !== "idle"}
            title={
              hasExportTarget
                ? "Download the generated .docx report"
                : "No analysis result to export. Run an analysis first."
            }
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
            onClick={() => handleSimulated(pdfState, setPdfState)}
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
      {docxError ? (
        <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">
          {docxError}
        </p>
      ) : null}
      {!hasExportTarget ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Open this report from an analysis result to download the generated
          file. Preview content shown here is sample data.
        </p>
      ) : null}
    </div>
  );
}
