import pytest

from app.main import app
from app.services import analysis_store
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.fixture(autouse=True)
def _isolate_store(tmp_path, monkeypatch):
    monkeypatch.setattr(analysis_store, "RUNS_DIR", tmp_path / "runs")
    monkeypatch.setattr(analysis_store, "RESULTS_DIR", tmp_path / "results")
    monkeypatch.setattr("app.copilot.service.copilot_with_llm", lambda context, question: None)


def _save_result() -> str:
    from app.analysis.models.analysis import (
        AnalysisResult,
        DocumentCoverage,
        KeyFinding,
        OverallScore,
    )

    result_id = "res-api-1"
    analysis_store.save_result(
        AnalysisResult(
            id=result_id,
            status="ready",
            createdAt="2026-01-01T00:00:00Z",
            confidence=80,
            documents=[
                DocumentCoverage(
                    id="doc-1",
                    filename="Risk Register.xlsx",
                    category="risk-register",
                    status="processed",
                    evidenceCount=5,
                )
            ],
            overallScore=OverallScore(score=64, level="Medium", description="", change="2"),
            keyFindings=[
                KeyFinding(
                    id="kf-1",
                    title="Nostro reconciliation gap",
                    category="risk-register",
                    severity="High",
                )
            ],
        )
    )
    return result_id


def test_chat_requires_run_or_result():
    response = client.post("/api/copilot/chat", json={"message": "hello"})
    assert response.status_code == 422


def test_chat_rejects_empty_message():
    response = client.post(
        "/api/copilot/chat",
        json={"resultId": "res-x", "message": "   "},
    )
    assert response.status_code == 422


def test_chat_result_not_found():
    response = client.post(
        "/api/copilot/chat",
        json={"resultId": "missing", "message": "What are the risks?"},
    )
    assert response.status_code == 404


def test_chat_by_result_id():
    result_id = _save_result()
    response = client.post(
        "/api/copilot/chat",
        json={"resultId": result_id, "message": "What are our highest risks?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is True
    assert "nostro" in body["answer"].lower()
    assert body["confidence"] >= 0


def test_chat_by_run_id(tmp_path, monkeypatch):
    result_id = _save_result()
    from app.analysis.models import AnalysisRun

    run_id = "run-api-1"
    analysis_store.save_run(
        AnalysisRun(id=run_id, documentIds=["doc-1"], status="ready", resultId=result_id)
    )
    response = client.post(
        "/api/copilot/chat",
        json={"runId": run_id, "message": "Which documents were analyzed?"},
    )
    assert response.status_code == 200
    assert "Risk Register.xlsx" in response.json()["answer"]
