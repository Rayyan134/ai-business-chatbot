from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.analysis.models.analysis import AnalysisResult
from app.copilot.models import CopilotRequest, CopilotResponse
from app.copilot.service import answer_from_result
from app.services import analysis_store

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


def _resolve_result(run_id: str | None, result_id: str | None) -> AnalysisResult | None:
    if result_id:
        return analysis_store.get_result(result_id)
    if run_id:
        run = analysis_store.get_run(run_id)
        if run is None or run.resultId is None:
            return None
        return analysis_store.get_result(run.resultId)
    return None


@router.post("/chat", response_model=CopilotResponse)
def copilot_chat(payload: CopilotRequest) -> CopilotResponse:
    if not payload.runId and not payload.resultId:
        raise HTTPException(
            status_code=422,
            detail="Either runId or resultId is required for a real analysis answer.",
        )
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message must not be empty.")
    result = _resolve_result(payload.runId, payload.resultId)
    if result is None:
        raise HTTPException(status_code=404, detail="Analysis result not found.")
    try:
        return answer_from_result(result, message)
    except Exception:
        raise HTTPException(status_code=500, detail="Copilot request failed.")
