import type {
  BoardSummaryData,
  ExecutiveSummaryData,
  ManagementAction,
  ReportAuditFinding,
  ReportException,
  ReportFinding,
  ReportMeta,
  ReportRecommendation,
  RiskOverviewData,
  RiskScoreInfo,
} from "@/lib/report-types";

export const reportMeta: ReportMeta = {
  bankName: "Meridian Bank",
  reportTitle: "Monthly Operational Risk Report",
  reportId: "ORR-2026-07",
  period: "July 2026",
  issuedDate: "August 6, 2026",
  preparedBy: "Sarah Chen — Operational Risk Manager",
  approvedBy: "Priya Nair — Chief Risk Officer",
  classification: "Internal — Confidential",
  generatedBy: "Risk Copilot AI",
  documentsAnalyzed: "73 documents",
  analysisPeriod: "July 2026",
  confidence: 90,
};

export const executiveSummary: ExecutiveSummaryData = {
  paragraphs: [
    "This report summarizes Meridian Bank's operational risk position for July 2026, drawing on 73 documents — the risk register, audit findings, exception log and management information — analyzed by Risk Copilot AI.",
    "The overall operational risk score improved 6 points to 82 (High), the third consecutive monthly decline, driven by two high-risk closures in Financial Crime. However, nine critical findings remain unresolved, concentrated in identity and access management and card onboarding controls.",
    "Three exceptions have been open for more than 30 days, including a treasury reconciliation gap. Management actions in Section 9 are prioritized to address the highest-risk items before the August board submission.",
  ],
  stats: [
    { label: "Overall Score", value: "82", tone: "rose" },
    { label: "High Risks", value: "57", tone: "amber" },
    { label: "Critical Findings", value: "9", tone: "rose" },
    { label: "Overdue Exceptions", value: "3", tone: "amber" },
  ],
};

export const boardSummary: BoardSummaryData = {
  paragraphs: [
    "The Board is asked to note the improving but still elevated risk position and to approve the remediation plan for the two critical control gaps. No critical findings have been closed since the last board pack.",
  ],
  keyMessages: [
    "Operational risk score improved to 82/100 (High), down 6 points from June.",
    "Nine critical findings remain open across identity and access and card onboarding.",
    "Two control gaps account for most critical exposure: legacy privileged access and segregation of duties in card onboarding.",
    "Three exceptions exceeded the 30-day reporting threshold, including one in Treasury Operations.",
    "KYC refresh is progressing; 14 wealth accounts require documents before September.",
  ],
  decisions: [
    {
      decision: "Approve the privileged access remediation program",
      owner: "Chief Risk Officer",
      target: "Aug 15, 2026",
    },
    {
      decision: "Endorse automated segregation of duties controls",
      owner: "Head of Retail Banking",
      target: "Aug 20, 2026",
    },
    {
      decision: "Approve vendor SLA monitoring rollout",
      owner: "Chief Procurement Officer",
      target: "Sep 12, 2026",
    },
  ],
};

export const riskOverview: RiskOverviewData = {
  distribution: [
    {
      severity: "Critical",
      count: 9,
      change: "+2 vs last month",
      share: "3%",
      positive: false,
    },
    {
      severity: "High",
      count: 57,
      change: "-3.1% vs last month",
      share: "16%",
      positive: true,
    },
    {
      severity: "Medium",
      count: 124,
      change: "+2.4% vs last month",
      share: "35%",
      positive: false,
    },
    {
      severity: "Low",
      count: 161,
      change: "-0.6% vs last month",
      share: "46%",
      positive: true,
    },
  ],
  trends: [
    { period: "Feb", high: 63, medium: 126, low: 157 },
    { period: "Mar", high: 61, medium: 124, low: 158 },
    { period: "Apr", high: 64, medium: 125, low: 159 },
    { period: "May", high: 60, medium: 123, low: 160 },
    { period: "Jun", high: 59, medium: 124, low: 160 },
    { period: "Jul", high: 57, medium: 124, low: 161 },
  ],
  exposureAreas: [
    "Retail Banking — Critical (card fraud and onboarding controls)",
    "Technology — High (legacy system privileged access)",
    "Treasury Operations — High (end-of-day reconciliation)",
    "Financial Crime — Medium (SWIFT user access reviews)",
  ],
};

export const riskScore: RiskScoreInfo = {
  score: 82,
  level: "High",
  change: "-6 points vs last month",
  description:
    "Elevated operational risk exposure driven by legacy system access gaps and card onboarding control weaknesses.",
  history: [
    { period: "Feb", score: 92 },
    { period: "Mar", score: 90 },
    { period: "Apr", score: 91 },
    { period: "May", score: 89 },
    { period: "Jun", score: 88 },
    { period: "Jul", score: 82 },
  ],
};

