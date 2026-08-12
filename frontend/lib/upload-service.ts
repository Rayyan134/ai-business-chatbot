import { uploadDocument } from "@/lib/api-client";
import type { DocumentRecord } from "@/lib/document-types";
import { startAnalysisRun } from "@/lib/analysis-flow";
import { detectDocType } from "@/lib/upload-utils";

export async function handleUpload(file: File): Promise<DocumentRecord | null> {
  try {
    const record = await uploadDocument(file, detectDocType(file.name));
    if (record.status === "failed") {
      console.warn(`Document parsed with errors: ${record.error ?? "unknown"}`);
    }
    return record;
  } catch (error) {
    console.warn("Upload to ingestion backend failed:", error);
    return null;
  }
}

export async function analyzeDocuments(
  documentIds: string[],
): Promise<string | null> {
  return startAnalysisRun(documentIds);
}
