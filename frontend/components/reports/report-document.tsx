import { AiRecommendationsSection } from "@/components/reports/ai-recommendations-section";
import { AuditFindingsSection } from "@/components/reports/audit-findings-section";
import { BoardSummarySection } from "@/components/reports/board-summary-section";
import { ExceptionsSection } from "@/components/reports/exceptions-section";
import { ExecutiveSummarySection } from "@/components/reports/executive-summary-section";
import { KeyFindingsSection } from "@/components/reports/key-findings-section";
import { ManagementActionsSection } from "@/components/reports/management-actions-section";
import { ReportFooter } from "@/components/reports/report-footer";
import { ReportHeader } from "@/components/reports/report-header";
import { RiskOverviewSection } from "@/components/reports/risk-overview-section";
import { RiskScoreSection } from "@/components/reports/risk-score-section";
import {
  auditFindings,
  boardSummary,
  exceptions,
  executiveSummary,
  keyFindings,
  managementActions,
  recommendations,
  reportMeta,
  riskOverview,
  riskScore,
} from "@/lib/report-data";

export function ReportDocument() {
  return (
    <article className="mx-auto max-w-4xl rounded-xl border border-border-subtle bg-surface p-6 shadow-sm sm:p-10">
      <div className="space-y-10">
        <ReportHeader meta={reportMeta} />
        <ExecutiveSummarySection data={executiveSummary} />
        <BoardSummarySection data={boardSummary} />
        <RiskOverviewSection data={riskOverview} />
        <RiskScoreSection data={riskScore} />
        <KeyFindingsSection data={keyFindings} />
        <AuditFindingsSection data={auditFindings} />
        <ExceptionsSection data={exceptions} />
        <AiRecommendationsSection data={recommendations} />
        <ManagementActionsSection data={managementActions} />
        <ReportFooter meta={reportMeta} />
      </div>
    </article>
  );
}
