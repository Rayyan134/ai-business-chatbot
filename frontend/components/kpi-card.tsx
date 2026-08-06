"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileWarning,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { Kpi } from "@/lib/types";
import { Card } from "@/components/card";

const iconByKpi: Record<string, LucideIcon> = {
  "open-risks": ShieldAlert,
  "high-risks": AlertTriangle,
  "audit-findings": FileWarning,
  "open-exceptions": Clock,
};

const iconTone: Record<string, string> = {
  "open-risks":
    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "high-risks":
    "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  "audit-findings":
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  "open-exceptions":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const sparkColor: Record<string, string> = {
  "open-risks": "var(--risk-open)",
  "high-risks": "var(--risk-high)",
  "audit-findings": "var(--risk-high)",
  "open-exceptions": "var(--risk-open)",
};

interface KpiCardProps {
  kpi: Kpi;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const Icon = iconByKpi[kpi.id] ?? ShieldAlert;
  const data = kpi.sparkline.map((value, index) => ({ index, value }));
  const color = sparkColor[kpi.id] ?? "var(--risk-open)";
  const gradientId = `spark-${kpi.id}`;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </span>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconTone[kpi.id] ?? ""}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {kpi.value}
        </p>
        <span
          className={`inline-flex items-center gap-0.5 text-sm font-medium ${
            kpi.positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {kpi.trend === "up" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {kpi.change}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">vs last month</p>

      <div className="mt-4 h-10 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
