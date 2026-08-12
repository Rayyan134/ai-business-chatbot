from __future__ import annotations

import json
import os
import uuid
from pathlib import Path

from pydantic import ValidationError

from app.analysis.models.analysis import AnalysisResult
from app.analysis.models.run import AnalysisRun
from app.config import BASE_DIR


def _path(value: str | None, default: Path) -> Path:
    if not value:
        return default
    p = Path(value)
    return p if p.is_absolute() else BASE_DIR / p


ANALYSIS_DIR = _path(os.getenv("ANALYSIS_STORE_DIR"), BASE_DIR / "uploads" / "analysis")
RUNS_DIR = ANALYSIS_DIR / "runs"
RESULTS_DIR = ANALYSIS_DIR / "results"


def generate_id() -> str:
    return uuid.uuid4().hex


def ensure_directories() -> None:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def save_run(run: AnalysisRun) -> Path:
    ensure_directories()
    path = RUNS_DIR / f"{run.id}.json"
    path.write_text(json.dumps(run.model_dump(mode="json"), indent=2), encoding="utf-8")
    return path


def get_run(run_id: str) -> AnalysisRun | None:
    path = RUNS_DIR / f"{run_id}.json"
    if not path.exists():
        return None
    try:
        return AnalysisRun.model_validate_json(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, ValidationError):
        return None


def list_runs() -> list[AnalysisRun]:
    ensure_directories()
    runs = [get_run(path.stem) for path in RUNS_DIR.glob("*.json")]
    return sorted(
        (run for run in runs if run is not None),
        key=lambda run: (run.startedAt or "", run.id),
        reverse=True,
    )


def save_result(result: AnalysisResult) -> Path:
    ensure_directories()
    path = RESULTS_DIR / f"{result.id}.json"
    path.write_text(
        json.dumps(result.model_dump(mode="json"), indent=2), encoding="utf-8"
    )
    return path


def get_result(result_id: str) -> AnalysisResult | None:
    path = RESULTS_DIR / f"{result_id}.json"
    if not path.exists():
        return None
    try:
        return AnalysisResult.model_validate_json(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, ValidationError):
        return None
