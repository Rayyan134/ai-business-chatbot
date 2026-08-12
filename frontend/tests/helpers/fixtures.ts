import type { AnalysisResult, AnalysisRun } from "@/lib/analysis-api-types";

export const sampleRun: AnalysisRun = {
  id: "run-1",
  documentIds: ["doc-a", "doc-b"],
  status: "ready",
  startedAt: "2026-08-06T08:00:00Z",
  completedAt: "2026-08-06T08:00:05Z",
  modelInfo: {
    provider: "deterministic",
    analysisModel: null,
    synthesisModel: null,
  },
  resultId: "result-1",
  warnings: [],
  error: null,
};

export const sampleResult: AnalysisResult = {
  id: "result-1",
  status: "ready",
  createdAt: "2026-08-06T08:00:05Z",
  confidence: 88,
  warnings: [],
  documents: [
    {
      id: "doc-a",
      filename: "Risk Register.xlsx",
      category: "risk-register",
      status: "ready",
      evidenceCount: 12,
    },
  ],
  overallScore: {
    score: 82,
    level: "High",
    description: "Elevated operational risk exposure.",
    change: "",
  },
  metrics: [
    { id: "critical-risks", label: "Critical Risks", value: 2, change: "", trend: "down", positive: true },
    { id: "high-risks", label: "High Risks", value: 57, change: "", trend: "down", positive: true },
  ],
  heatmap: [
    {
      division: "Retail Banking",
      cells: [
        { category: "Cyber", level: 4 },
        { category: "Process", level: 3 },
      ],
    },
  ],
  trend: [
    { month: "Jun", high: 59, medium: 124, low: 160 },
    { month: "Jul", high: 57, medium: 124, low: 161 },
  ],
  keyFindings: [
    {
      id: "AF-2026-114",
      title: "Legacy system privileged access not recertified",
      category: "Technology",
      severity: "Critical",
      likelihood: "Very likely",
      exposure: "High",
      evidence: [],
      confidence: 90,
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      priority: "Critical",
      category: "Identity & Access",
      action: "Recertify all privileged access on legacy systems.",
      impact: "Reduces critical exposure by ~30%",
      evidence: [],
      confidence: 85,
    },
  ],
  managementActions: [
    {
      id: "action-1",
      action: "Recertify privileged access",
      owner: "Sarah Chen",
      department: "Technology",
      dueDate: "2026-08-15",
      priority: "Critical",
      status: "Open",
    },
  ],
  summary: {
    generatedAt: "2026-08-06T08:00:05Z",
    paragraphs: ["The analysis identified elevated operational risk exposure."],
    sources: [{ label: "Risk Register", count: "12" }],
  },
};

export const partialResult: AnalysisResult = {
  ...sampleResult,
  id: "result-partial",
  status: "partial",
  warnings: ["AI synthesis unavailable; executive narrative generated deterministically."],
  metrics: [],
  heatmap: [],
  trend: [],
};
