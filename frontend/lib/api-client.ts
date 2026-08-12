import type {
  DocumentRecord,
  DocumentSummary,
} from "@/lib/document-types";
import type { DocTypeId } from "@/lib/upload-types";
import type {
  AnalysisResult,
  AnalysisRun,
} from "@/lib/analysis-api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // response body was not JSON
    }
    throw new ApiError(response.status, detail);
  }
  return (await response.json()) as T;
}

export async function uploadDocument(
  file: File,
  category: DocTypeId,
): Promise<DocumentRecord> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  return request<DocumentRecord>("/api/documents", {
    method: "POST",
    body: formData,
  });
}

export async function fetchDocuments(): Promise<DocumentSummary[]> {
  return request<DocumentSummary[]>("/api/documents");
}

export async function fetchDocument(id: string): Promise<DocumentRecord> {
  return request<DocumentRecord>(
    `/api/documents/${encodeURIComponent(id)}`,
  );
}

export async function createAnalysisRun(
  documentIds: string[],
): Promise<AnalysisRun> {
  return request<AnalysisRun>("/api/analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentIds }),
  });
}

export async function fetchAnalysisRun(runId: string): Promise<AnalysisRun> {
  return request<AnalysisRun>(
    `/api/analysis/runs/${encodeURIComponent(runId)}`,
  );
}

export async function fetchAnalysisResult(
  resultId: string,
): Promise<AnalysisResult> {
  return request<AnalysisResult>(
    `/api/analysis/results/${encodeURIComponent(resultId)}`,
  );
}

export type ExportKind = "word" | "powerpoint";

export interface ExportOptions {
  resultId?: string | null;
  runId?: string | null;
}

export function apiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
  );
}

export function buildExportUrl(kind: ExportKind, options: ExportOptions): string {
  const path =
    kind === "word" ? "/api/exports/report" : "/api/exports/presentation";
  const params = new URLSearchParams();
  if (options.resultId) params.set("result_id", options.resultId);
  if (options.runId) params.set("run_id", options.runId);
  const query = params.toString();
  return `${apiBaseUrl()}${path}${query ? `?${query}` : ""}`;
}

export function defaultExportFilename(kind: ExportKind): string {
  return kind === "word"
    ? "Meridian-Bank-Operational-Risk-Report.docx"
    : "Meridian-Bank-Board-Presentation.pptx";
}

export function filenameFromContentDisposition(
  header: string | null,
): string | null {
  if (!header) return null;
  const match = /filename\*=utf-8''([^;]+)|filename="?([^";]+)"?/i.exec(
    header,
  );
  const value = match?.[1] ?? match?.[2];
  return value ? decodeURIComponent(value) : null;
}

export interface ExportFile {
  blob: Blob;
  filename: string;
}

export async function fetchExportFile(
  kind: ExportKind,
  options: ExportOptions,
): Promise<ExportFile> {
  const response = await fetch(buildExportUrl(kind, options));
  if (!response.ok) {
    let detail = `Export failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // response body was not JSON
    }
    throw new ApiError(response.status, detail);
  }
  const blob = await response.blob();
  const filename =
    filenameFromContentDisposition(
      response.headers.get("content-disposition"),
    ) ?? defaultExportFilename(kind);
  return { blob, filename };
}

export function saveExportFile(file: ExportFile): void {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadExport(
  kind: ExportKind,
  options: ExportOptions,
): Promise<void> {
  const file = await fetchExportFile(kind, options);
  saveExportFile(file);
}
