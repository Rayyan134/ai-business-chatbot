import pytest

from app.analysis.models import AnalysisResult, AnalysisRun
from app.analysis import orchestrator
from app.services import analysis_store


@pytest.fixture(autouse=True)
def _isolate_store(tmp_path, monkeypatch):
    monkeypatch.setattr(analysis_store, "RUNS_DIR", tmp_path / "runs")
    monkeypatch.setattr(analysis_store, "RESULTS_DIR", tmp_path / "results")


def test_save_and_get_run_round_trip(tmp_path):
    run = AnalysisRun(id="run1", documentIds=["doc1"], status="queued")
    analysis_store.save_run(run)
    restored = analysis_store.get_run("run1")
    assert restored is not None
    assert restored.id == "run1"
    assert restored.documentIds == ["doc1"]


def test_get_missing_run_returns_none(tmp_path):
    assert analysis_store.get_run("missing") is None


def test_save_and_get_result_round_trip(tmp_path):
    result = AnalysisResult(id="res1", status="ready", createdAt="now")
    analysis_store.save_result(result)
    restored = analysis_store.get_result("res1")
    assert restored is not None
    assert restored.id == "res1"
    assert restored.status == "ready"


def test_get_missing_result_returns_none(tmp_path):
    assert analysis_store.get_result("missing") is None


def test_list_runs_sorted_by_started_at(tmp_path, monkeypatch):
    stamps = iter(["2026-08-11T10:00:00+00:00", "2026-08-11T11:00:00+00:00"])
    monkeypatch.setattr(orchestrator, "_now_iso", lambda: next(stamps))
    first = orchestrator.create_run(["doc1"])
    orchestrator.start_run(first.id)
    second = orchestrator.create_run(["doc2"])
    orchestrator.start_run(second.id)
    runs = analysis_store.list_runs()
    assert [run.id for run in runs] == [second.id, first.id]


def test_orchestrator_run_lifecycle(tmp_path):
    run = orchestrator.create_run(["doc1", "doc2"])
    assert run.status == "queued"

    started = orchestrator.start_run(run.id)
    assert started.status == "processing"
    assert started.startedAt is not None

    completed = orchestrator.complete_run(run.id, result_id="res1", warnings=["w"])
    assert completed.status == "ready"
    assert completed.completedAt is not None
    assert completed.resultId == "res1"
    assert completed.warnings == ["w"]

    persisted = analysis_store.get_run(run.id)
    assert persisted == completed


def test_orchestrator_fail_run(tmp_path):
    run = orchestrator.create_run(["doc1"])
    orchestrator.start_run(run.id)
    failed = orchestrator.fail_run(run.id, error="ParseError")
    assert failed.status == "failed"
    assert failed.error == "ParseError"
    assert failed.completedAt is not None


def test_run_analysis_completes_with_empty_store(tmp_path):
    run = orchestrator.run_analysis(["doc1"])
    assert run.status == "ready"
    assert run.resultId is not None
    assert run.startedAt is not None
    assert run.completedAt is not None
    result = analysis_store.get_result(run.resultId)
    assert result is not None
    assert result.status == "ready"
    assert result.summary.paragraphs
