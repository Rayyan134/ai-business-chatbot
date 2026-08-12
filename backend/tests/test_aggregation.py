import pytest

from app.analysis.aggregation import AggregatedAnalysis, aggregate_interpretation
from app.analysis.aggregation.formulas import (
    exposure_severity,
    heat_level,
    level_from_score,
    likelihood_label,
    severity_weight,
)
from app.analysis.models import (
    AuditFinding,
    DocumentInterpretation,
    ExceptionItem,
    InterpretedDocuments,
    MISRow,
    RiskItem,
    SourceRef,
)


def source(
    doc: str = "d1",
    ref: str = "Risk Register.csv · row 2",
    snippet: str = "risk row data",
) -> SourceRef:
    return SourceRef(
        documentId=doc,
        documentType="csv",
        category="risk-register",
        sourceRef=ref,
        snippet=snippet,
    )


def make_risk(
    id="r1",
    severity="High",
    division="Retail Banking",
    category="Cyber",
    likelihood="3",
    impact="4",
    status="Open",
    owner="Owner",
    mitigation="MFA",
):
    return RiskItem(
        id=id,
        description=f"Risk {id}",
        category=category,
        division=division,
        likelihood=likelihood,
        impact=impact,
        severity=severity,
        status=status,
        owner=owner,
        mitigation=mitigation,
        source=source(ref=f"Risk Register.csv · row 2", snippet=f"Risk {id} row"),
    )


def make_audit(
    id="f1",
    rating="High",
    division="Retail",
    status="Open",
    due_date="2026-06-30",
    owner="Auditor",
):
    return AuditFinding(
        id=id,
        title=f"Finding {id}",
        division=division,
        rating=rating,
        status=status,
        dueDate=due_date,
        owner=owner,
        source=source(ref=f"Audit Findings.csv · row 2", snippet=f"Finding {id} row"),
    )


def make_exception(
    id="e1",
    severity="High",
    division="Corporate",
    status="Active",
    days_open=10,
):
    return ExceptionItem(
        id=id,
        description=f"Exception {id}",
        division=division,
        raisedDate="2026-01-15",
        severity=severity,
        status=status,
        daysOpen=days_open,
        owner="Owner",
        source=source(ref=f"Exception Log.csv · row 2", snippet=f"Exception {id} row"),
    )


def make_mis(id="m1", indicator="High risk count", period="2026-01", value="12"):
    return MISRow(
        id=id,
        indicator=indicator,
        period=period,
        value=value,
        unit="",
        source=source(doc="d4", ref=f"MIS.csv · row 2", snippet=f"{indicator} {period}"),
    )


def build(
    risks=None,
    findings=None,
    exceptions=None,
    mis=None,
    doc_ids=None,
    coverage=None,
    warnings=None,
) -> InterpretedDocuments:
    return InterpretedDocuments(
        documentIds=doc_ids or [],
        riskRegister=risks or [],
        auditFindings=findings or [],
        exceptions=exceptions or [],
        misRows=mis or [],
        coverage=coverage or [],
        warnings=warnings or [],
    )


def coverage_entry(
    id="d1",
    filename="Risk Register.csv",
    category="risk-register",
    status="interpreted",
    available=True,
    evidence_count=1,
    rows_processed=5,
):
    return DocumentInterpretation(
        id=id,
        filename=filename,
        category=category,
        status=status,
        available=available,
        evidenceCount=evidence_count,
        rowsProcessed=rows_processed,
    )


class TestFormulas:
    def test_severity_weights(self):
        assert severity_weight("Critical") == 4
        assert severity_weight("High") == 3
        assert severity_weight("Medium") == 2
        assert severity_weight("Low") == 1

    def test_level_thresholds(self):
        assert level_from_score(100) == "Critical"
        assert level_from_score(88) == "Critical"
        assert level_from_score(87) == "High"
        assert level_from_score(63) == "High"
        assert level_from_score(62) == "Medium"
        assert level_from_score(38) == "Medium"
        assert level_from_score(37) == "Low"
        assert level_from_score(0) == "Low"

    def test_likelihood_labels(self):
        assert likelihood_label("5") == "Very likely"
        assert likelihood_label("4") == "Likely"
        assert likelihood_label("3") == "Possible"
        assert likelihood_label("2") == "Unlikely"
        assert likelihood_label("1") == "Rare"
        assert likelihood_label("n/a") == "n/a"

    def test_exposure_severity_from_likelihood_impact(self):
        assert exposure_severity("4", "5") == "Critical"
        assert exposure_severity("3", "4") == "High"
        assert exposure_severity("2", "2") == "Low"
        assert exposure_severity("", "5") is None

    def test_heat_level(self):
        assert heat_level("4", "5", "Low") == 4
        assert heat_level("2", "2", "Medium") == 1
        assert heat_level("", "", "Critical") == 4


