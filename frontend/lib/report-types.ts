import type { Severity } from "@/lib/analysis-types";

export type { Severity } from "@/lib/analysis-types";

export interface ReportMeta {
  bankName: string;
  reportTitle: string;
  reportId: string;
  period: string;
  issuedDate: string;
  preparedBy: string;
  approvedBy: string;
  classification: string;
  generatedBy: string;
  documentsAnalyzed: string;
  analysisPeriod: string;
  confidence: number;
}

export interface ReportStat {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose" | "blue";
}

export interface ExecutiveSummaryData {
  paragraphs: string[];
  stats: ReportStat[];
}

export interface SeverityCount {
  severity: Severity;
  count: number;
  change: string;
  share: string;
  positive: boolean;
}

export interface TrendRow {
  period: string;
  high: number;
  medium: number;
  low: number;
}

export interface RiskOverviewData {
  distribution: SeverityCount[];
  trends: TrendRow[];
  exposureAreas: string[];
}

export interface RiskScoreInfo {
  score: number;
  level: Severity;
  change: string;
  description: string;
  history: { period: string; score: number }[];
}

export interface ReportFinding {
  id: string;
  title: string;
  area: string;
  severity: Severity;
  likelihood: string;
  exposure: string;
}

export interface ReportAuditFinding {
  id: string;
  title: string;
  division: string;
  rating: string;
  status: string;
  dueDate: string;
  owner: string;
}

export interface ReportException {
  id: string;
  description: string;
  division: string;
  raisedDate: string;
  severity: Severity;
  status: string;
  daysOpen: number;
  owner: string;
}

export interface ReportRecommendation {
  id: string;
  priority: Severity;
  category: string;
  action: string;
  impact: string;
}

export interface BoardDecision {
  decision: string;
  owner: string;
  target: string;
}

export interface BoardSummaryData {
  paragraphs: string[];
  keyMessages: string[];
  decisions: BoardDecision[];
}

export interface ManagementAction {
  id: string;
  action: string;
  owner: string;
  department: string;
  dueDate: string;
  priority: Severity;
  status: string;
}
