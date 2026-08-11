import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ReportDocument } from "@/components/reports/report-document";
import { ReportToolbar } from "@/components/reports/report-toolbar";

export const metadata: Metadata = {
  title: "Report Preview · Risk Copilot",
  description:
    "AI-generated monthly operational risk report preview for Meridian Bank.",
};

export default function ReportPreviewPage() {
  return (
    <AppShell title="Report Preview">
      <ReportToolbar />
      <ReportDocument />
    </AppShell>
  );
}
