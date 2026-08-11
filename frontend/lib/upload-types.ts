import type { LucideIcon } from "lucide-react";

export type DocTypeId =
  | "risk-register"
  | "audit-findings"
  | "exception-log"
  | "mis"
  | "policy";

export interface DocTypeDefinition {
  id: DocTypeId;
  label: string;
  description: string;
  required: boolean;
  icon: LucideIcon;
}

export type UploadState = "uploading" | "uploaded" | "failed";

export interface UploadRecord {
  file: File;
  progress: number;
  state: UploadState;
  uploadedAt: Date | null;
}

export type RecentStatus = "Ready" | "Processing" | "Failed";

export interface RecentUploadRow {
  id: string;
  filename: string;
  docType: DocTypeId;
  uploadedBy: string;
  time: string;
  status: RecentStatus;
}
