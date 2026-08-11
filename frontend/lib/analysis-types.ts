export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface OverallScore {
  score: number;
  level: Severity;
  description: string;
  change: string;
}

export interface AnalysisMetric {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: "up" | "down";
  positive: boolean;
}

export interface Recommendation {
  id: string;
  priority: Severity;
  category: string;
  action: string;
  impact: string;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  category: string;
  level: HeatmapLevel;
}

export interface HeatmapRow {
  division: string;
  cells: HeatmapCell[];
}

export interface RiskTrendPoint {
  month: string;
  high: number;
  medium: number;
  low: number;
}

export interface KeyFinding {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  likelihood: string;
  exposure: string;
}

export interface SourceChip {
  label: string;
  count: string;
}

export interface ExecutiveSummary {
  generatedAt: string;
  paragraphs: string[];
  sources: SourceChip[];
}
