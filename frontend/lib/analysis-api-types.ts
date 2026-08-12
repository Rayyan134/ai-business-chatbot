import type {
  AnalysisMetric,
  HeatmapRow,
  KeyFinding,
  OverallScore,
  Recommendation,
  RiskTrendPoint,
  Severity,
} from "@/lib/analysis-types";

export type AnalysisRunStatus =
  | "queued"
  | "processing"
  | "ready"
  | "partial"
  | "failed";

export type AnalysisResultStatus = "processing" | "ready" | "partial" | "failed";

export interface AnalysisModelInfo {
  provider: string;
  analysisModel: string | null;
  synthesisModel: string | null;
}

export interface AnalysisRun {
  id: string;
  documentIds: string[];
  status: AnalysisRunStatus;
  startedAt: string | null;
  completedAt: string | null;
  modelInfo: AnalysisModelInfo;
  resultId: string | null;
  warnings: string[];
  error: string | null;
}

export interface Evidence {
  documentId: string;
  documentType: string;
  sourceRef: string;
  snippet: string | null;
}

export interface KeyFindingDetail extends KeyFinding {
  evidence: Evidence[];
  confidence: number;
}

export interface RecommendationDetail extends Recommendation {
  evidence: Evidence[];
  confidence: number;
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

export interface SourceCount {
  label: string;
  count: string;
}

export interface AnalysisSummary {
  generatedAt: string;
  paragraphs: string[];
  sources: SourceCount[];
}

export interface DocumentCoverage {
  id: string;
  filename: string;
  category: string;
  status: string;
  evidenceCount: number;
}

export interface AnalysisResult {
  id: string;
  status: AnalysisResultStatus;
  createdAt: string;
  confidence: number;
  warnings: string[];
  documents: DocumentCoverage[];
  overallScore: OverallScore;
  metrics: AnalysisMetric[];
  heatmap: HeatmapRow[];
  trend: RiskTrendPoint[];
  keyFindings: KeyFindingDetail[];
  recommendations: RecommendationDetail[];
  managementActions: ManagementAction[];
  summary: AnalysisSummary;
}
