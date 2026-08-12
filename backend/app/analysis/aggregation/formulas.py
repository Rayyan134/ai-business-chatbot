"""
Deterministic aggregation formulas for Phase C.

Every computation here is a pure function over interpreted data. No LLM, no
embeddings, no randomness, and no reliance on wall-clock time. Formulas are
documented inline so the numbers can be audited end-to-end.

Overall risk score (0-100)
--------------------------
The pool of items contributing to the score is:

* every risk register item, weighted by severity (Critical=4, High=3,
  Medium=2, Low=1);
* every audit finding whose status is not closed (Closed/Resolved/Done/
  Completed/Cleared/Mitigated), weighted by its rating severity;
* every exception, weighted by its severity, with a +25% multiplier when the
  exception is overdue (explicit "Overdue" status or 30+ days open).

    mean_weight = sum(weights) / len(pool)
    score       = round(100 * mean_weight / 4)

A uniform population of one severity maps to its own level (Critical -> 100,
High -> 75, Medium -> 50, Low -> 25). The score is capped at 100 by the 4x
divisor. When the pool is empty the score is 0 and the level is "Low".

Overall risk level thresholds are the midpoints between uniform levels:

    score >= 88  -> Critical
    score >= 63  -> High
    score >= 38  -> Medium
    otherwise    -> Low

Trend
-----
Historical trend points are only produced when MIS rows carry a parseable
month period AND a numeric value AND an indicator name that classifies as a
severity bucket (e.g. "high risk count"). Otherwise the trend is returned as
an explicit unavailable (empty) list together with a warning. No fabricated
history is ever generated.
"""
from __future__ import annotations

import re
from datetime import datetime

from app.analysis.models import (
    AnalysisMetric,
    Evidence,
    HeatmapCell,
    HeatmapRow,
    KeyFinding,
    RiskTrendPoint,
)
from app.analysis.models.interpreted import (
    AuditFinding,
    ExceptionItem,
    MISRow,
    RiskItem,
    SourceRef,
)
from app.analysis.models.severity import Severity
from app.analysis.pipeline.normalization import (
    combine_severity,
    normalize_number,
    normalize_status,
)

_SEVERITY_WEIGHT: dict[Severity, int] = {
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1,
}
_SEVERITY_ORDER: tuple[Severity, ...] = ("Critical", "High", "Medium", "Low")
_LIKELIHOOD_LABELS: dict[int, str] = {
    5: "Very likely",
    4: "Likely",
    3: "Possible",
    2: "Unlikely",
    1: "Rare",
}
_CLOSED_STATUSES = {"Closed", "Resolved", "Done", "Completed", "Cleared", "Mitigated"}
TOP_RISKS_LIMIT = 6

_RISK_COMPLETENESS_FIELDS = (
    "category",
    "division",
    "likelihood",
    "impact",
    "status",
    "owner",
    "mitigation",
)
_AUDIT_COMPLETENESS_FIELDS = ("division", "status", "dueDate", "owner")
_EXCEPTION_COMPLETENESS_FIELDS = ("division", "raisedDate", "status", "owner")
_MIS_COMPLETENESS_FIELDS = ("period", "value", "unit")

# Weights for the deterministic confidence score. They always sum to 1.0.
_CONFIDENCE_WEIGHTS = {
    "source_availability": 0.40,
    "interpretation_success": 0.25,
    "field_completeness": 0.25,
    "evidence_coverage": 0.10,
}


def severity_weight(severity: Severity) -> int:
    return _SEVERITY_WEIGHT[severity]


def level_from_score(score: int) -> Severity:
    if score >= 88:
        return "Critical"
    if score >= 63:
        return "High"
    if score >= 38:
        return "Medium"
    return "Low"


def is_closed(status: str) -> bool:
    return normalize_status(status) in _CLOSED_STATUSES


def is_overdue_exception(item: ExceptionItem) -> bool:
    return normalize_status(item.status) == "Overdue" or item.daysOpen >= 30


def is_overdue_finding(item: AuditFinding) -> bool:
    return normalize_status(item.status) == "Overdue"


def likelihood_label(raw: str) -> str:
    number = normalize_number(raw)
    if number is not None and number.is_integer() and int(number) in _LIKELIHOOD_LABELS:
        return _LIKELIHOOD_LABELS[int(number)]
    return raw


def exposure_severity(likelihood: str, impact: str) -> Severity | None:
    likelihood_value = normalize_number(likelihood)
    impact_value = normalize_number(impact)
    if likelihood_value is None or impact_value is None:
        return None
    return combine_severity(likelihood_value, impact_value)


