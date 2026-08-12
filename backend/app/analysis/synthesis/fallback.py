"""Deterministic synthesis used when the LLM is unavailable.

This mirrors the same SynthesisOutput contract as the LLM path but builds
every sentence strictly from the aggregated numbers. Nothing is fabricated:
when a dataset is missing the narrative says so explicitly.
"""
from __future__ import annotations

from app.analysis.aggregation.models import AggregatedAnalysis
from app.analysis.models.severity import Severity
from app.analysis.synthesis.models import (
    SynthesisManagementAction,
    SynthesisOutput,
    SynthesisRecommendation,
)

_SEVERITY_ORDER: tuple[Severity, ...] = ("Critical", "High", "Medium", "Low")


def _severity_counts(distribution: list) -> dict[str, int]:
    return {bucket.severity: bucket.count for bucket in distribution}


def _build_summary_paragraphs(aggregated: AggregatedAnalysis) -> list[str]:
    paragraphs: list[str] = []

    score = aggregated.overallScore
    distribution = _severity_counts(aggregated.severityDistribution)
    paragraphs.append(
        f"Meridian Bank's consolidated operational risk exposure is assessed "
        f"at {score}/100 ({aggregated.overallLevel}). The register contains "
        f"{distribution.get('Critical', 0)} Critical, "
        f"{distribution.get('High', 0)} High, "
        f"{distribution.get('Medium', 0)} Medium, and "
        f"{distribution.get('Low', 0)} Low risk item(s)."
    )

    if aggregated.keyFindings:
        top = aggregated.keyFindings[0]
        paragraphs.append(
            f"The most material exposure is '{top.title}' "
            f"({top.category.strip() or 'uncategorized'}), rated "
            f"{top.severity}. This drives the elevated overall score."
        )
    else:
        paragraphs.append("No risk register items were available to rank.")

    if aggregated.auditByDivision:
        open_findings = sum(row.open for row in aggregated.auditByDivision)
        paragraphs.append(
            f"Audit coverage identified {aggregated.auditMetrics.get('total', 0)} "
            f"finding(s), of which {open_findings} remain open."
        )
    elif aggregated.auditMetrics.get("total"):
        paragraphs.append(
            f"Audit findings total {aggregated.auditMetrics.get('total', 0)}; "
            "division-level detail is unavailable."
        )

    if aggregated.exceptionMetrics.get("total"):
        paragraphs.append(
            f"Exceptions total {aggregated.exceptionMetrics.get('total', 0)}, "
            f"averaging {aggregated.exceptionsAvgDaysOpen} days open with a "
            f"maximum of {aggregated.exceptionsMaxDaysOpen} days."
        )

    if aggregated.trendAvailable and aggregated.trend:
        latest = aggregated.trend[-1]
        paragraphs.append(
            f"Trend data shows {latest.high} High, {latest.medium} Medium, and "
            f"{latest.low} Low risk count(s) as of {latest.month}."
        )
    else:
        paragraphs.append(
            "No usable historical trend data was provided, so a trend "
            "assessment could not be made."
        )

    return paragraphs


def _build_recommendations(aggregated: AggregatedAnalysis) -> list[SynthesisRecommendation]:
    recommendations: list[SynthesisRecommendation] = []

    for finding in aggregated.keyFindings[:4]:
        if not finding.category:
            continue
        recommendations.append(
            SynthesisRecommendation(
                priority=finding.severity,
                category=finding.category,
                action=(
                    f"Review '{finding.title}' controls and remediation "
                    f"across affected divisions."
                ),
                impact=(
                    f"Reduces {finding.category} exposure rated "
                    f"{finding.severity}."
                ),
            )
        )

    if aggregated.exceptionMetrics.get("overdue"):
        overdue = aggregated.exceptionMetrics.get("overdue", 0)
        recommendations.append(
            SynthesisRecommendation(
                priority="High",
                category="Exceptions",
                action=(
                    "Prioritize closure of overdue exceptions, beginning "
                    "with those open the longest."
                ),
                impact=(
                    f"Clears {overdue} overdue exception(s) averaging "
                    f"{aggregated.exceptionsAvgDaysOpen} days open."
                ),
            )
        )

    if not recommendations:
        recommendations.append(
            SynthesisRecommendation(
                priority="Medium",
                category="",
                action=(
                    "Insufficient structured risk data to issue prioritized "
                    "recommendations; re-submit complete documents."
                ),
                impact="Improves the basis for subsequent analysis.",
            )
        )
    return recommendations


def _build_management_actions(
    aggregated: AggregatedAnalysis,
) -> list[SynthesisManagementAction]:
    actions: list[SynthesisManagementAction] = []
    for finding in aggregated.keyFindings[:4]:
        actions.append(
            SynthesisManagementAction(
                action=f"Address '{finding.title}'",
                owner="",
                department=finding.category,
                dueDate="",
                priority=finding.severity,
                status="Open",
            )
        )
    return actions


def synthesize_deterministic(aggregated: AggregatedAnalysis) -> SynthesisOutput:
    return SynthesisOutput(
        summaryParagraphs=_build_summary_paragraphs(aggregated),
        recommendations=_build_recommendations(aggregated),
        managementActions=_build_management_actions(aggregated),
    )
