"""
Build a compact, factual snapshot of an AggregatedAnalysis for AI synthesis.

Only numbers and labels derived from the interpreted documents are included so
the LLM cannot invent figures. Free-text descriptions are truncated.
"""
from __future__ import annotations

from app.analysis.aggregation.models import AggregatedAnalysis


def _truncate(value: str, limit: int = 180) -> str:
    value = value.strip()
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def _metric_snapshot(aggregated: AggregatedAnalysis) -> list[dict]:
    return [
        {"id": metric.id, "label": metric.label, "value": metric.value}
        for metric in aggregated.metrics
        if metric.value > 0
    ]


def _finding_snapshot(aggregated: AggregatedAnalysis) -> list[dict]:
    return [
        {
            "id": finding.id,
            "title": _truncate(finding.title),
            "category": finding.category,
            "severity": finding.severity,
            "likelihood": finding.likelihood,
            "exposure": finding.exposure,
            "confidence": finding.confidence,
        }
        for finding in aggregated.keyFindings[:6]
    ]


def _division_snapshot(aggregated: AggregatedAnalysis) -> list[dict]:
    return [
        {
            "division": row.division,
            "count": row.count,
            "severityScore": row.severityScore,
            "level": row.level,
        }
        for row in aggregated.divisionExposure[:6]
    ]


def _category_snapshot(aggregated: AggregatedAnalysis) -> list[dict]:
    return [
        {
            "category": row.category,
            "count": row.count,
            "severityScore": row.severityScore,
            "level": row.level,
        }
        for row in aggregated.categoryExposure[:6]
    ]


def build_context(aggregated: AggregatedAnalysis) -> dict:
    coverage = aggregated.coverage
    return {
        "overallScore": {
            "score": aggregated.overallScore,
            "level": aggregated.overallLevel,
            "description": aggregated.overallDescription,
        },
        "confidence": aggregated.confidence,
        "metrics": _metric_snapshot(aggregated),
        "severityDistribution": [
            {"severity": bucket.severity, "count": bucket.count}
            for bucket in aggregated.severityDistribution
        ],
        "keyFindings": _finding_snapshot(aggregated),
        "divisionExposure": _division_snapshot(aggregated),
        "categoryExposure": _category_snapshot(aggregated),
        "auditMetrics": aggregated.auditMetrics,
        "exceptionMetrics": aggregated.exceptionMetrics,
        "exceptionsAvgDaysOpen": aggregated.exceptionsAvgDaysOpen,
        "exceptionsMaxDaysOpen": aggregated.exceptionsMaxDaysOpen,
        "trendAvailable": aggregated.trendAvailable,
        "coverage": {
            "documentsReceived": coverage.documentsReceived,
            "documentsInterpreted": coverage.documentsInterpreted,
            "documentsSkipped": coverage.documentsSkipped,
            "rowsProcessed": coverage.rowsProcessed,
            "evidenceCount": coverage.evidenceCount,
        },
    }
