import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/card";

interface ProcessingChecklistProps {
  steps: readonly string[];
  current: number;
}

export function ProcessingChecklist({
  steps,
  current,
}: ProcessingChecklistProps) {
  return (
    <Card>
      <CardHeader
        title="Analysis Pipeline"
        subtitle="Progress through the AI review workflow"
      />
      <ol className="space-y-4 px-5 py-5">
        {steps.map((label, index) => {
          const state =
            index < current ? "done" : index === current ? "active" : "pending";
          return (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {state === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : state === "active" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border-subtle" />
                )}
              </span>
              <span
                className={`text-sm ${
                  state === "done"
                    ? "text-muted-foreground"
                    : state === "active"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/70"
                }`}
              >
                {label}
              </span>
              {state === "active" ? (
                <span className="ml-auto text-xs font-medium text-primary">
                  In progress
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