def exposure_score(likelihood: str, impact: str, severity: Severity) -> int:
    likelihood_value = normalize_number(likelihood)
    impact_value = normalize_number(impact)
    if likelihood_value is not None and impact_value is not None:
        return int(round(likelihood_value * impact_value))
    return 4 * severity_weight(severity)


def heat_level(likelihood: str, impact: str, severity: Severity) -> int:
    combined = exposure_severity(likelihood, impact)
    if combined is not None:
        return severity_weight(combined)
    return severity_weight(severity)


def count_by_severity(items: list, attr: str) -> dict[str, int]:
    counts: dict[str, int] = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for item in items:
        counts[getattr(item, attr)] += 1
    return counts


def to_evidence(source: SourceRef) -> Evidence:
    return Evidence(
        documentId=source.documentId,
        documentType=source.documentType,
        sourceRef=source.sourceRef,
        snippet=source.snippet,
    )


def overall_risk_score(
    risks: list[RiskItem],
    findings: list[AuditFinding],
    exceptions: list[ExceptionItem],
) -> tuple[int, Severity, str, list[str]]:
    warnings: list[str] = []
    weights: list[float] = []

    for risk in risks:
        weights.append(float(severity_weight(risk.severity)))
    for finding in findings:
        if is_closed(finding.status):
            continue
        weights.append(float(severity_weight(finding.rating)))
    for exception in exceptions:
        weight = float(severity_weight(exception.severity))
        if is_overdue_exception(exception):
            weight *= 1.25
        weights.append(weight)

    if not weights:
        return 0, "Low", "No interpretable risk data available.", warnings
    if not risks:
        warnings.append(
            "Aggregation has no risk register data; overall score reflects "
            "audit findings and exceptions only."
        )

    mean_weight = sum(weights) / len(weights)
    score = round(100 * mean_weight / 4)
    level = level_from_score(score)
    description = (
        f"Weighted-average severity exposure score {score}/100 across "
        f"{len(weights)} item(s)."
    )
    return score, level, description, warnings


def build_metrics(
    risk_counts: dict[str, int],
    audit_counts: dict[str, int],
    audit_totals: dict[str, int],
    exception_totals: dict[str, int],
) -> list[AnalysisMetric]:
    def metric(metric_id: str, label: str, value: int) -> AnalysisMetric:
        # change/trend are only meaningful with historical comparison data,
        # which Phase C does not have, so they stay empty/default.
        return AnalysisMetric(
            id=metric_id,
            label=label,
            value=value,
            change="",
            trend="down",
            positive=True,
        )

    return [
        metric("critical-risks", "Critical Risks", risk_counts["Critical"]),
        metric("high-risks", "High Risks", risk_counts["High"]),
        metric("medium-risks", "Medium Risks", risk_counts["Medium"]),
        metric("low-risks", "Low Risks", risk_counts["Low"]),
        metric(
            "total-risks",
            "Total Risks",
            risk_counts["Critical"]
            + risk_counts["High"]
            + risk_counts["Medium"]
            + risk_counts["Low"],
        ),
        metric("critical-findings", "Critical Findings", audit_counts["Critical"]),
        metric("open-findings", "Open Audit Findings", audit_totals["open"]),
        metric("overdue-findings", "Overdue Audit Findings", audit_totals["overdue"]),
        metric("open-exceptions", "Open Exceptions", exception_totals["open"]),
        metric(
            "overdue-exceptions", "Overdue Exceptions", exception_totals["overdue"]
        ),
    ]


def rank_top_risks(
    risks: list[RiskItem], limit: int = TOP_RISKS_LIMIT
) -> list[KeyFinding]:
    def _finding_confidence(risk: RiskItem) -> int:
        completeness = sum(
            1
            for field in _RISK_COMPLETENESS_FIELDS
            if getattr(risk, field)
        ) / len(_RISK_COMPLETENESS_FIELDS)
        weight = severity_weight(risk.severity)
        return round(100 * (0.6 * weight / 4 + 0.4 * completeness))

    ranked = sorted(
        risks,
        key=lambda item: (
            -exposure_score(item.likelihood, item.impact, item.severity),
            -severity_weight(item.severity),
            item.id,
        ),
    )
    findings: list[KeyFinding] = []
    for risk in ranked[:limit]:
        combined = exposure_severity(risk.likelihood, risk.impact)
        findings.append(
            KeyFinding(
                id=risk.id,
                title=risk.description,
                category=risk.category,
                severity=risk.severity,
                likelihood=likelihood_label(risk.likelihood),
                exposure=combined if combined is not None else risk.severity,
                evidence=[to_evidence(risk.source)],
                confidence=_finding_confidence(risk),
            )
        )
    return findings


