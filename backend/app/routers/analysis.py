from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.analysis.models import AnalysisResult, AnalysisRun
from app.analysis.orchestrator import run_analysis
from app.services import analysis_store

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("", response_model=AnalysisRun, status_code=202)
def create_analysis_run(payload: dict) -> AnalysisRun:
    document_ids = payload.get("documentIds", [])
    if not isinstance(document_ids, list) or not document_ids:
        raise HTTPException(
            status_code=422,
            detail="documentIds must be a non-empty list of document ids.",
        )
    return run_analysis([str(document_id) for document_id in document_ids])


@router.get("/runs/{run_id}", response_model=AnalysisRun)
def get_run(run_id: str) -> AnalysisRun:
    run = analysis_store.get_run(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Analysis run not found.")
    return run


@router.get("/results/{result_id}", response_model=AnalysisResult)
def get_result(result_id: str) -> AnalysisResult:
    result = analysis_store.get_result(result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Analysis result not found.")
    return result
