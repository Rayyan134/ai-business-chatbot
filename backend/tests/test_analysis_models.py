import pytest
from pydantic import ValidationError

from app.analysis.models import (
    AnalysisMetric,
    AnalysisResult,
    AnalysisRun,
    AuditFinding,
    Evidence,
    HeatmapCell,
    HeatmapRow,
    InterpretedDocuments,
    KeyFinding,
    MISRow,
    OverallScore,
    Recommendation,
    RiskItem,
    SourceRef,
)

SRC = SourceRef(
    documentId="doc1",
    documentType="xlsx",
    category="risk-register",
    sourceRef="Sheet1 · row 4",
    snippet="Privileged access not recertified",
)


def _sample_result() -> AnalysisResult:
    return AnalysisResult(
        id="res1",
        status="ready",
        createdAt="2026-08-11T00:00:00+00:00",
        confidence=90,
        documents=[
            {
                "id": "doc1",
                "filename": "Risk Register.xlsx",
                "category": "risk-register",
                "status": "ready",
                "evidenceCount": 12,
            }
        ],
        overallScore=OverallScore(score=82, level="High", change="-6 pts"),
        metrics=[AnalysisMetric(id="high-risks", label="High Risks", value=57)],
        heatmap=[
            HeatmapRow(
                division="Retail Banking",
                cells=[HeatmapCell(category="Cyber", level=4)],
            )
        ],
        trend=[{"month": "Jul", "high": 57, "medium": 124, "low": 161}],
        keyFindings=[
            KeyFinding(
                id="AF-2026-114",
                title="Legacy privileged access",
                severity="Critical",
                evidence=[Evidence(documentId="doc1", documentType="xlsx", sourceRef="row 4")],
                confidence=88,
            )
        ],
        recommendations=[
            Recommendation(
                id="rec-1",
                priority="Critical",
                action="Recertify privileged access",
                confidence=91,
            )
        ],
    )


def test_severity_accepts_valid_values():
    for value in ["Critical", "High", "Medium", "Low"]:
        assert OverallScore(level=value).level == value


def test_severity_rejects_invalid_value():
    with pytest.raises(ValidationError):
        OverallScore(level="Extreme")


def test_heatmap_level_bounds():
    with pytest.raises(ValidationError):
        HeatmapCell(category="Cyber", level=5)
    with pytest.raises(ValidationError):
        HeatmapCell(category="Cyber", level=-1)


def test_confidence_bounds():
    with pytest.raises(ValidationError):
        AnalysisResult(id="r", createdAt="now", confidence=101)


def test_analysis_result_round_trips_through_json():
    result = _sample_result()
    restored = AnalysisResult.model_validate_json(result.model_dump_json())
    assert restored == result
    assert restored.overallScore.score == 82
    assert restored.metrics[0].value == 57
    assert restored.heatmap[0].cells[0].level == 4
    assert restored.keyFindings[0].confidence == 88


def test_interpreted_documents_round_trip():
    interpreted = InterpretedDocuments(
        riskRegister=[
            RiskItem(id="risk-1", description="Fraud exposure", severity="Critical", source=SRC)
        ],
        auditFindings=[
            AuditFinding(id="af-1", title="SoD gap", rating="High", source=SRC)
        ],
        exceptions=[],
        misRows=[MISRow(id="m-1", indicator="High risk count", value="57", source=SRC)],
        warnings=["Column mapping guessed"],
    )
    restored = InterpretedDocuments.model_validate_json(interpreted.model_dump_json())
    assert restored == interpreted
    assert restored.riskRegister[0].source.sourceRef == "Sheet1 · row 4"


def test_analysis_run_defaults():
    run = AnalysisRun(id="run1", documentIds=["doc1", "doc2"])
    assert run.status == "queued"
    assert run.startedAt is None
    assert run.completedAt is None
    assert run.resultId is None
    assert run.modelInfo.provider == "deterministic"
    assert run.warnings == []


def test_analysis_run_lifecycle_values_are_valid():
    for value in ["queued", "processing", "ready", "partial", "failed"]:
        run = AnalysisRun(id="r", status=value)
        assert run.status == value
    with pytest.raises(ValidationError):
        AnalysisRun(id="r", status="done")
