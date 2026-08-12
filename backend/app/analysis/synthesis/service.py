"""
Synthesis (Phase D): turn the deterministic aggregation into the final
AnalysisResult, adding the executive summary, recommendations, and
management actions.

The pipeline first attempts LLM-driven synthesis. When the LLM is unavailable
(no API key, network failure, invalid response), it degrades to the
deterministic fallback so a run always completes with a valid result.
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.analysis.aggregation.models import AggregatedAnalysis
from app.analysis.models import (
    AnalysisResult,
    AnalysisSummary,
    DocumentCoverage,
    ManagementAction,
    OverallScore,
    Recommendation,
    SourceCount,
)
from app.analysis.synthesis.client import synthesize_with_llm
from app.analysis.synthesis.context import build_context
from app.analysis.synthesis.fallback import synthesize_deterministic
from app.analysis.synthesis.models import SynthesisOutput
from app.services import analysis_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _source_counts(aggregated: AggregatedAnalysis) -> list[SourceCount]:
    counts: dict[str, int] = {}
    for doc in aggregated.documents:
        counts[doc.filename] = counts.get(doc.filename, 0) + doc.evidenceCount
    return [
        SourceCount(label=filename, count=str(count))
        for filename, count in sorted(counts.items(), key=lambda item: -item[1])
    ]


def _recommendations(output: SynthesisOutput) -> list[Recommendation]:
    return [
        Recommendation(
            id=f"rec-{index + 1}",
            priority=item.priority,
            category=item.category,
            action=item.action,
            impact=item.impact,
            confidence=0,
        )
        for index, item in enumerate(output.recommendations)
    ]


def _management_actions(output: SynthesisOutput) -> list[ManagementAction]:
    return [
        ManagementAction(
            id=f"action-{index + 1}",
            action=item.action,
            owner=item.owner,
            department=item.department,
            dueDate=item.dueDate,
            priority=item.priority,
            status=item.status,
        )
        for index, item in enumerate(output.managementActions)
    ]


def synthesize_result(aggregated: AggregatedAnalysis) -> AnalysisResult:
    context = build_context(aggregated)
    output = synthesize_with_llm(context)
    provider = "openai"

    if output is None:
        output = synthesize_deterministic(aggregated)
        provider = "deterministic"

    result = AnalysisResult(
        id=analysis_store.generate_id(),
        status="ready",
        createdAt=_now_iso(),
        confidence=aggregated.confidence,
        warnings=list(aggregated.warnings),
        documents=[
            DocumentCoverage(
                id=doc.id,
                filename=doc.filename,
                category=doc.category,
                status=doc.status,
                evidenceCount=doc.evidenceCount,
            )
            for doc in aggregated.documents
        ],
        overallScore=OverallScore(
            score=aggregated.overallScore,
            level=aggregated.overallLevel,
            description=aggregated.overallDescription,
            change="",
        ),
        metrics=list(aggregated.metrics),
        heatmap=list(aggregated.heatmap),
        trend=list(aggregated.trend),
        keyFindings=list(aggregated.keyFindings),
        recommendations=_recommendations(output),
        managementActions=_management_actions(output),
        summary=AnalysisSummary(
            generatedAt=_now_iso(),
            paragraphs=output.summaryParagraphs,
            sources=_source_counts(aggregated),
        ),
    )
    if provider == "deterministic" and context.get("overallScore", {}).get("score"):
        result.warnings.append(
            "AI synthesis unavailable; executive narrative generated "
            "deterministically."
        )
    return result
