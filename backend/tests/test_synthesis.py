from __future__ import annotations

import pytest

from app.analysis.aggregation import aggregate_interpretation
from app.analysis.models.interpreted import InterpretedDocuments
from app.analysis.synthesis.fallback import synthesize_deterministic
from app.analysis.synthesis.models import SynthesisOutput
from app.analysis.synthesis.service import synthesize_result
from app.analysis.models import AnalysisResult, DocumentInterpretation
from app.analysis.models.interpreted import (
    AuditFinding,
    ExceptionItem,
    MISRow,
    RiskItem,
    SourceRef,
)


def source(doc="d1", ref="Risk Register.csv · row 2", snippet="risk row data"):
    return SourceRef(
        documentId=doc,
        documentType="csv",
        category="risk-register",
        sourceRef=ref,
        snippet=snippet,
    )


def make_risk(
    id="r1",
    severity="High",
    division="Retail Banking",
    category="Cyber",
    likelihood="3",
    impact="4",
):
    return RiskItem(
        id=id,
        description=f"Risk {id}",
        category=category,
        division=division,
        likelihood=likelihood,
        impact=impact,
        severity=severity,
        status="Open",
        owner="Owner",
        mitigation="MFA",
        source=source(snippet=f"Risk {id} row"),
    )


def build(risks=None, findings=None, exceptions=None, mis=None, coverage=None):
    return InterpretedDocuments(
        documentIds=["d1"],
        riskRegister=risks or [],
        auditFindings=findings or [],
        exceptions=exceptions or [],
        misRows=mis or [],
        coverage=coverage or [],
        warnings=[],
    )


def coverage_entry():
    return DocumentInterpretation(
        id="d1",
        filename="Risk Register.csv",
        category="risk-register",
        status="interpreted",
        available=True,
        evidenceCount=1,
        rowsProcessed=5,
    )


class TestFallback:
    def test_summary_paragraphs_are_factual(self):
        risks = [make_risk("r1", severity="Critical", likelihood="5", impact="5")]
        output = synthesize_deterministic(
            aggregate_interpretation(build(risks=risks, coverage=[coverage_entry()]))
        )
        assert isinstance(output, SynthesisOutput)
        joined = "\n".join(output.summaryParagraphs)
        assert "100/100" in joined
        assert "Critical" in joined
        assert "Risk r1" in joined

    def test_recommendations_derive_from_findings(self):
        risks = [
            make_risk("r1", severity="Critical", category="Cyber", likelihood="5", impact="5"),
            make_risk("r2", severity="High", category="Process", likelihood="3", impact="4"),
        ]
        output = synthesize_deterministic(aggregate_interpretation(build(risks=risks)))
        assert output.recommendations
        assert output.recommendations[0].category == "Cyber"
        assert output.recommendations[0].priority == "Critical"

    def test_exception_overdue_drives_recommendation(self):
        exceptions = [
            ExceptionItem(
                id="e1",
                description="Exception e1",
                division="Corporate",
                raisedDate="2026-01-01",
                severity="Low",
                status="Active",
                daysOpen=40,
                owner="Owner",
                source=source(ref="Exception Log.csv · row 2"),
            )
        ]
        output = synthesize_deterministic(
            aggregate_interpretation(build(exceptions=exceptions))
        )
        assert any("overdue" in rec.action.lower() for rec in output.recommendations)

    def test_empty_data_yields_explicit_message(self):
        output = synthesize_deterministic(aggregate_interpretation(build()))
        joined = "\n".join(output.summaryParagraphs)
        assert "No risk register items" in joined
        assert output.recommendations


class TestSynthesisResult:
    def test_produces_complete_analysis_result(self):
        risks = [
            make_risk("r1", severity="Critical", category="Cyber", likelihood="5", impact="5"),
            make_risk("r2", severity="High", category="Process", likelihood="3", impact="4"),
        ]
        aggregated = aggregate_interpretation(
            build(risks=risks, coverage=[coverage_entry()])
        )
        result = synthesize_result(aggregated)
        assert isinstance(result, AnalysisResult)
        assert result.status == "ready"
        assert result.id
        assert result.createdAt
        assert result.overallScore.score == 88
        assert result.overallScore.level == "Critical"
        assert result.summary.paragraphs
        assert result.summary.generatedAt
        assert result.summary.sources
        assert result.recommendations
        assert result.keyFindings

    def test_warnings_carried_through(self):
        interpreted = build(coverage=[coverage_entry()])
        interpreted.warnings.append("Column mapping guessed")
        aggregated = aggregate_interpretation(interpreted)
        result = synthesize_result(aggregated)
        assert "Column mapping guessed" in result.warnings

    def test_deterministic_path_appends_warning_when_data_present(self):
        risks = [make_risk("r1", severity="High")]
        aggregated = aggregate_interpretation(build(risks=risks))
        result = synthesize_result(aggregated)
        assert any("deterministically" in w for w in result.warnings)

    def test_no_data_does_not_append_deterministic_warning(self):
        aggregated = aggregate_interpretation(build())
        result = synthesize_result(aggregated)
        assert not any("deterministically" in w for w in result.warnings)

    def test_summary_sources_reflect_document_evidence(self):
        risks = [make_risk("r1", severity="High")]
        aggregated = aggregate_interpretation(
            build(risks=risks, coverage=[coverage_entry()])
        )
        result = synthesize_result(aggregated)
        assert result.summary.sources[0].label == "Risk Register.csv"
        assert result.summary.sources[0].count == "1"


