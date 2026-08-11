"use client";

import { useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  FileType,
  Table,
  UploadCloud,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAcceptedExtensions } from "@/lib/upload-utils";

interface FormatChipProps {
  icon: LucideIcon;
  label: string;
}

function FormatChip({ icon: Icon, label }: FormatChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  error: string | null;
  onDismissError: () => void;
}

export function DropZone({ onFiles, error, onDismissError }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const extensions = getAcceptedExtensions();

  function openPicker() {
    inputRef.current?.click();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onFiles(files);
    event.target.value = "";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload documents"
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border-subtle bg-surface hover:border-primary/40 hover:bg-surface-elevated"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={extensions.join(",")}
        className="hidden"
        onChange={handleChange}
      />

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 ${
          isDragging ? "scale-110" : "group-hover:scale-105"
        }`}
      >
        <UploadCloud className="h-7 w-7" />
      </div>

      <p className="mt-4 text-base font-semibold text-foreground">
        Drag &amp; Drop your documents
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        or{" "}
        <span className="font-medium text-primary underline-offset-4 group-hover:underline">
          browse files
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <FormatChip icon={FileSpreadsheet} label="Excel (.xlsx)" />
        <FormatChip icon={FileText} label="PDF" />
        <FormatChip icon={FileType} label="Word (.docx)" />
        <FormatChip icon={Table} label="CSV" />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Maximum 20MB each · Multiple upload enabled
      </p>

      {error ? (
        <div
          className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="truncate">{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={onDismissError}
            className="shrink-0 rounded p-0.5 hover:bg-rose-100 dark:hover:bg-rose-500/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