def build_heatmap(risks: list[RiskItem]) -> tuple[list[HeatmapRow], list[str]]:
    warnings: list[str] = []
    cells_by_row: dict[str, dict[str, int]] = {}
    excluded = 0
    for risk in risks:
        division = risk.division.strip()
        category = risk.category.strip()
        if not division or not category:
            excluded += 1
            continue
        level = heat_level(risk.likelihood, risk.impact, risk.severity)
        row = cells_by_row.setdefault(division, {})
        row[category] = max(row.get(category, 0), level)
    if excluded:
        warnings.append(
            f"{excluded} risk(s) excluded from heatmap (missing division/category)."
        )

    rows: list[HeatmapRow] = []
    for division in sorted(cells_by_row):
        cells = [
            HeatmapCell(category=category, level=level)
            for category, level in cells_by_row[division].items()
        ]
        cells.sort(key=lambda cell: (-cell.level, cell.category))
        rows.append(HeatmapRow(division=division, cells=cells))
    return rows, warnings


def build_division_exposure(risks: list[RiskItem]) -> list:
    from app.analysis.aggregation.models import DivisionExposureRow

    groups: dict[str, list[RiskItem]] = {}
    for risk in risks:
        division = risk.division.strip()
        if division:
            groups.setdefault(division, []).append(risk)
    rows: list[DivisionExposureRow] = []
    for division in sorted(groups):
        items = groups[division]
        weights = [severity_weight(item.severity) for item in items]
        average = sum(weights) / len(weights)
        rows.append(
            DivisionExposureRow(
                division=division,
                count=len(items),
                severityScore=sum(weights),
                level=level_from_score(round(100 * average / 4)),
            )
        )
    return rows


def build_category_exposure(risks: list[RiskItem]) -> list:
    from app.analysis.aggregation.models import CategoryExposureRow

    groups: dict[str, list[RiskItem]] = {}
    for risk in risks:
        category = risk.category.strip()
        if category:
            groups.setdefault(category, []).append(risk)
    rows: list[CategoryExposureRow] = []
    for category in sorted(groups):
        items = groups[category]
        weights = [severity_weight(item.severity) for item in items]
        average = sum(weights) / len(weights)
        rows.append(
            CategoryExposureRow(
                category=category,
                count=len(items),
                severityScore=sum(weights),
                level=level_from_score(round(100 * average / 4)),
            )
        )
    return rows


def build_audit_metrics(findings: list[AuditFinding]) -> dict[str, int]:
    counts = count_by_severity(findings, "rating")
    return {
        "total": len(findings),
        "open": sum(1 for finding in findings if not is_closed(finding.status)),
        "closed": sum(1 for finding in findings if is_closed(finding.status)),
        "overdue": sum(1 for finding in findings if is_overdue_finding(finding)),
        **counts,
    }


def build_exception_metrics(exceptions: list[ExceptionItem]) -> dict[str, int]:
    counts = count_by_severity(exceptions, "severity")
    return {
        "total": len(exceptions),
        "open": sum(1 for exception in exceptions if not is_closed(exception.status)),
        "closed": sum(1 for exception in exceptions if is_closed(exception.status)),
        "overdue": sum(
            1 for exception in exceptions if is_overdue_exception(exception)
        ),
        **counts,
    }


def build_audit_by_division(findings: list[AuditFinding]) -> list:
    from app.analysis.aggregation.models import AuditDivisionMetrics

    groups: dict[str, list[AuditFinding]] = {}
    for finding in findings:
        groups.setdefault(finding.division.strip() or "(unspecified)", []).append(
            finding
        )
    rows: list[AuditDivisionMetrics] = []
    for division in sorted(groups):
        items = groups[division]
        counts = count_by_severity(items, "rating")
        rows.append(
            AuditDivisionMetrics(
                division=division,
                total=len(items),
                open=sum(1 for item in items if not is_closed(item.status)),
                closed=sum(1 for item in items if is_closed(item.status)),
                critical=counts["Critical"],
                high=counts["High"],
                medium=counts["Medium"],
                low=counts["Low"],
            )
        )
    return rows


def build_exception_by_division(
    exceptions: list[ExceptionItem],
) -> list:
    from app.analysis.aggregation.models import ExceptionDivisionMetrics

    groups: dict[str, list[ExceptionItem]] = {}
    for exception in exceptions:
        groups.setdefault(
            exception.division.strip() or "(unspecified)", []
        ).append(exception)
    rows: list[ExceptionDivisionMetrics] = []
    for division in sorted(groups):
        items = groups[division]
        counts = count_by_severity(items, "severity")
        days = [item.daysOpen for item in items]
        rows.append(
            ExceptionDivisionMetrics(
                division=division,
                total=len(items),
                open=sum(1 for item in items if not is_closed(item.status)),
                overdue=sum(1 for item in items if is_overdue_exception(item)),
                critical=counts["Critical"],
                high=counts["High"],
                medium=counts["Medium"],
                low=counts["Low"],
                avgDaysOpen=round(sum(days) / len(days), 1),
                maxDaysOpen=max(days),
            )
        )
    return rows


