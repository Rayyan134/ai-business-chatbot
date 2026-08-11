import { BrainCircuit, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/badge";
import type { BadgeTone } from "@/components/badge";
import type { CopilotMessage } from "@/lib/copilot-data";

function confidenceTone(confidence: number): BadgeTone {
  if (confidence >= 80) return "emerald";
  if (confidence >= 60) return "amber";
  return "rose";
}

interface ChatMessageProps {
  message: CopilotMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasSources = (message.sources?.length ?? 0) > 0;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-surface-elevated"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isUser ? (
          <span className="text-xs font-semibold text-muted-foreground">
            SC
          </span>
        ) : (
          <BrainCircuit className="h-4 w-4" />
        )}
      </div>

      <div
        className={`min-w-0 max-w-[85%] ${
          isUser ? "flex flex-col items-end" : ""
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-surface-elevated text-foreground"
          }`}
        >
          <p className="whitespace-pre-line">{message.content}</p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 px-1">
          <span
            suppressHydrationWarning
            className="text-[11px] text-muted-foreground"
          >
            {message.timestamp}
          </span>
          {message.role === "assistant" &&
          message.confidence !== undefined ? (
            <Badge
              tone={confidenceTone(message.confidence)}
              className="gap-0.5 px-2 py-0 text-[10px]"
            >
              <ShieldCheck className="h-3 w-3" />
              {message.confidence}% confidence
            </Badge>
          ) : null}
        </div>

        {message.role === "assistant" && hasSources ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sources
            </span>
            {message.sources?.map((source) => (
              <span
                key={source}
                className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-inset ring-border-subtle"
              >
                {source}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
