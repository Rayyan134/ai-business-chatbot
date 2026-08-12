from __future__ import annotations

from app.analysis.aggregation.formulas import (
    build_audit_by_division,
    build_audit_metrics,
    build_category_exposure,
    build_division_exposure,
    build_exception_by_division,
    build_exception_metrics,
    build_heatmap,
    build_metrics,
    build_trend,
    calculate_confidence,
    count_by_severity,
    overall_risk_score,
    rank_top_risks,
)
from app.analysis.aggregation.models import (
    AggregatedAnalysis,
    AuditDivisionMetrics,
    CategoryExposureRow,
    DocumentCoverageSummary,
    DivisionExposureRow,
    ExceptionDivisionMetrics,
    SeverityBucket,
)
from app.analysis.models import DocumentCoverage
from app.analysis.models.interpreted import InterpretedDocuments

_SEVERITY_ORDER = ("Critical", "High", "Medium", "Low")


def aggregate_interpretation(
    interpreted: InterpretedDocuments,
) -> AggregatedAnalysis:
    warnings = list(interpreted.warnings)
    risks = interpreted.riskRegister
    findings = interpreted.auditFindings
    exceptions = interpreted.exceptions

    if not interpreted.documentIds:
        warnings.append("No documents received for aggregation.")
    if not risks and not findings and not exceptions:
        warnings.append("No interpretable risk data available; overall score is 0.")
    else:
        if not risks:
            warnings.append("No risk register items to aggregate.")
        if not findings:
            warnings.append("No audit findings to aggregate.")
        if not exceptions:
            warnings.append("No exceptions to aggregate.")

    risk_counts = count_by_severity(risks, "severity")
    audit_counts = count_by_severity(findings, "rating")
    audit_totals = build_audit_metrics(findings)
    exception_totals = build_exception_metrics(exceptions)

    score, level, description, score_warnings = overall_risk_score(
        risks, findings, exceptions
    )
    warnings.extend(score_warnings)

    heatmap, heatmap_warnings = build_heatmap(risks)
    warnings.extend(heatmap_warnings)

    division_exposure = build_division_exposure(risks)
    category_exposure = build_category_exposure(risks)
    missing_division = sum(1 for risk in risks if not risk.division.strip())
    missing_category = sum(1 for risk in risks if not risk.category.strip())
    if missing_division:
        warnings.append(
            f"{missing_division} risk(s) have no division; excluded from "
            "division exposure."
        )
    if missing_category:
        warnings.append(
            f"{missing_category} risk(s) have no category; excluded from "
            "category exposure."
        )

    trend, trend_available, trend_warning = build_trend(interpreted.misRows)
    if trend_warning:
        warnings.append(trend_warning)

    days_open = [exception.daysOpen for exception in exceptions]
    exceptions_avg = round(sum(days_open) / len(days_open), 1) if days_open else 0.0
    exceptions_max = max(days_open) if days_open else 0

    coverage = DocumentCoverageSummary(
        documentsReceived=len(interpreted.documentIds),
        documentsInterpreted=sum(
            1 for entry in interpreted.coverage if entry.status == "interpreted"
        ),
        documentsSkipped=sum(
            1 for entry in interpreted.coverage if entry.status == "skipped"
        ),
        rowsProcessed=sum(entry.rowsProcessed for entry in interpreted.coverage),
        evidenceCount=sum(entry.evidenceCount for entry in interpreted.coverage),
    )
    if coverage.documentsSkipped:
        warnings.append(
            f"{coverage.documentsSkipped} document(s) skipped during interpretation."
        )
    documents = [
        DocumentCoverage(
            id=entry.id,
            filename=entry.filename,
            category=entry.category,
            status="ready" if entry.status == "interpreted" else "skipped",
            evidenceCount=entry.evidenceCount,
        )
        for entry in interpreted.coverage
    ]

    return AggregatedAnalysis(
        overallScore=score,
        overallLevel=level,
        overallDescription=description,
        metrics=build_metrics(risk_counts, audit_counts, audit_totals, exception_totals),
        heatmap=heatmap,
        trend=trend,
        trendAvailable=trend_available,
        keyFindings=rank_top_risks(risks),
        severityDistribution=[
            SeverityBucket(severity=severity, count=risk_counts[severity])
            for severity in _SEVERITY_ORDER
        ],
        auditMetrics=audit_totals,
        exceptionMetrics=exception_totals,
        divisionExposure=division_exposure,
        categoryExposure=category_exposure,
        auditByDivision=build_audit_by_division(findings),
        exceptionByDivision=build_exception_by_division(exceptions),
        exceptionsAvgDaysOpen=exceptions_avg,
        exceptionsMaxDaysOpen=exceptions_max,
        documents=documents,
        coverage=coverage,
        confidence=calculate_confidence(interpreted),
        warnings=warnings,
    )
