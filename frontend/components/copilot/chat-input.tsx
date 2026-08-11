"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border-subtle px-4 py-4"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about risks, findings, exceptions…"
          disabled={disabled}
          aria-label="Ask Risk Copilot"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          aria-label="Send message"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Risk Copilot generates insights from your uploaded documents and may not
        always be accurate. Always verify before acting.
      </p>
    </form>
  );
}
