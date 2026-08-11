import type { BadgeTone } from "@/components/badge";
import type { Severity } from "@/lib/analysis-types";

export const severityTone: Record<Severity, BadgeTone> = {
  Critical: "rose",
  High: "amber",
  Medium: "blue",
  Low: "emerald",
};

export const statusTone: Record<string, BadgeTone> = {
  Open: "amber",
  Overdue: "rose",
  "In Progress": "blue",
  Completed: "emerald",
  Approved: "emerald",
  "Not started": "amber",
};

export const statToneClass: Record<
  "emerald" | "amber" | "rose" | "blue",
  string
> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  blue: "text-blue-600 dark:text-blue-400",
};

export const trendToneClass: Record<"up" | "down" | "stable", string> = {
  up: "text-rose-600 dark:text-rose-400",
  down: "text-emerald-600 dark:text-emerald-400",
  stable: "text-muted-foreground",
};
