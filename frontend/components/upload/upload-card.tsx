"use client";

import { useRef } from "react";
import { Check, FileUp, X } from "lucide-react";
import type { DocTypeDefinition, DocTypeId, UploadRecord } from "@/lib/upload-types";
import { Badge } from "@/components/badge";
import { ProgressBar } from "@/components/upload/progress-bar";
import {
  formatBytes,
  formatRelativeTime,
  getAcceptedExtensions,
} from "@/lib/upload-utils";

interface UploadCardProps {
  definition: DocTypeDefinition;
  upload: UploadRecord | null;
  onFile: (docType: DocTypeId, file: File) => void;
  onRemove: (docType: DocTypeId) => void;
}

export function UploadCard({ definition, upload, onFile, onRemove }: UploadCardProps) {
  const { id, label, description, required, icon: Icon } = definition;
  const inputRef = useRef<HTMLInputElement>(null);
  const extensions = getAcceptedExtensions();

  function pickFile() {
    inputRef.current?.click();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFile(id, file);
    event.target.value = "";
  }

  const isUploaded = upload?.state === "uploaded";
  const isUploading = upload?.state === "uploading";

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isUploaded
          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
          : "border-border-subtle bg-surface"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={extensions.join(",")}
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isUploaded
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-surface-elevated text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        {isUploading ? (
          <Badge tone="blue">Uploading</Badge>
        ) : isUploaded ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
            <Check className="h-3 w-3" />
            Uploaded
          </span>
        ) : (
          <Badge tone={required ? "slate" : "amber"}>
            {required ? "Missing" : "Optional"}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        {!upload ? (
          <button
            type="button"
            onClick={pickFile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FileUp className="h-3.5 w-3.5" />
            Choose file
          </button>
        ) : isUploading ? (
          <div>
            <p className="truncate text-sm font-medium text-foreground">
              {upload.file.name}
            </p>
            <div className="mt-2">
              <ProgressBar value={upload.progress} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {upload.file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(upload.file.size)} · Uploaded{" "}
                {formatRelativeTime(upload.uploadedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={pickFile}
                title="Replace file"
                className="rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onRemove(id)}
                title="Remove file"
                aria-label={`Remove ${label}`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
