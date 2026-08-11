import type { Suggestion } from "@/lib/copilot-data";

interface SuggestedPromptsProps {
  prompts: Suggestion[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({
  prompts,
  onSelect,
  disabled,
}: SuggestedPromptsProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Suggested questions
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelect(prompt.label)}
            disabled={disabled}
            className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
