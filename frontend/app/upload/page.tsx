import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { UploadWorkspace } from "@/components/upload/upload-workspace";

export const metadata: Metadata = {
  title: "Upload Documents · Risk Copilot",
  description:
    "Upload operational risk documents for AI analysis.",
};

export default function UploadPage() {
  return (
    <AppShell title="Upload Documents">
      <UploadWorkspace />
    </AppShell>
  );
}
