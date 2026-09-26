"""End-to-end smoke test for the real Copilot pipeline.

Simulates the flow the frontend triggers after an analysis run:
create an analysis run -> fetch its result -> ask Copilot questions via the
real API -> verify grounded answers with real sources. The deterministic
fallback (no OpenAI key) is what actually runs here.
"""
import pytest
from fastapi.testclient import TestClient

from app.analysis.models.analysis import (
    AnalysisResult,
    DocumentCoverage,
    Evidence,
    KeyFinding,
    OverallScore,
)
from app.analysis.models import AnalysisRun
from app.main import app
from app.services import analysis_store

client = TestClient(app)


@pytest.fixture(autouse=True)
def _isolate_store(tmp_path, monkeypatch):
    monkeypatch.setattr(analysis_store, "RUNS_DIR", tmp_path / "runs")
    monkeypatch.setattr(analysis_store, "RESULTS_DIR", tmp_path / "results")
    monkeypatch.setattr("app.copilot.service.copilot_with_llm", lambda context, question: None)


def _seed_run() -> str:
    result_id = "e2e-res-1"
    analysis_store.save_result(
        AnalysisResult(
            id=result_id,
            status="ready",
            createdAt="2026-01-01T00:00:00Z",
            confidence=85,
            documents=[
                DocumentCoverage(
                    id="doc-risk",
                    filename="Operational Risk Register.xlsx",
                    category="risk-register",
                    status="processed",
                    evidenceCount=18,
                ),
                DocumentCoverage(
                    id="doc-audit",
                    filename="GIA Findings 2026.pdf",
                    category="audit-findings",
                    status="processed",
                    evidenceCount=9,
                ),
            ],
            overallScore=OverallScore(score=71, level="Medium", description="Elevated", change="4"),
            keyFindings=[
                KeyFinding(
                    id="kf-1",
                    title="Unreconciled nostro accounts in Treasury",
                    category="risk-register",
                    severity="High",
                    likelihood="Likely",
                    exposure="$2.4m",
                    evidence=[
                        Evidence(
                            documentId="doc-risk",
                            documentType="xlsx",
                            sourceRef="Sheet1!B4",
                            snippet="Nostro gap of $2.4m",
                        )
                    ],
                    confidence=90,
                ),
                KeyFinding(
                    id="kf-2",
                    title="Recurring audit finding on access recertification",
                    category="audit-findings",
                    severity="Critical",
                    likelihood="Certain",
                    exposure="Regulatory",
                    evidence=[],
                    confidence=78,
                ),
            ],
        )
    )
    run_id = "e2e-run-1"
    analysis_store.save_run(
        AnalysisRun(
            id=run_id,
            documentIds=["doc-risk", "doc-audit"],
            status="ready",
            resultId=result_id,
        )
    )
    return run_id


def test_e2e_highest_risks_grounded():
    run_id = _seed_run()
    response = client.post(
        "/api/copilot/chat",
        json={"runId": run_id, "message": "What are our highest operational risks?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is True
    assert body["confidence"] >= 0
    assert body["sources"], "expected grounded sources"
    assert all(s.get("label") for s in body["sources"])
    assert "nostro" in body["answer"].lower()


def test_e2e_critical_risks_grounded():
    run_id = _seed_run()
    response = client.post(
        "/api/copilot/chat",
        json={"runId": run_id, "message": "Which risks are critical?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is True
    assert "Critical" in body["answer"]


def test_e2e_unanswerable_is_flagged_ungrounded():
    run_id = _seed_run()
    response = client.post(
        "/api/copilot/chat",
        json={"runId": run_id, "message": "What is the CEO's birthday?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is False
    assert body["warnings"]
