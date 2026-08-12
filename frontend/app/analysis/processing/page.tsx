import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { AnalysisProcessing } from "@/components/analysis/analysis-processing";

export const metadata: Metadata = {
  title: "AI Analysis · Risk Copilot",
  description: "Analyzing operational risk documents for Meridian Bank.",
};

export default async function AnalysisProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ runId?: string }>;
}) {
  const { runId } = await searchParams;
  return (
    <AppShell title="AI Analysis">
      <AnalysisProcessing runId={runId} />
    </AppShell>
  );
}
