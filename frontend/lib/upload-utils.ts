import type { DocTypeId } from "@/lib/upload-types";

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".pdf", ".docx", ".csv"];

export function getAcceptedExtensions(): string[] {
  return ACCEPTED_EXTENSIONS;
}

export function isAcceptedFile(file: File): boolean {
  const extension = file.name.toLowerCase().split(".").pop();
  if (!extension) return false;
  if (!ACCEPTED_EXTENSIONS.includes(`.${extension}`)) return false;
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function detectDocType(filename: string): DocTypeId {
  const lower = filename.toLowerCase();
  if (lower.includes("risk")) return "risk-register";
  if (lower.includes("audit") || lower.includes("gia")) return "audit-findings";
  if (lower.includes("exception")) return "exception-log";
  if (lower.includes("mis")) return "mis";
  return "policy";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value >= 100 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
