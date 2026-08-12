from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Response

from app.analysis.models import AnalysisResult
from app.services import analysis_store
from app.services.exporters import build_powerpoint_deck, build_word_report

router = APIRouter(prefix="/api/exports", tags=["exports"])

DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
PPTX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


def _resolve_result(result_id: str | None, run_id: str | None) -> AnalysisResult:
    if result_id:
        result = analysis_store.get_result(result_id)
        if result is None:
            raise HTTPException(status_code=404, detail="Analysis result not found.")
        return result

    if run_id:
        run = analysis_store.get_run(run_id)
        if run is None or run.resultId is None:
            raise HTTPException(status_code=404, detail="Analysis run not found.")
        result = analysis_store.get_result(run.resultId)
        if result is None:
            raise HTTPException(
                status_code=404, detail="Analysis result not found for this run."
            )
        return result

    raise HTTPException(
        status_code=422,
        detail="Either result_id or run_id is required.",
    )


def _date_stamp(result: AnalysisResult) -> str:
    value = result.summary.generatedAt or result.createdAt
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return "analysis"
    return dt.strftime("%Y-%m-%d")


def _attachment(filename: str) -> dict[str, str]:
    return {"Content-Disposition": f'attachment; filename="{filename}"'}


@router.get("/report")
def export_report(
    result_id: str | None = None,
    run_id: str | None = None,
) -> Response:
    result = _resolve_result(result_id, run_id)
    payload = build_word_report(result)
    filename = f"Meridian-Bank-Operational-Risk-Report-{_date_stamp(result)}.docx"
    return Response(
        content=payload,
        media_type=DOCX_MEDIA_TYPE,
        headers=_attachment(filename),
    )


@router.get("/presentation")
def export_presentation(
    result_id: str | None = None,
    run_id: str | None = None,
) -> Response:
    result = _resolve_result(result_id, run_id)
    payload = build_powerpoint_deck(result)
    filename = f"Meridian-Bank-Board-Presentation-{_date_stamp(result)}.pptx"
    return Response(
        content=payload,
        media_type=PPTX_MEDIA_TYPE,
        headers=_attachment(filename),
    )