def _parse_month(period: str) -> str | None:
    text = period.strip()
    if not text:
        return None
    match = re.match(r"^(\d{4})-(\d{1,2})$", text)
    if match:
        return f"{match.group(1)}-{int(match.group(2)):02d}"
    match = re.match(r"^(\d{4})-(\d{2})-", text)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    match = re.match(r"^(\d{4})(\d{2})$", text)
    if match and 1 <= int(match.group(2)) <= 12:
        return f"{match.group(1)}-{match.group(2)}"
    for fmt in ("%b %Y", "%B %Y", "%Y-%b"):
        try:
            parsed = datetime.strptime(text, fmt)
            return f"{parsed.year}-{parsed.month:02d}"
        except ValueError:
            continue
    return None


def _trend_bucket(indicator: str) -> str | None:
    name = indicator.lower()
    if not any(token in name for token in ("risk", "count", "kri", "finding", "exception")):
        return None
    if "critical" in name or "high" in name:
        return "high"
    if "medium" in name or "moderate" in name:
        return "medium"
    if "low" in name:
        return "low"
    return None


def build_trend(mis_rows: list[MISRow]) -> tuple[list[RiskTrendPoint], bool, str | None]:
    monthly: dict[str, dict[str, int]] = {}
    usable = False
    for row in mis_rows:
        bucket = _trend_bucket(row.indicator)
        month = _parse_month(row.period)
        value = normalize_number(row.value)
        if bucket is None or month is None or value is None:
            continue
        usable = True
        point = monthly.setdefault(month, {"high": 0, "medium": 0, "low": 0})
        point[bucket] += int(round(value))

    if not usable:
        return (
            [],
            False,
            "No usable historical time-series data; trend unavailable.",
        )
    points = [
        RiskTrendPoint(month=month, **monthly[month]) for month in sorted(monthly)
    ]
    return points, True, None


def _field_completeness(interpreted) -> float:
    scores: list[float] = []
    for risk in interpreted.riskRegister:
        scores.append(
            sum(
                1 for field in _RISK_COMPLETENESS_FIELDS if getattr(risk, field)
            )
            / len(_RISK_COMPLETENESS_FIELDS)
        )
    for finding in interpreted.auditFindings:
        scores.append(
            sum(
                1
                for field in _AUDIT_COMPLETENESS_FIELDS
                if getattr(finding, field)
            )
            / len(_AUDIT_COMPLETENESS_FIELDS)
        )
    for exception in interpreted.exceptions:
        present = sum(
            1
            for field in _EXCEPTION_COMPLETENESS_FIELDS
            if getattr(exception, field)
        )
        if exception.daysOpen > 0:
            present += 1
        scores.append(present / 5)
    for row in interpreted.misRows:
        scores.append(
            sum(1 for field in _MIS_COMPLETENESS_FIELDS if getattr(row, field))
            / len(_MIS_COMPLETENESS_FIELDS)
        )
    if not scores:
        return 0.0
    return sum(scores) / len(scores)


def _evidence_coverage(interpreted) -> float:
    items = (
        list(interpreted.riskRegister)
        + list(interpreted.auditFindings)
        + list(interpreted.exceptions)
        + list(interpreted.misRows)
    )
    if not items:
        return 0.0
    return sum(
        1 for item in items if (item.source.snippet or "").strip()
    ) / len(items)


def calculate_confidence(interpreted) -> int:
    """Deterministic confidence from source availability, interpretation
    success, field completeness, and evidence coverage. This is explicitly NOT
    an LLM-style confidence score."""
    requested = len(interpreted.documentIds)
    if requested == 0:
        return 0
    available = sum(1 for entry in interpreted.coverage if entry.available)
    extracted = sum(
        1 for entry in interpreted.coverage if entry.status == "interpreted"
    )
    components = {
        "source_availability": available / requested,
        "interpretation_success": extracted / requested,
        "field_completeness": _field_completeness(interpreted),
        "evidence_coverage": _evidence_coverage(interpreted),
    }
    total = sum(
        components[name] * weight
        for name, weight in _CONFIDENCE_WEIGHTS.items()
    )
    return round(100 * total)
