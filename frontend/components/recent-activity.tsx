"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  FileText,
  FileWarning,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityCategory, ActivityItem } from "@/lib/types";
import { Card, CardHeader } from "@/components/card";

const categoryMeta: Record<
  ActivityCategory,
  { label: string; icon: LucideIcon; classes: string }
> = {
  risk: {
    label: "Risk",
    icon: ShieldAlert,
    classes:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  },
  audit: {
    label: "Audit",
    icon: ClipboardCheck,
    classes:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  exception: {
    label: "Exception",
    icon: FileWarning,
    classes:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  report: {
    label: "Report",
    icon: FileText,
    classes:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
};

const FILTERS: Array<"All" | ActivityCategory> = [
  "All",
  "risk",
  "audit",
  "exception",
  "report",
];

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const visible =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Activity"
        subtitle="Latest updates across the risk estate"
        action={
          <select
            aria-label="Filter activity"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as (typeof FILTERS)[number])
            }
            className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground focus:border-primary focus:outline-none"
          >
            {FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All" : categoryMeta[option].label}
              </option>
            ))}
          </select>
        }
      />
      <ul className="flex-1 divide-y divide-border-subtle px-5">
        {visible.map((item) => {
          const meta = categoryMeta[item.category];
          const Icon = meta.icon;
          return (
            <li key={item.id} className="flex gap-3 py-3.5">
              <span
                className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.classes}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.time}
              </span>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No activity in this category.
          </li>
        ) : null}
      </ul>
    </Card>
  );
}
