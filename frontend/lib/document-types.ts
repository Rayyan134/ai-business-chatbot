import type { DocTypeId } from "@/lib/upload-types";

export type FileType = "pdf" | "docx" | "xlsx" | "xls" | "csv";
export type RecordStatus = "processing" | "ready" | "failed";

export interface ExtractedTable {
  name: string;
  headers: string[] | null;
  rows: (string | null)[][];
}

export interface DocumentMetadata {
  pageCount?: number;
  sheetCount?: number;
  rowCount?: number;
  columnHeaders?: string[];
  encoding?: string;
  author?: string;
  createdAt?: string;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  fileType: FileType;
  category: DocTypeId;
  uploadedAt: string;
  uploadedBy: string;
  sizeBytes: number;
  sha256: string;
  status: RecordStatus;
  error: string | null;
  text: string;
  tables: ExtractedTable[];
  metadata: DocumentMetadata;
}

export interface DocumentSummary {
  id: string;
  filename: string;
  fileType: FileType;
  category: DocTypeId;
  uploadedAt: string;
  uploadedBy: string;
  sizeBytes: number;
  status: RecordStatus;
  error: string | null;
}
