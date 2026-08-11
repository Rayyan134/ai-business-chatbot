"use client";

import { Download, FileText, MessageSquare, Presentation } from "lucide-react";

interface ResultsActionBarProps {
  onAskCopilot?: () => void;
}

export function ResultsActionBar({ onAskCopilot }: ResultsActionBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-border-subtle bg-background/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <a
          href="/reports/preview"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
        >
          <FileText className="h-4 w-4" />
          Generate Word Report
        </a>
        <a
          href="/presentations/preview"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
        >
          <Presentation className="h-4 w-4" />
          Generate PowerPoint
        </a>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
        >
          <Download className="h-4 w-4" />
          Download Executive Summary
        </button>
        <button
          type="button"
          onClick={onAskCopilot}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          <MessageSquare className="h-4 w-4" />
          Ask Risk Copilot
        </button>
      </div>
    </div>
  );
}
