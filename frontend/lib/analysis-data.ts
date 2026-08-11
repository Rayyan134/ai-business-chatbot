import type {
  AnalysisMetric,
  ExecutiveSummary,
  HeatmapRow,
  KeyFinding,
  OverallScore,
  Recommendation,
  RiskTrendPoint,
} from "@/lib/analysis-types";

export const overallScore: OverallScore = {
  score: 82,
  level: "High",
  description:
    "Elevated operational risk exposure driven by legacy system access gaps and card onboarding control weaknesses.",
  change: "-6 points vs last month",
};

export const metrics: AnalysisMetric[] = [
  {
    id: "high-risks",
    label: "High Risks",
    value: 57,
    change: "-3.1% vs last month",
    trend: "down",
    positive: true,
  },
  {
    id: "medium-risks",
    label: "Medium Risks",
    value: 124,
    change: "+2.4% vs last month",
    trend: "up",
    positive: false,
  },
  {
    id: "low-risks",
    label: "Low Risks",
    value: 161,
    change: "-0.6% vs last month",
    trend: "down",
    positive: true,
  },
  {
    id: "critical-findings",
    label: "Critical Findings",
    value: 9,
    change: "+2 this month",
    trend: "up",
    positive: false,
  },
];

export const analysisSummary: ExecutiveSummary = {
  generatedAt: "August 6, 2026",
  paragraphs: [
    "The AI analysis reviewed 73 uploaded operational risk documents — the risk register, audit findings, exception log and management information — and identified elevated operational risk exposure across Retail Banking, Technology and Treasury Operations.",
    "Nine critical findings require immediate attention, led by unresolved privileged access gaps on legacy systems and segregation of duties weaknesses in card onboarding. Both contribute directly to the bank's fraud and data breach exposure.",
    "High-risk counts declined for a third consecutive month, but medium-risk exposure rose 2.4% as new exceptions were logged during the KYC refresh program. Recommended actions are prioritized by their estimated reduction in high-risk exposure.",
  ],
  sources: [
    { label: "Risk Register", count: "38 risks" },
    { label: "Audit Findings", count: "23 findings" },
    { label: "Exception Log", count: "12 exceptions" },
    { label: "MIS Reports", count: "3 reports" },
  ],
};

export const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    priority: "Critical",
    category: "Identity & Access",
    action:
      "Immediately recertify all privileged access on legacy systems and close the 14 accounts with stale elevated permissions.",
    impact: "Reduces critical exposure by ~30%",
  },
  {
    id: "rec-2",
    priority: "Critical",
    category: "Card Onboarding",
    action:
      "Implement automated segregation of duties checks in the card onboarding workflow before the August board submission.",
    impact: "Cuts high-risk count by ~12%",
  },
  {
    id: "rec-3",
    priority: "High",
    category: "Reconciliation",
    action:
      "Automate end-of-day reconciliation exception tracking and escalation in Treasury Operations.",
    impact: "Saves ~40 FTE hours monthly",
  },
  {
    id: "rec-4",
    priority: "High",
    category: "Financial Crime",
    action:
      "Complete the overdue SWIFT user access reviews and enforce quarterly recertification.",
    impact: "Prevents potential regulatory penalty",
  },
  {
    id: "rec-5",
    priority: "Medium",
    category: "KYC Refresh",
    action:
      "Prioritize document refresh for the 14 wealth accounts approaching KYC expiry.",
    impact: "Avoids ~14 dormant-account breaches",
  },
];

export const riskHeatmap: HeatmapRow[] = [
  {
    division: "Retail Banking",
    cells: [
      { category: "Cyber", level: 4 },
      { category: "Process", level: 3 },
      { category: "People", level: 3 },
      { category: "Third Party", level: 2 },
      { category: "Regulatory", level: 2 },
    ],
  },
  {
    division: "Technology",
    cells: [
      { category: "Cyber", level: 4 },
      { category: "Process", level: 2 },
      { category: "People", level: 2 },
      { category: "Third Party", level: 3 },
      { category: "Regulatory", level: 2 },
    ],
  },
  {
    division: "Treasury Ops",
    cells: [
      { category: "Cyber", level: 2 },
      { category: "Process", level: 3 },
      { category: "People", level: 2 },
      { category: "Third Party", level: 3 },
      { category: "Regulatory", level: 3 },
    ],
  },
  {
    division: "Wealth Mgmt",
    cells: [
      { category: "Cyber", level: 2 },
      { category: "Process", level: 2 },
      { category: "People", level: 2 },
      { category: "Third Party", level: 1 },
      { category: "Regulatory", level: 3 },
    ],
  },
  {
    division: "Financial Crime",
    cells: [
      { category: "Cyber", level: 3 },
      { category: "Process", level: 3 },
      { category: "People", level: 2 },
      { category: "Third Party", level: 1 },
      { category: "Regulatory", level: 3 },
    ],
  },
  {
    division: "Corporate Bank",
    cells: [
      { category: "Cyber", level: 1 },
      { category: "Process", level: 2 },
      { category: "People", level: 1 },
      { category: "Third Party", level: 2 },
      { category: "Regulatory", level: 2 },
    ],
  },
];

export const riskTrend: RiskTrendPoint[] = [
  { month: "Aug", high: 72, medium: 128, low: 148 },
  { month: "Sep", high: 70, medium: 126, low: 151 },
  { month: "Oct", high: 68, medium: 124, low: 150 },
  { month: "Nov", high: 71, medium: 127, low: 152 },
  { month: "Dec", high: 65, medium: 125, low: 155 },
  { month: "Jan", high: 66, medium: 123, low: 154 },
  { month: "Feb", high: 63, medium: 126, low: 157 },
  { month: "Mar", high: 61, medium: 124, low: 158 },
  { month: "Apr", high: 64, medium: 125, low: 159 },
  { month: "May", high: 60, medium: 123, low: 160 },
  { month: "Jun", high: 59, medium: 124, low: 160 },
  { month: "Jul", high: 57, medium: 124, low: 161 },
];

export const keyFindings: KeyFinding[] = [
  {
    id: "AF-2026-114",
    title: "Legacy system privileged access not recertified for 8+ months",
    category: "Technology",
    severity: "Critical",
    likelihood: "Very likely",
    exposure: "High",
  },
  {
    id: "AF-2026-118",
    title: "Segregation of duties gaps in card onboarding workflow",
    category: "Retail Banking",
    severity: "Critical",
    likelihood: "Very likely",
    exposure: "High",
  },
  {
    id: "AF-2026-121",
    title: "SWIFT user access reviews overdue by 42 days",
    category: "Financial Crime",
    severity: "High",
    likelihood: "Likely",
    exposure: "High",
  },
  {
    id: "AF-2026-117",
    title: "End-of-day reconciliation exceptions not systematically tracked",
    category: "Treasury Operations",
    severity: "High",
    likelihood: "Likely",
    exposure: "Medium",
  },
  {
    id: "AF-2026-112",
    title: "Vendor SLA monitoring lacking for core payment processors",
    category: "Procurement",
    severity: "Medium",
    likelihood: "Possible",
    exposure: "Medium",
  },
  {
    id: "AF-2026-109",
    title: "KYC refresh documents missing for 14 wealth accounts",
    category: "Wealth Management",
    severity: "Medium",
    likelihood: "Possible",
    exposure: "Low",
  },
];
