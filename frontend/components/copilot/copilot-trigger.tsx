"use client";

import { useState } from "react";
import { ResultsActionBar } from "@/components/analysis/results-action-bar";
import { CopilotPanel } from "@/components/copilot/copilot-panel";
import type { AnalysisResult } from "@/lib/analysis-api-types";

interface CopilotTriggerProps {
  runId?: string | null;
  resultId?: string | null;
  analysisResult?: AnalysisResult | null;
}

export function CopilotTrigger({
  runId = null,
  resultId = null,
  analysisResult = null,
}: CopilotTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ResultsActionBar
        onAskCopilot={() => setOpen(true)}
        runId={runId}
        resultId={resultId}
      />
      <CopilotPanel
        open={open}
        onClose={() => setOpen(false)}
        runId={runId}
        resultId={resultId}
        analysisResult={analysisResult}
      />
    </>
  );
}
