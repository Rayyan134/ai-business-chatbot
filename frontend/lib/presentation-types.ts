import type { Severity } from "@/lib/analysis-types";

export type { Severity } from "@/lib/analysis-types";

export interface PresentationMeta {
  bankName: string;
  deckTitle: string;
  deckId: string;
  period: string;
  preparedFor: string;
  preparedBy: string;
  date: string;
  classification: string;
  generatedBy: string;
  documentsAnalyzed: string;
  analysisPeriod: string;
  confidence: number;
}

export interface PresentationStat {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose" | "blue";
}

export interface SlideBullet {
  text: string;
  tone?: "default" | "highlight";
}

export interface RiskLandscapeRow {
  severity: Severity;
  count: number;
  share: string;
  change: string;
  positive: boolean;
}

export interface TrendPoint {
  period: string;
  score: number;
}

export interface TopRiskItem {
  rank: number;
  title: string;
  division: string;
  score: number;
  severity: Severity;
  likelihood: string;
  impact: string;
  trend: "up" | "down" | "stable";
}

export interface PresentationAuditFinding {
  id: string;
  title: string;
  division: string;
  rating: Severity;
  status: string;
  dueDate: string;
}

export interface PresentationAction {
  id: string;
  action: string;
  owner: string;
  department: string;
  dueDate: string;
  priority: Severity;
  status: string;
}

export interface PresentationDecision {
  decision: string;
  owner: string;
  target: string;
}

export type SlideContent =
  | {
      kind: "title";
      title: string;
      subtitle: string;
      preparedFor: string;
      presenter: string;
      date: string;
    }
  | {
      kind: "executive-summary";
      paragraph: string;
      bullets: SlideBullet[];
      stats: PresentationStat[];
    }
  | {
      kind: "risk-landscape";
      score: number;
      level: Severity;
      change: string;
      description: string;
      distribution: RiskLandscapeRow[];
      trend: TrendPoint[];
      exposureAreas: string[];
    }
  | { kind: "top-risks"; items: TopRiskItem[] }
  | { kind: "audit-findings"; findings: PresentationAuditFinding[] }
  | {
      kind: "management-actions";
      actions: PresentationAction[];
      decisions: PresentationDecision[];
    }
  | {
      kind: "closing";
      title: string;
      subtitle: string;
      nextSteps: string[];
      contact: string;
    };

export interface DeckSlide {
  id: string;
  shortTitle: string;
  notes?: string;
  content: SlideContent;
}
