"use client";

import { useState } from "react";
import { ResultsActionBar } from "@/components/analysis/results-action-bar";
import { CopilotPanel } from "@/components/copilot/copilot-panel";

export function CopilotTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ResultsActionBar onAskCopilot={() => setOpen(true)} />
      <CopilotPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
