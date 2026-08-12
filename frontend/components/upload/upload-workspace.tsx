"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionBar } from "@/components/upload/action-bar";
import { DropZone } from "@/components/upload/drop-zone";
import { RecentUploadsTable } from "@/components/upload/recent-uploads-table";
import { SupportedFormats } from "@/components/upload/supported-formats";
import { UploadCard } from "@/components/upload/upload-card";
import { DOC_TYPES, initialRecentUploads } from "@/lib/upload-data";
import { analyzeDocuments, handleUpload } from "@/lib/upload-service";
import type {
  DocTypeId,
  RecentUploadRow,
  UploadRecord,
} from "@/lib/upload-types";
import { detectDocType, isAcceptedFile } from "@/lib/upload-utils";

const REQUIRED_TYPES: DocTypeId[] = [
  "risk-register",
  "audit-findings",
  "exception-log",
  "mis",
];

function createEmptyUploads(): Record<DocTypeId, UploadRecord | null> {
  return {
    "risk-register": null,
    "audit-findings": null,
    "exception-log": null,
    mis: null,
    policy: null,
  };
}

export function UploadWorkspace() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Record<DocTypeId, UploadRecord | null>>(
    createEmptyUploads,
  );
  const [recent, setRecent] = useState<RecentUploadRow[]>(initialRecentUploads);
  const [recentLoading, setRecentLoading] = useState(true);
  const [dropError, setDropError] = useState<string | null>(null);

  const timersRef = useRef<Partial<Record<DocTypeId, ReturnType<typeof setInterval>>>>({});
  const completionsRef = useRef<Partial<Record<DocTypeId, ReturnType<typeof setTimeout>>>>({});
  const uploadIdsRef = useRef<Partial<Record<DocTypeId, string>>>({});
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setRecentLoading(false), 900);
    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    const completions = completionsRef.current;
    return () => {
      Object.values(timers).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
      Object.values(completions).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  function clearPendingTimers(docType: DocTypeId) {
    const interval = timersRef.current[docType];
    if (interval) clearInterval(interval);
    const completion = completionsRef.current[docType];
    if (completion) clearTimeout(completion);
  }

  function completeUpload(docType: DocTypeId, file: File) {
    clearPendingTimers(docType);

    setUploads((prev) => {
      const record = prev[docType];
      if (!record || record.state !== "uploading") return prev;
      return {
        ...prev,
        [docType]: {
          ...record,
          progress: 100,
          state: "uploaded",
          uploadedAt: new Date(),
        },
      };
    });

    setRecent((prev) => [
      {
        id: `${Date.now()}-${file.name}`,
        filename: file.name,
        docType,
        uploadedBy: "Sarah Chen",
        time: "Just now",
        status: "Ready",
      },
      ...prev,
    ]);

    void handleUpload(file).then((record) => {
      if (record) uploadIdsRef.current[docType] = record.id;
    });
  }

  function uploadFile(docType: DocTypeId, file: File) {
    clearPendingTimers(docType);

    setUploads((prev) => ({
      ...prev,
      [docType]: { file, progress: 0, state: "uploading", uploadedAt: null },
    }));

    const duration = 1800 + Math.random() * 1600;
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const progress = Math.min(
        100,
        Math.round(((Date.now() - startedAt) / duration) * 100),
      );
      setUploads((prev) => {
        const record = prev[docType];
        if (!record || record.state !== "uploading") return prev;
        return { ...prev, [docType]: { ...record, progress } };
      });
      if (progress >= 100) clearInterval(interval);
    }, 100);
    timersRef.current[docType] = interval;

    const completion = setTimeout(
      () => completeUpload(docType, file),
      duration + 150,
    );
    completionsRef.current[docType] = completion;
  }

  function handleFiles(files: File[]) {
    const accepted: File[] = [];
    let rejectedCount = 0;

    for (const file of files) {
      if (isAcceptedFile(file)) {
        accepted.push(file);
      } else {
        rejectedCount += 1;
      }
    }

    if (rejectedCount > 0) {
      setDropError(
        `${rejectedCount} file${rejectedCount === 1 ? "" : "s"} could not be added — use Excel, PDF, Word or CSV up to 20MB.`,
      );
    } else {
      setDropError(null);
    }

    for (const file of accepted) {
      uploadFile(detectDocType(file.name), file);
    }
  }

  function removeUpload(docType: DocTypeId) {
    clearPendingTimers(docType);
    setUploads((prev) => ({ ...prev, [docType]: null }));
  }

  async function handleAnalyze() {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const documentIds = REQUIRED_TYPES.filter(
        (docType) => uploads[docType]?.state === "uploaded",
      )
        .map((docType) => uploadIdsRef.current[docType])
        .filter((id): id is string => Boolean(id));

      const runId = await analyzeDocuments(documentIds);
      router.push(
        runId
          ? `/analysis/processing?runId=${encodeURIComponent(runId)}`
          : "/analysis/processing",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const requiredUploaded = REQUIRED_TYPES.filter(
    (docType) => uploads[docType]?.state === "uploaded",
  ).length;
  const analyzeEnabled = requiredUploaded === REQUIRED_TYPES.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Upload Documents
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your monthly operational risk documents for AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DropZone
            onFiles={handleFiles}
            error={dropError}
            onDismissError={() => setDropError(null)}
          />

          <section aria-label="Required document types">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Required Documents
              </h2>
              <span className="text-xs text-muted-foreground">
                {requiredUploaded} of {REQUIRED_TYPES.length} uploaded
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DOC_TYPES.map((definition) => (
                <UploadCard
                  key={definition.id}
                  definition={definition}
                  upload={uploads[definition.id]}
                  onFile={uploadFile}
                  onRemove={removeUpload}
                />
              ))}
            </div>
          </section>
        </div>

        <div>
          <SupportedFormats />
        </div>
      </div>

      <RecentUploadsTable rows={recent} loading={recentLoading} />

      <ActionBar
        enabled={analyzeEnabled}
        busy={analyzing}
        uploadedCount={requiredUploaded}
        requiredCount={REQUIRED_TYPES.length}
        onAnalyze={handleAnalyze}
      />
    </div>
  );
}