export const keyFindings: ReportFinding[] = [
  {
    id: "AF-2026-114",
    title: "Legacy system privileged access not recertified for 8+ months",
    area: "Technology",
    severity: "Critical",
    likelihood: "Very likely",
    exposure: "High",
  },
  {
    id: "AF-2026-118",
    title: "Segregation of duties gaps in card onboarding workflow",
    area: "Retail Banking",
    severity: "Critical",
    likelihood: "Very likely",
    exposure: "High",
  },
  {
    id: "AF-2026-121",
    title: "SWIFT user access reviews overdue by 42 days",
    area: "Financial Crime",
    severity: "High",
    likelihood: "Likely",
    exposure: "High",
  },
  {
    id: "AF-2026-117",
    title: "End-of-day reconciliation exceptions not systematically tracked",
    area: "Treasury Operations",
    severity: "High",
    likelihood: "Likely",
    exposure: "Medium",
  },
  {
    id: "AF-2026-112",
    title: "Vendor SLA monitoring lacking for core payment processors",
    area: "Procurement",
    severity: "Medium",
    likelihood: "Possible",
    exposure: "Medium",
  },
  {
    id: "AF-2026-109",
    title: "KYC refresh documents missing for 14 wealth accounts",
    area: "Wealth Management",
    severity: "Medium",
    likelihood: "Possible",
    exposure: "Low",
  },
];

export const auditFindings: ReportAuditFinding[] = [
  {
    id: "AF-2026-118",
    title: "Segregation of duties gaps in card onboarding",
    division: "Retail Banking",
    rating: "Critical",
    status: "Open",
    dueDate: "Aug 14, 2026",
    owner: "M. Okafor",
  },
  {
    id: "AF-2026-114",
    title: "Legacy system privileged access not recertified",
    division: "Technology",
    rating: "Critical",
    status: "Overdue",
    dueDate: "Jul 28, 2026",
    owner: "D. Patel",
  },
  {
    id: "AF-2026-121",
    title: "SWIFT user access reviews overdue",
    division: "Financial Crime",
    rating: "High",
    status: "Open",
    dueDate: "Aug 21, 2026",
    owner: "T. Nakamura",
  },
  {
    id: "AF-2026-117",
    title: "End-of-day reconciliation exceptions not tracked",
    division: "Treasury Operations",
    rating: "Medium",
    status: "In Progress",
    dueDate: "Aug 21, 2026",
    owner: "S. Alvarez",
  },
  {
    id: "AF-2026-112",
    title: "Vendor SLA monitoring lacking for core processors",
    division: "Procurement",
    rating: "Medium",
    status: "In Progress",
    dueDate: "Sep 2, 2026",
    owner: "J. Lindqvist",
  },
  {
    id: "AF-2026-109",
    title: "KYC refresh documents missing for 14 accounts",
    division: "Wealth Management",
    rating: "Low",
    status: "Open",
    dueDate: "Aug 30, 2026",
    owner: "R. Kim",
  },
];

export const exceptions: ReportException[] = [
  {
    id: "EX-2841",
    description: "Vendor onboarding delay exceeding the 30-day SLA",
    division: "Procurement",
    raisedDate: "Jul 3, 2026",
    severity: "High",
    status: "Open",
    daysOpen: 34,
    owner: "J. Lindqvist",
  },
  {
    id: "EX-2822",
    description: "Treasury end-of-day reconciliation gap",
    division: "Treasury Operations",
    raisedDate: "Jun 20, 2026",
    severity: "High",
    status: "Overdue",
    daysOpen: 47,
    owner: "S. Alvarez",
  },
  {
    id: "EX-2815",
    description: "Card scheme rule change rollout delayed",
    division: "Retail Banking",
    raisedDate: "Jul 25, 2026",
    severity: "Medium",
    status: "Open",
    daysOpen: 12,
    owner: "M. Okafor",
  },
  {
    id: "EX-2804",
    description: "KYC queue backlog temporary exception",
    division: "Wealth Management",
    raisedDate: "Jul 16, 2026",
    severity: "Medium",
    status: "Approved",
    daysOpen: 21,
    owner: "R. Kim",
  },
  {
    id: "EX-2799",
    description: "Legacy firewall rule change pending",
    division: "Technology",
    raisedDate: "Jul 28, 2026",
    severity: "High",
    status: "Open",
    daysOpen: 9,
    owner: "D. Patel",
  },
];

export const recommendations: ReportRecommendation[] = [
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

export const managementActions: ManagementAction[] = [
  {
    id: "ACT-01",
    action: "Recertify legacy system privileged access",
    owner: "D. Patel",
    department: "Technology",
    dueDate: "Aug 15, 2026",
    priority: "Critical",
    status: "In Progress",
  },
  {
    id: "ACT-02",
    action: "Automate segregation of duties checks in card onboarding",
    owner: "M. Okafor",
    department: "Retail Banking",
    dueDate: "Aug 20, 2026",
    priority: "Critical",
    status: "Not started",
  },
  {
    id: "ACT-03",
    action: "Complete overdue SWIFT user access reviews",
    owner: "T. Nakamura",
    department: "Financial Crime",
    dueDate: "Aug 25, 2026",
    priority: "High",
    status: "Not started",
  },
  {
    id: "ACT-04",
    action: "Automate reconciliation exception tracking",
    owner: "S. Alvarez",
    department: "Treasury Operations",
    dueDate: "Sep 5, 2026",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "ACT-05",
    action: "Refresh KYC documents for 14 wealth accounts",
    owner: "R. Kim",
    department: "Wealth Management",
    dueDate: "Aug 30, 2026",
    priority: "Medium",
    status: "Not started",
  },
  {
    id: "ACT-06",
    action: "Introduce automated vendor SLA monitoring",
    owner: "J. Lindqvist",
    department: "Procurement",
    dueDate: "Sep 12, 2026",
    priority: "Medium",
    status: "Not started",
  },
];
