import { AppShell } from "@/components/app-shell";
import { AuditFindingsTable } from "@/components/audit-findings-table";
import { KpiCard } from "@/components/kpi-card";
import { RecentActivity } from "@/components/recent-activity";
import { RiskTrendChart } from "@/components/risk-trend-chart";
import { WelcomeSection } from "@/components/welcome-section";
import { activities, auditFindings, kpis, riskTrend } from "@/lib/data";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <WelcomeSection />

        <section
          aria-label="Key performance indicators"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RiskTrendChart data={riskTrend} />
          </div>
          <RecentActivity items={activities} />
        </div>

        <AuditFindingsTable findings={auditFindings} />
      </div>
    </AppShell>
  );
}
