"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskTrendPoint } from "@/lib/types";
import { Card, CardHeader } from "@/components/card";

const PERIODS = ["6M", "12M"] as const;
type Period = (typeof PERIODS)[number];

interface RiskTrendChartProps {
  data: RiskTrendPoint[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  const [period, setPeriod] = useState<Period>("12M");
  const slice = period === "6M" ? data.slice(-6) : data;

  return (
    <Card>
      <CardHeader
        title="Risk Trend"
        subtitle="Open and high risks by month · all divisions"
        action={
          <div className="inline-flex rounded-lg border border-border-subtle bg-surface-elevated p-0.5">
            {PERIODS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  period === option
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        }
      />
      <div className="px-5 py-4">
        <div className="mb-4 flex items-center gap-6">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-open" />
            Open risks
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-high" />
            High risks
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slice} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="open-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--risk-open)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--risk-open)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="high-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--risk-high)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--risk-high)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="open"
                name="Open risks"
                stroke="var(--risk-open)"
                strokeWidth={2}
                fill="url(#open-grad)"
              />
              <Area
                type="monotone"
                dataKey="high"
                name="High risks"
                stroke="var(--risk-high)"
                strokeWidth={2}
                fill="url(#high-grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
