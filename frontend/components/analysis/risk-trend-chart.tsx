"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskTrendPoint } from "@/lib/analysis-types";
import { Card, CardHeader } from "@/components/card";

interface RiskTrendChartProps {
  data: RiskTrendPoint[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  return (
    <Card>
      <CardHeader
        title="Risk Trend by Severity"
        subtitle="High, medium and low risk counts by month · all divisions"
      />
      <div className="px-5 py-4">
        <div className="mb-4 flex items-center gap-6">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-high" />
            High risks
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-risk-open" />
            Medium risks
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            Low risks
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
            >
              <defs>
                <linearGradient
                  id="analysis-low-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--muted-foreground)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="analysis-medium-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--risk-open)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--risk-open)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="analysis-high-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--risk-high)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--risk-high)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
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
                dataKey="low"
                name="Low risks"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                fill="url(#analysis-low-grad)"
              />
              <Area
                type="monotone"
                dataKey="medium"
                name="Medium risks"
                stroke="var(--risk-open)"
                strokeWidth={2}
                fill="url(#analysis-medium-grad)"
              />
              <Area
                type="monotone"
                dataKey="high"
                name="High risks"
                stroke="var(--risk-high)"
                strokeWidth={2}
                fill="url(#analysis-high-grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
