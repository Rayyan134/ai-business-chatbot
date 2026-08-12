"use client";

import { useState } from "react";
import { ResultsActionBar } from "@/components/analysis/results-action-bar";
import { CopilotPanel } from "@/components/copilot/copilot-panel";

interface CopilotTriggerProps {
  runId?: string | null;
  resultId?: string | null;
}

export function CopilotTrigger({
  runId = null,
  resultId = null,
}: CopilotTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ResultsActionBar
        onAskCopilot={() => setOpen(true)}
        runId={runId}
        resultId={resultId}
      />
      <CopilotPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
