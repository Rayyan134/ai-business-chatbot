import { Sparkles } from "lucide-react";

interface ActionBarProps {
  enabled: boolean;
  uploadedCount: number;
  requiredCount: number;
  onAnalyze: () => void;
}

export function ActionBar({
  enabled,
  uploadedCount,
  requiredCount,
  onAnalyze,
}: ActionBarProps) {
  return (
    <div className="sticky bottom-0 -mx-4 border-t border-border-subtle bg-background/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {enabled ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              All required documents uploaded.
            </span>
          ) : (
            <>
              {uploadedCount} of {requiredCount} required documents uploaded
            </>
          )}
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!enabled}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 sm:w-auto ${
            enabled
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:brightness-110 active:scale-[0.98]"
              : "cursor-not-allowed bg-border-subtle text-muted-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Analyze Documents
        </button>
      </div>
    </div>
  );
}
