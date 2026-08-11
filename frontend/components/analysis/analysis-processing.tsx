"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import { CircularProgress } from "@/components/analysis/circular-progress";
import { ProcessingChecklist } from "@/components/analysis/processing-checklist";

const STEPS = [
  "Reading Risk Register",
  "Reading Audit Findings",
  "Reading Exception Log",
  "Extracting Key Risks",
  "Detecting High-Risk Findings",
  "Comparing Historical Trends",
  "Generating Executive Summary",
  "Preparing Recommendations",
  "Building Executive Dashboard",
] as const;

const TOTAL_DURATION = 7600;
const COMPLETION_DELAY = 900;

export function AnalysisProcessing() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    function tick() {
      const elapsed = Date.now() - startedAt;
      const t = Math.min(1, elapsed / TOTAL_DURATION);
      const eased = 1 - Math.pow(1 - t, 2);

      setProgress(Math.round(eased * 100));

      const activeIndex = Math.min(
        STEPS.length - 1,
        Math.floor(eased * STEPS.length),
      );
      setCurrent(eased >= 1 ? STEPS.length : activeIndex);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        completionTimer = setTimeout(
          () => router.push("/analysis/results"),
          COMPLETION_DELAY,
        );
      }
    }

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, [router]);

  const activeLabel =
    current < STEPS.length ? STEPS[current] : "Finalizing executive dashboard";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-2xl bg-primary/20"
          />
          <span
            aria-hidden
            className="absolute -inset-4 rounded-full border border-primary/15"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25">
            <BrainCircuit className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-foreground">
          Analyzing Operational Risk Documents
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          AI is reviewing uploaded documents and generating executive insights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface px-6 py-10 shadow-sm">
          <CircularProgress value={progress} size={200} strokeWidth={12}>
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums text-foreground">
                {progress}%
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                Complete
              </p>
            </div>
          </CircularProgress>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Currently:{" "}
            <span className="font-medium text-foreground">{activeLabel}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This may take up to a minute · do not close the page
          </p>
        </div>

        <ProcessingChecklist steps={STEPS} current={current} />
      </div>
    </div>
  );
}