@pytest.fixture
def _disable_llm(monkeypatch):
    import app.analysis.synthesis.client as client

    monkeypatch.setattr(client, "_client", lambda: None)


def test_llm_unavailable_falls_back_to_deterministic(_disable_llm):
    from app.analysis.synthesis import client

    aggregated = aggregate_interpretation(
        build(risks=[make_risk("r1", severity="High")])
    )
    assert client.synthesize_with_llm({}) is None
    result = synthesize_result(aggregated)
    assert result.recommendations
    assert any("deterministically" in w for w in result.warnings)


class TestPromptFormatting:
    """Regression cover for the str.format()-on-JSON-braces defect.

    The response schema used to live inline inside USER_PROMPT_TEMPLATE, so its
    literal braces were parsed as replacement fields and raised KeyError as soon
    as an OpenAI API key was configured.
    """

    def test_template_renders_without_keyerror(self):
        import json

        from app.analysis.synthesis.prompts import (
            RESPONSE_SCHEMA,
            USER_PROMPT_TEMPLATE,
        )

        context = json.dumps({"overallScore": {"score": 70}})
        prompt = USER_PROMPT_TEMPLATE.format(context=context, schema=RESPONSE_SCHEMA)
        assert context in prompt
        assert RESPONSE_SCHEMA in prompt
        assert "summaryParagraphs" in prompt

    def test_template_contains_no_stray_literal_braces(self):
        from app.analysis.synthesis.prompts import USER_PROMPT_TEMPLATE

        # Only the two real placeholders may remain.
        assert USER_PROMPT_TEMPLATE.count("{") == 2
        assert USER_PROMPT_TEMPLATE.count("}") == 2

    def test_successful_llm_response_is_parsed(self, monkeypatch):
        import json
        from types import SimpleNamespace

        import app.analysis.synthesis.client as client

        payload = json.dumps(
            {
                "summaryParagraphs": ["Executive summary line."],
                "recommendations": [
                    {
                        "priority": "High",
                        "category": "risk-register",
                        "action": "Automate reconciliation",
                        "impact": "Reduces exposure",
                    }
                ],
                "managementActions": [
                    {
                        "action": "Approve tooling",
                        "owner": "CFO",
                        "department": "Finance",
                        "dueDate": "2026-03-31",
                        "priority": "High",
                        "status": "Open",
                    }
                ],
            }
        )
        captured: dict = {}

        class _FakeCompletions:
            def create(self, **kwargs):
                captured.update(kwargs)
                return SimpleNamespace(
                    choices=[
                        SimpleNamespace(message=SimpleNamespace(content=payload))
                    ]
                )

        monkeypatch.setattr(
            client, "_client", lambda: SimpleNamespace(
                chat=SimpleNamespace(completions=_FakeCompletions())
            )
        )

        output = client.synthesize_with_llm({"overallScore": {"score": 70}})

        assert output is not None
        assert output.summaryParagraphs == ["Executive summary line."]
        assert output.recommendations[0].action == "Automate reconciliation"
        # The rendered prompt must reach the model, schema included.
        user_message = captured["messages"][1]["content"]
        assert "summaryParagraphs" in user_message
        assert captured["response_format"] == {"type": "json_object"}

    def test_prompt_build_failure_degrades_instead_of_raising(self, monkeypatch):
        import app.analysis.synthesis.client as client

        monkeypatch.setattr(client, "_client", lambda: object())
        monkeypatch.setattr(
            client, "USER_PROMPT_TEMPLATE", "{missing_placeholder}"
        )
        # A prompt-building error must be swallowed so the run still succeeds.
        assert client.synthesize_with_llm({}) is None
