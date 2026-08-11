import { FolderOpen } from "lucide-react";
import type { RecentUploadRow } from "@/lib/upload-types";
import { DOC_TYPE_LABELS } from "@/lib/upload-data";
import { Card, CardHeader } from "@/components/card";
import { UploadStatusBadge } from "@/components/upload/upload-status-badge";

interface RecentUploadsTableProps {
  rows: RecentUploadRow[];
  loading: boolean;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border-subtle last:border-b-0">
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-48 animate-pulse rounded bg-border-subtle" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-28 animate-pulse rounded bg-border-subtle" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-24 animate-pulse rounded bg-border-subtle" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-20 animate-pulse rounded bg-border-subtle" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-border-subtle" />
      </td>
    </tr>
  );
}

export function RecentUploadsTable({ rows, loading }: RecentUploadsTableProps) {
  return (
    <Card>
      <CardHeader
        title="Recent Uploads"
        subtitle="Documents submitted across the last 30 days"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Filename</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Uploaded By</th>
              <th className="px-5 py-3 font-semibold">Time</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      No uploads yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded documents will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-surface-elevated"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {row.filename}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {DOC_TYPE_LABELS[row.docType]}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {row.uploadedBy}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {row.time}
                  </td>
                  <td className="px-5 py-3">
                    <UploadStatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
