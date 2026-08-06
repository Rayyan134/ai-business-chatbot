export type RiskLevel = "High" | "Medium" | "Low";

export type FindingStatus = "Open" | "In Progress" | "Closed" | "Overdue";

export type ActivityCategory = "risk" | "audit" | "exception" | "report";

export interface Kpi {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  positive: boolean;
  sparkline: number[];
}

export interface RiskTrendPoint {
  month: string;
  open: number;
  high: number;
}

export interface AuditFinding {
  id: string;
  title: string;
  division: string;
  riskLevel: RiskLevel;
  status: FindingStatus;
  owner: string;
  dueDate: string;
}

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  time: string;
}
