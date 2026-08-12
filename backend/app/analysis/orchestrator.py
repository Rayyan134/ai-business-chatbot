from __future__ import annotations

from datetime import datetime, timezone

from app.analysis.aggregation import AggregatedAnalysis
from app.analysis.aggregation.aggregate import (
    aggregate_interpretation as _aggregate_interpretation,
)
from app.analysis.models.analysis import AnalysisResult
from app.analysis.models.interpreted import InterpretedDocuments
from app.analysis.models.run import AnalysisRun
from app.analysis.pipeline.interpretation import interpret_documents as _interpret_documents
from app.analysis.synthesis.service import synthesize_result as _synthesize_result
from app.services import analysis_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def create_run(document_ids: list[str]) -> AnalysisRun:
    run = AnalysisRun(
        id=analysis_store.generate_id(),
        documentIds=document_ids,
        status="queued",
    )
    analysis_store.save_run(run)
    return run


def start_run(run_id: str) -> AnalysisRun:
    run = _require_run(run_id)
    run.status = "processing"
    run.startedAt = _now_iso()
    analysis_store.save_run(run)
    return run


def complete_run(
    run_id: str, result_id: str, warnings: list[str] | None = None
) -> AnalysisRun:
    run = _require_run(run_id)
    run.status = "ready"
    run.completedAt = _now_iso()
    run.resultId = result_id
    if warnings:
        run.warnings = warnings
    analysis_store.save_run(run)
    return run


def fail_run(run_id: str, error: str) -> AnalysisRun:
    run = _require_run(run_id)
    run.status = "failed"
    run.completedAt = _now_iso()
    run.error = error
    analysis_store.save_run(run)
    return run


def get_run(run_id: str) -> AnalysisRun | None:
    return analysis_store.get_run(run_id)


def _require_run(run_id: str) -> AnalysisRun:
    run = analysis_store.get_run(run_id)
    if run is None:
        raise ValueError(f"Analysis run {run_id} not found.")
    return run


def interpret_documents(
    document_ids: list[str],
) -> InterpretedDocuments:
    return _interpret_documents(document_ids)


def aggregate_interpretation(
    interpreted: InterpretedDocuments,
) -> AggregatedAnalysis:
    return _aggregate_interpretation(interpreted)


def synthesize_result(aggregated: AggregatedAnalysis) -> AnalysisResult:
    return _synthesize_result(aggregated)


def run_analysis(document_ids: list[str]) -> AnalysisRun:
    run = create_run(document_ids)
    start_run(run.id)
    try:
        interpreted = interpret_documents(run.documentIds)
        aggregated = aggregate_interpretation(interpreted)
        result = synthesize_result(aggregated)
        analysis_store.save_result(result)
        complete_run(run.id, result.id, warnings=result.warnings)
    except Exception as exc:
        fail_run(run.id, type(exc).__name__)
        raise
    return analysis_store.get_run(run.id) or run
