"""Orchestration for the Risk Copilot: try the LLM, fall back to deterministic logic."""
from __future__ import annotations

from app.analysis.models.analysis import AnalysisResult
from app.copilot.client import copilot_with_llm
from app.copilot.context import build_context
from app.copilot.fallback import answer_deterministic
from app.copilot.models import CopilotOutput, CopilotResponse, CopilotSource


def _from_llm(output: CopilotOutput, result: AnalysisResult) -> CopilotResponse:
    sources = [
        CopilotSource(
            label=s.label,
            documentId=s.documentId,
            documentType=s.documentType,
            sourceRef=s.sourceRef,
            snippet=s.snippet,
        )
        for s in output.sources
    ]
    evidence_count = len(sources)
    combined = round(
        0.6 * output.confidence
        + 0.25 * result.confidence
        + (0.15 * 100 if evidence_count else 0)
    )
    combined = max(0, min(100, combined))
    warnings = list(result.warnings)
    if combined < 60:
        warnings.append(
            "Copilot confidence is below 60; verify against the source documents before acting."
        )
    grounded = output.grounded and bool(
        result.keyFindings or result.metrics or evidence_count
    )
    return CopilotResponse(
        answer=output.answer,
        confidence=combined,
        sources=sources,
        warnings=warnings,
        grounded=grounded,
    )


def answer_from_result(result: AnalysisResult, message: str) -> CopilotResponse:
    context = build_context(result)
    output = copilot_with_llm(context, message)
    if output is not None:
        return _from_llm(output, result)
    return answer_deterministic(result, message)
