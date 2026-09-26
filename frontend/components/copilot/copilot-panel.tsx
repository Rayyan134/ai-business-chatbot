"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FileWarning,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChatInput } from "@/components/copilot/chat-input";
import { ChatMessage } from "@/components/copilot/chat-message";
import { SuggestedPrompts } from "@/components/copilot/suggested-prompts";
import { sendCopilotMessage } from "@/lib/api-client";
import {
  buildCopilotContext,
  buildRealWelcomeMessage,
  documentContext,
  formatTime,
  resolveReply,
  suggestedQuestions,
  toCopilotMessage,
  welcomeMessage,
} from "@/lib/copilot-data";
import type { CopilotMessage } from "@/lib/copilot-data";
import type { AnalysisResult } from "@/lib/analysis-api-types";

const contextIcons: Record<string, LucideIcon> = {
  "risk-register": FileSpreadsheet,
  "audit-findings": FileText,
  "exception-log": FileWarning,
  mis: BarChart3,
};

const RESPONSE_DELAY = 1100;

interface CopilotPanelProps {
  open: boolean;
  onClose: () => void;
  runId?: string | null;
  resultId?: string | null;
  analysisResult?: AnalysisResult | null;
}

function buildWelcomeMessage(
  analysisResult: AnalysisResult | null | undefined,
): CopilotMessage {
  return analysisResult
    ? buildRealWelcomeMessage(analysisResult)
    : welcomeMessage;
}

export function CopilotPanel({
  open,
  onClose,
  runId = null,
  resultId = null,
  analysisResult = null,
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => [
    buildWelcomeMessage(analysisResult),
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const idRef = useRef(1);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset the transcript to a freshly built welcome message when the underlying
  // analysis result changes (e.g. client-side navigation to a different run).
  // Adjusting state during render is the documented alternative to a
  // setState-in-effect, which the React compiler lint rule rejects.
  const activeResultId = analysisResult?.id ?? null;
  const [lastResultId, setLastResultId] = useState(activeResultId);
  if (activeResultId !== lastResultId) {
    setLastResultId(activeResultId);
    setMessages([buildWelcomeMessage(analysisResult)]);
  }

  useEffect(() => {
    const element = messagesRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  function sendMessage(text: string) {
    const userMessage: CopilotMessage = {
      id: `msg-${idRef.current++}`,
      role: "user",
      content: text,
      timestamp: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const hasRealContext = Boolean(runId || resultId);

    if (hasRealContext) {
      sendCopilotMessage(buildCopilotContext(runId, resultId, text))
        .then((response) => {
          setMessages((prev) => [
            ...prev,
            toCopilotMessage(
              response,
              `msg-${idRef.current++}`,
              formatTime(new Date()),
            ),
          ]);
        })
        .catch(() => {
          // Network/backend failure: degrade to the deterministic demo reply.
          const reply = resolveReply(text);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${idRef.current++}`,
              role: "assistant",
              content: reply.content,
              timestamp: formatTime(new Date()),
              confidence: reply.confidence,
              sources: reply.sources,
            },
          ]);
        })
        .finally(() => setIsTyping(false));
      return;
    }

    const reply = resolveReply(text);
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${idRef.current++}`,
          role: "assistant",
          content: reply.content,
          timestamp: formatTime(new Date()),
          confidence: reply.confidence,
          sources: reply.sources,
        },
      ]);
      setIsTyping(false);
    }, RESPONSE_DELAY);
  }

  const showSuggestions = messages.length === 1 && !isTyping;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Risk Copilot chat"
        className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                Risk Copilot
              </p>
              <p className="text-xs text-muted-foreground">
                Operational Risk Assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border-subtle bg-surface-elevated px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Document context
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              73 analyzed
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {documentContext.map((item) => {
              const Icon = contextIcons[item.id] ?? FileText;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Loaded
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          ref={messagesRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping ? (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-surface-elevated px-4 py-3">
                <span className="flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="border-t border-border-subtle px-4 pb-4 pt-3">
            <SuggestedPrompts
              prompts={suggestedQuestions}
              onSelect={sendMessage}
              disabled={isTyping}
            />
          </div>
        ) : null}

        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </aside>
    </>
  );
}
