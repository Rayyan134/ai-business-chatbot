export interface CopilotSource {
  label: string;
  documentId?: string | null;
  documentType?: string | null;
  sourceRef?: string | null;
  snippet?: string | null;
}

export interface CopilotRequest {
  runId?: string | null;
  resultId?: string | null;
  message: string;
}

export interface CopilotResponse {
  answer: string;
  confidence: number;
  sources: CopilotSource[];
  warnings: string[];
  grounded: boolean;
}