class TestRiskCounts:
    def test_severity_counts_and_distribution(self):
        risks = [
            make_risk("c1", severity="Critical"),
            make_risk("h1", severity="High"),
            make_risk("h2", severity="High"),
            make_risk("m1", severity="Medium"),
            make_risk("l1", severity="Low"),
            make_risk("l2", severity="Low"),
            make_risk("l3", severity="Low"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        distribution = {
            bucket.severity: bucket.count for bucket in result.severityDistribution
        }
        assert distribution == {
            "Critical": 1,
            "High": 2,
            "Medium": 1,
            "Low": 3,
        }
        assert [bucket.severity for bucket in result.severityDistribution] == [
            "Critical",
            "High",
            "Medium",
            "Low",
        ]
        metrics = {metric.id: metric.value for metric in result.metrics}
        assert metrics["critical-risks"] == 1
        assert metrics["high-risks"] == 2
        assert metrics["medium-risks"] == 1
        assert metrics["low-risks"] == 3
        assert metrics["total-risks"] == 7


class TestOverallScore:
    def test_all_critical_is_100_critical(self):
        risks = [make_risk("c1", severity="Critical") for _ in range(3)]
        result = aggregate_interpretation(build(risks=risks))
        assert result.overallScore == 100
        assert result.overallLevel == "Critical"

    def test_all_low_is_25_low(self):
        risks = [make_risk("l1", severity="Low"), make_risk("l2", severity="Low")]
        result = aggregate_interpretation(build(risks=risks))
        assert result.overallScore == 25
        assert result.overallLevel == "Low"

    def test_all_high_is_75_high(self):
        risks = [make_risk("h1", severity="High") for _ in range(4)]
        result = aggregate_interpretation(build(risks=risks))
        assert result.overallScore == 75
        assert result.overallLevel == "High"

    def test_mixed_pool_with_audit_and_overdue_exception(self):
        risks = [make_risk("h1", severity="High"), make_risk("h2", severity="High")]
        findings = [make_audit("f1", rating="Medium")]
        exceptions = [make_exception("e1", severity="Low", days_open=40)]
        result = aggregate_interpretation(
            build(risks=risks, findings=findings, exceptions=exceptions)
        )
        # weights: 3, 3, 2, 1.25 -> mean 2.3125 -> 57.8125 -> 58
        assert result.overallScore == 58
        assert result.overallLevel == "Medium"

    def test_three_high_one_low_is_62_medium(self):
        risks = [
            make_risk("h1", severity="High"),
            make_risk("h2", severity="High"),
            make_risk("h3", severity="High"),
            make_risk("l1", severity="Low"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        assert result.overallScore == 62
        assert result.overallLevel == "Medium"

    def test_closed_audit_findings_excluded_from_score(self):
        findings = [
            make_audit("f1", rating="Critical", status="Open"),
            make_audit("f2", rating="Critical", status="Closed"),
        ]
        result = aggregate_interpretation(build(findings=findings))
        assert result.overallScore == 100
        assert result.overallLevel == "Critical"
        assert result.auditMetrics["closed"] == 1
        assert result.auditMetrics["open"] == 1

    def test_score_description_is_factual(self):
        risks = [make_risk("h1", severity="High")]
        result = aggregate_interpretation(build(risks=risks))
        assert result.overallDescription.startswith(
            "Weighted-average severity exposure score"
        )
        assert "75/100" in result.overallDescription


class TestTopRisks:
    def test_ranking_uses_likelihood_times_impact(self):
        risks = [
            make_risk("r1", severity="High", likelihood="3", impact="4"),
            make_risk("r2", severity="High", likelihood="5", impact="5"),
            make_risk("r3", severity="Critical", likelihood="", impact=""),
        ]
        result = aggregate_interpretation(build(risks=risks))
        ids = [finding.id for finding in result.keyFindings]
        assert ids == ["r2", "r3", "r1"]
        top = result.keyFindings[0]
        assert top.likelihood == "Very likely"
        assert top.exposure == "Critical"
        assert top.severity == "High"

    def test_evidence_preserved(self):
        risk = make_risk("r1", severity="Critical", likelihood="5", impact="5")
        result = aggregate_interpretation(build(risks=[risk]))
        finding = result.keyFindings[0]
        assert finding.evidence[0].sourceRef == "Risk Register.csv · row 2"
        assert finding.evidence[0].documentId == "d1"
        assert finding.evidence[0].documentType == "csv"
        assert finding.evidence[0].snippet == "Risk r1 row"

    def test_cap_at_top_risks_limit(self):
        risks = [make_risk(f"r{i}", severity="Low") for i in range(12)]
        result = aggregate_interpretation(build(risks=risks))
        assert len(result.keyFindings) == 6


class TestHeatmap:
    def test_cells_use_numeric_likelihood_impact(self):
        risks = [
            make_risk("ra", severity="Critical", likelihood="5", impact="5"),
            make_risk("rb", severity="Medium", likelihood="2", impact="2"),
            make_risk("rc", severity="Low", likelihood="", impact="", division="Technology"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        rows = {row.division: row for row in result.heatmap}
        retail = {cell.category: cell.level for cell in rows["Retail Banking"].cells}
        tech = {cell.category: cell.level for cell in rows["Technology"].cells}
        assert retail == {"Cyber": 4}
        assert tech == {"Cyber": 1}

    def test_cells_sorted_by_level_then_category(self):
        risks = [
            make_risk("r1", division="Retail Banking", category="Process", severity="High"),
            make_risk("r2", division="Retail Banking", category="Cyber", severity="Critical"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        row = result.heatmap[0]
        assert [cell.category for cell in row.cells] == ["Cyber", "Process"]

    def test_missing_division_or_category_not_invented(self):
        risks = [
            make_risk("r1", division="", category="Cyber", severity="High"),
            make_risk("r2", division="Marketing", category="", severity="Medium"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        assert result.heatmap == []
        assert any("excluded from heatmap" in w for w in result.warnings)
        assert any("no division" in w for w in result.warnings)
        assert any("no category" in w for w in result.warnings)


class TestDivisionAndCategoryExposure:
    def test_division_exposure(self):
        risks = [
            make_risk("r1", division="Retail Banking", category="Cyber", severity="Critical"),
            make_risk("r2", division="Retail Banking", category="Process", severity="High"),
            make_risk("r3", division="Technology", category="Cyber", severity="Low"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        divisions = {row.division: row for row in result.divisionExposure}
        retail = divisions["Retail Banking"]
        assert retail.count == 2
        assert retail.severityScore == 7
        assert retail.level == "Critical"
        assert divisions["Technology"].count == 1
        assert divisions["Technology"].severityScore == 1
        assert divisions["Technology"].level == "Low"

    def test_category_exposure(self):
        risks = [
            make_risk("r1", division="Retail Banking", category="Cyber", severity="Critical"),
            make_risk("r2", division="Technology", category="Cyber", severity="Low"),
            make_risk("r3", division="Retail Banking", category="Process", severity="High"),
        ]
        result = aggregate_interpretation(build(risks=risks))
        categories = {row.category: row for row in result.categoryExposure}
        assert categories["Cyber"].count == 2
        assert categories["Cyber"].severityScore == 5
        assert categories["Process"].count == 1
        assert categories["Process"].severityScore == 3
        assert categories["Process"].level == "High"


class TestAuditMetrics:
    def test_audit_metrics(self):
        findings = [
            make_audit("f1", rating="Critical", division="Retail", status="Open"),
            make_audit("f2", rating="High", division="Retail", status="In Progress"),
            make_audit("f3", rating="Medium", division="Treasury", status="Overdue"),
            make_audit("f4", rating="Low", division="Treasury", status="Closed"),
        ]
        result = aggregate_interpretation(build(findings=findings))
        assert result.auditMetrics["total"] == 4
        assert result.auditMetrics["open"] == 3
        assert result.auditMetrics["closed"] == 1
        assert result.auditMetrics["overdue"] == 1
        assert result.auditMetrics["Critical"] == 1
        assert result.auditMetrics["High"] == 1
        assert result.auditMetrics["Medium"] == 1
        assert result.auditMetrics["Low"] == 1

    def test_audit_by_division(self):
        findings = [
            make_audit("f1", rating="Critical", division="Retail", status="Open"),
            make_audit("f2", rating="High", division="Retail", status="Open"),
            make_audit("f3", rating="Medium", division="Treasury", status="Closed"),
        ]
        result = aggregate_interpretation(build(findings=findings))
        rows = {row.division: row for row in result.auditByDivision}
        retail = rows["Retail"]
        assert retail.total == 2
        assert retail.open == 2
        assert retail.closed == 0
        assert retail.critical == 1
        assert retail.high == 1
        assert retail.medium == 0
        assert rows["Treasury"].total == 1
        assert rows["Treasury"].closed == 1


class TestExceptionMetrics:
    def test_exception_metrics(self):
        exceptions = [
            make_exception("e1", severity="High", status="Overdue", days_open=40),
            make_exception("e2", severity="Medium", status="Active", days_open=10),
            make_exception("e3", severity="Low", status="Active", days_open=45),
        ]
        result = aggregate_interpretation(build(exceptions=exceptions))
        assert result.exceptionMetrics["total"] == 3
        assert result.exceptionMetrics["open"] == 3
        assert result.exceptionMetrics["overdue"] == 2
        assert result.exceptionMetrics["High"] == 1
        assert result.exceptionMetrics["Medium"] == 1
        assert result.exceptionMetrics["Low"] == 1
        assert result.exceptionsAvgDaysOpen == 31.7
        assert result.exceptionsMaxDaysOpen == 45

    def test_overdue_by_status_or_days(self):
        exceptions = [
            make_exception("e1", severity="Low", status="Overdue", days_open=1),
            make_exception("e2", severity="Low", status="Active", days_open=30),
            make_exception("e3", severity="Low", status="Active", days_open=29),
        ]
        result = aggregate_interpretation(build(exceptions=exceptions))
        assert result.exceptionMetrics["overdue"] == 2

    def test_exception_by_division(self):
        exceptions = [
            make_exception("e1", severity="High", division="Corporate", days_open=40),
            make_exception("e2", severity="Medium", division="Corporate", days_open=10),
            make_exception("e3", severity="Low", division="IT", days_open=45),
        ]
        result = aggregate_interpretation(build(exceptions=exceptions))
        rows = {row.division: row for row in result.exceptionByDivision}
        corporate = rows["Corporate"]
        assert corporate.total == 2
        assert corporate.overdue == 1
        assert corporate.high == 1
        assert corporate.medium == 1
        assert corporate.avgDaysOpen == 25.0
        assert corporate.maxDaysOpen == 40
        assert rows["IT"].total == 1
        assert rows["IT"].overdue == 1
        assert rows["IT"].avgDaysOpen == 45.0


class TestTrend:
    def test_trend_built_from_usable_mis_rows(self):
        mis = [
            make_mis("m1", indicator="High risk count", period="2026-01", value="12"),
            make_mis("m2", indicator="High risk count", period="2026-02", value="10"),
            make_mis("m3", indicator="Medium risk count", period="2026-01", value="30"),
            make_mis("m4", indicator="Low risk count", period="2026-01", value="40"),
            make_mis("m5", indicator="System uptime", period="2026-01", value="99.9"),
        ]
        result = aggregate_interpretation(build(mis=mis))
        assert result.trendAvailable is True
        points = {point.month: point for point in result.trend}
        assert points["2026-01"].high == 12
        assert points["2026-01"].medium == 30
        assert points["2026-01"].low == 40
        assert points["2026-02"].high == 10
        assert points["2026-02"].medium == 0
        assert points["2026-02"].low == 0
        assert not any("trend" in w for w in result.warnings)

    def test_trend_parses_alternative_month_formats(self):
        mis = [
            make_mis("m1", indicator="High risk count", period="Jan 2026", value="7"),
        ]
        result = aggregate_interpretation(build(mis=mis))
        assert result.trendAvailable is True
        assert result.trend[0].month == "2026-01"
        assert result.trend[0].high == 7

    def test_trend_unavailable_without_usable_series(self):
        mis = [
            make_mis("m1", indicator="High risk count", period="", value="12"),
            make_mis("m2", indicator="System uptime", period="2026-01", value="99.9"),
        ]
        result = aggregate_interpretation(build(mis=mis))
        assert result.trend == []
        assert result.trendAvailable is False
        assert any("trend unavailable" in w for w in result.warnings)


class TestMissingAndEmptyData:
    def test_empty_documents(self):
        result = aggregate_interpretation(build())
        assert result.overallScore == 0
        assert result.overallLevel == "Low"
        assert result.confidence == 0
        assert result.trend == []
        assert result.keyFindings == []
        assert result.heatmap == []
        assert result.documents == []
        assert any("No documents received" in w for w in result.warnings)
        assert any("No interpretable risk data available" in w for w in result.warnings)

    def test_audit_only_aggregation_warns(self):
        findings = [make_audit("f1", rating="High", status="Open")]
        result = aggregate_interpretation(
            build(findings=findings, doc_ids=["d1"], coverage=[coverage_entry()])
        )
        assert result.overallScore == 75
        assert any("No risk register items" in w for w in result.warnings)
        assert any("No exceptions to aggregate" in w for w in result.warnings)
        assert any("reflects audit findings and exceptions only" in w for w in result.warnings)
        assert not any("No audit findings" in w for w in result.warnings)

    def test_interpreted_warnings_carried_through(self):
        result = aggregate_interpretation(build(warnings=["Column mapping guessed"]))
        assert "Column mapping guessed" in result.warnings


class TestCoverage:
    def test_coverage_summary(self):
        coverage = [
            coverage_entry(
                "d1", "Risk Register.csv", "risk-register",
                evidence_count=3, rows_processed=5,
            ),
            coverage_entry(
                "d2", "Audit Findings.csv", "audit-findings",
                evidence_count=2, rows_processed=8,
            ),
            coverage_entry(
                "d3", "Missing.csv", "", "skipped", available=False,
                evidence_count=0, rows_processed=0,
            ),
        ]
        result = aggregate_interpretation(
            build(doc_ids=["d1", "d2", "d3"], coverage=coverage)
        )
        assert result.coverage.documentsReceived == 3
        assert result.coverage.documentsInterpreted == 2
        assert result.coverage.documentsSkipped == 1
        assert result.coverage.rowsProcessed == 13
        assert result.coverage.evidenceCount == 5
        statuses = {doc.id: doc.status for doc in result.documents}
        assert statuses == {"d1": "ready", "d2": "ready", "d3": "skipped"}
        assert any("1 document(s) skipped" in w for w in result.warnings)


class TestConfidence:
    def test_full_data_confidence_100(self):
        risk = make_risk("r1", severity="Critical")
        interpreted = build(
            risks=[risk],
            doc_ids=["d1", "d2"],
            coverage=[
                coverage_entry("d1"),
                coverage_entry("d2", "Audit Findings.csv", "audit-findings"),
            ],
        )
        result = aggregate_interpretation(interpreted)
        assert result.confidence == 100

    def test_confidence_with_missing_document(self):
        risk = make_risk("r1", severity="Critical")
        coverage = [
            coverage_entry("d1"),
            coverage_entry("d2", "Missing.csv", "", "skipped", available=False),
        ]
        result = aggregate_interpretation(
            build(risks=[risk], doc_ids=["d1", "d2"], coverage=coverage)
        )
        # 0.40*0.5 + 0.25*0.5 + 0.25*1 + 0.10*1 = 0.675 -> 68
        assert result.confidence == 68

    def test_no_data_confidence_0(self):
        result = aggregate_interpretation(build())
        assert result.confidence == 0


class TestSerialization:
    def test_aggregated_analysis_round_trips_through_json(self):
        risks = [make_risk("r1", severity="Critical", likelihood="5", impact="5")]
        result = aggregate_interpretation(build(risks=risks))
        restored = AggregatedAnalysis.model_validate_json(result.model_dump_json())
        assert restored == result
        assert restored.overallScore == 100
        assert restored.keyFindings[0].evidence[0].sourceRef is not None
