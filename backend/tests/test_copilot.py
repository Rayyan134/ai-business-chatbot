import pytest

from app.analysis.models.analysis import (
    AnalysisMetric,
    AnalysisResult,
    DocumentCoverage,
    Evidence,
    HeatmapCell,
    HeatmapRow,
    KeyFinding,
    ManagementAction,
    OverallScore,
    Recommendation,
    Severity,
)
from app.copilot import models, service
from app.copilot.client import copilot_with_llm


def _sample_result() -> AnalysisResult:
    return AnalysisResult(
        id="res-1",
        status="ready",
        createdAt="2026-01-01T00:00:00Z",
        confidence=82,
        warnings=[],
        documents=[
            DocumentCoverage(
                id="doc-1",
                filename="Risk Register 2026.xlsx",
                category="risk-register",
                status="processed",
                evidenceCount=12,
            ),
            DocumentCoverage(
                id="doc-2",
                filename="GIA Findings.pdf",
                category="audit-findings",
                status="processed",
                evidenceCount=5,
            ),
        ],
        overallScore=OverallScore(
            score=68,
            level="Medium",
            description="Elevated operational risk driven by exceptions.",
            change="5",
        ),
        metrics=[
            AnalysisMetric(id="open-findings", label="Open audit findings", value=14),
            AnalysisMetric(id="overdue-findings", label="Overdue findings", value=3),
            AnalysisMetric(id="open-exceptions", label="Open exceptions", value=22),
            AnalysisMetric(id="overdue-exceptions", label="Overdue exceptions", value=7),
            AnalysisMetric(id="critical-findings", label="Critical findings", value=2),
        ],
        heatmap=[
            HeatmapRow(
                division="Retail Banking",
                cells=[HeatmapCell(category="KYC", level=3), HeatmapCell(category="Fraud", level=2)],
            )
        ],
        trend=[],
        keyFindings=[
            KeyFinding(
                id="kf-1",
                title="Unreconciled nostro accounts",
                category="risk-register",
                severity="High",
                likelihood="Likely",
                exposure="$2.4m",
                evidence=[
                    Evidence(
                        documentId="doc-1",
                        documentType="xlsx",
                        sourceRef="Sheet1!B4",
                        snippet="Nostro gap of $2.4m",
                    )
                ],
                confidence=88,
            ),
            KeyFinding(
                id="kf-2",
                title="Repeat audit finding on access controls",
                category="audit-findings",
                severity="Critical",
                likelihood="Certain",
                exposure="Regulatory",
                evidence=[],
                confidence=76,
            ),
        ],
        recommendations=[
            Recommendation(
                id="rec-1",
                priority="High",
                category="risk-register",
                action="Implement daily nostro reconciliation",
                impact="Reduces exposure",
                evidence=[],
                confidence=80,
            )
        ],
        managementActions=[
            ManagementAction(
                id="ma-1",
                action="Approve reconciliation tooling budget",
                owner="CFO",
                department="Finance",
                dueDate="2026-03-31",
                priority="High",
                status="Pending",
            )
        ],
        summary={"generatedAt": "2026-01-01T00:00:00Z", "paragraphs": ["Summary."], "sources": []},
    )


@pytest.fixture(autouse=True)
def _no_llm(monkeypatch):
    # Patch the symbol service.py actually binds, so these tests never depend on
    # whether OPENAI_API_KEY happens to be set in the ambient environment.
    monkeypatch.setattr("app.copilot.service.copilot_with_llm", lambda context, question: None)


def test_deterministic_highest_risks():
    resp = service.answer_from_result(_sample_result(), "What are our highest risks?")
    assert resp.grounded is True
    assert "nostro" in resp.answer.lower()
    assert resp.sources[0].documentId == "doc-1"


def test_deterministic_audit_findings():
    resp = service.answer_from_result(_sample_result(), "Summarize the audit findings.")
    assert "14" in resp.answer
    assert "3" in resp.answer
    assert resp.sources[0].label.endswith(".pdf")


def test_deterministic_exceptions():
    resp = service.answer_from_result(_sample_result(), "What exceptions need attention?")
    assert "22" in resp.answer
    assert "7" in resp.answer


def test_deterministic_critical_risks():
    resp = service.answer_from_result(_sample_result(), "Which risks are critical?")
    assert "Critical" in resp.answer
    assert "2" in resp.answer


def test_deterministic_management_actions():
    resp = service.answer_from_result(_sample_result(), "What actions should management take?")
    assert "CFO" in resp.answer


def test_deterministic_overall_score():
    resp = service.answer_from_result(_sample_result(), "What is the overall risk score?")
    assert "68" in resp.answer
    assert resp.grounded is True


def test_deterministic_division_exposure():
    resp = service.answer_from_result(_sample_result(), "Show divisional exposure.")
    assert "Retail Banking" in resp.answer


def test_deterministic_coverage():
    resp = service.answer_from_result(_sample_result(), "Which documents were analyzed?")
    assert "Risk Register 2026.xlsx" in resp.answer


def test_deterministic_unanswerable_is_factual():
    resp = service.answer_from_result(_sample_result(), "What is the CEO's birthday?")
    assert resp.grounded is False
    assert resp.warnings
    assert "highest" in resp.answer.lower()


def test_llm_path_used_when_available():
    fake = models.CopilotOutput(
        answer="LLM answer",
        confidence=90,
        sources=[models.CopilotSource(label="doc-1", documentId="doc-1")],
        grounded=True,
    )
    monkeypatch_llm = lambda context, question: fake  # noqa: E731
    import app.copilot.service as svc

    orig = svc.copilot_with_llm
    svc.copilot_with_llm = monkeypatch_llm
    try:
        resp = svc.answer_from_result(_sample_result(), "Anything")
    finally:
        svc.copilot_with_llm = orig
    assert resp.answer == "LLM answer"
    assert 0 <= resp.confidence <= 100


def test_copilot_with_llm_returns_none_without_key(monkeypatch):
    monkeypatch.setattr("app.config.OPENAI_API_KEY", "")
    assert copilot_with_llm({}, "question") is None
