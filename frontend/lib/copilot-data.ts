export type ChatRole = "user" | "assistant";

export interface CopilotMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
}

export interface CopilotReply {
  content: string;
  confidence: number;
  sources: string[];
}

export interface Suggestion {
  id: string;
  label: string;
}

export interface DocumentContext {
  id: string;
  label: string;
  detail: string;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const documentContext: DocumentContext[] = [
  {
    id: "risk-register",
    label: "Risk Register",
    detail: "38 risks · July 2026",
  },
  {
    id: "audit-findings",
    label: "Audit Findings",
    detail: "23 findings · GIA & Internal Audit",
  },
  {
    id: "exception-log",
    label: "Exception Log",
    detail: "12 exceptions · 3 overdue",
  },
  {
    id: "mis",
    label: "MIS Reports",
    detail: "3 reports · Board pack",
  },
];

export const suggestedQuestions: Suggestion[] = [
  { id: "q1", label: "What are the highest operational risks?" },
  { id: "q2", label: "Summarize audit findings." },
  { id: "q3", label: "Which department has the highest risk exposure?" },
  { id: "q4", label: "What actions should management take?" },
];

const riskReply: CopilotReply = {
  confidence: 92,
  sources: ["Risk Register · 38 risks", "Audit Findings · 23 findings"],
  content:
    "Here are the highest operational risks from the current register:\n\n• Card fraud exposure — Retail Banking (Critical, score 92)\n• Legacy system privileged access — Technology (Critical, 88)\n• SWIFT user access reviews overdue — Financial Crime (High, 79)\n• Reconciliation exceptions — Treasury Operations (High, 74)\n• Vendor SLA gaps — Procurement (High, 71)\n\nHigh-risk count is down 3.1% this month, driven by two closures in Financial Crime.",
};

const auditReply: CopilotReply = {
  confidence: 88,
  sources: ["Audit Findings · 23 findings", "GIA Findings · July 2026"],
  content:
    "Across the 23 audit findings reviewed, 9 are critical and 5 remain overdue:\n\n• 9 critical — led by segregation of duties in card onboarding and privileged access recertification\n• 5 high — SWIFT access reviews, reconciliation exception tracking, vendor SLA monitoring\n• 7 medium — KYC refresh documents, policy attestation gaps\n• 2 low — documentation updates\n\nOverall closure rate is 61%. The two critical items are flagged against the August board submission.",
};

const departmentReply: CopilotReply = {
  confidence: 90,
  sources: ["Risk Register · 38 risks", "MIS Reports · 3 reports"],
  content:
    "Retail Banking has the highest exposure this cycle, driven by card fraud and onboarding control gaps. Technology is close behind on legacy access risks.\n\nExposure by division:\n• Retail Banking — Critical\n• Technology — High\n• Treasury Operations — High\n• Financial Crime — Medium\n• Wealth Management — Medium\n• Corporate Bank — Low",
};

const actionReply: CopilotReply = {
  confidence: 86,
  sources: ["AI Recommendations · July 2026", "Exception Log · 12 exceptions"],
  content:
    "Management should prioritize, in order:\n\n1. Recertify privileged access on legacy systems immediately (critical exposure, ~30% risk reduction)\n2. Automate segregation of duties checks in card onboarding before the August board submission\n3. Complete overdue SWIFT access reviews and enforce quarterly recertification\n4. Automate end-of-day reconciliation exception tracking in Treasury\n5. Refresh KYC documents for the 14 wealth accounts nearing expiry\n\nFull detail is in the AI Recommendations panel on the results page.",
};

const fallbackReply: CopilotReply = {
  confidence: 100,
  sources: ["Risk Register", "Audit Findings", "Exception Log", "MIS Reports"],
  content:
    "I can answer questions about the documents you analyzed. Try asking about the highest risks, audit findings, department exposure, or recommended actions — for example: \"Which department has the highest risk exposure?\"",
};

export function resolveReply(question: string): CopilotReply {
  const q = question.toLowerCase();
  if (q.includes("audit") || q.includes("finding")) return auditReply;
  if (
    q.includes("department") ||
    q.includes("division") ||
    q.includes("exposure")
  ) {
    return departmentReply;
  }
  if (q.includes("action") || q.includes("management") || q.includes("should")) {
    return actionReply;
  }
  if (q.includes("highest") || q.includes("top") || q.includes("risk")) {
    return riskReply;
  }
  return fallbackReply;
}

export const welcomeMessage: CopilotMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi Sarah, I'm Risk Copilot. I've analyzed your 73 operational risk documents from the July cycle. Ask me about your highest risks, audit findings, department exposure or recommended actions.",
  timestamp: formatTime(new Date()),
  confidence: 100,
  sources: ["Risk Register", "Audit Findings", "Exception Log", "MIS Reports"],
};
