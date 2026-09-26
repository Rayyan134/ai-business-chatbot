"""Deterministic, grounded fallback for Risk Copilot.

Used when the LLM is unavailable (no OpenAI key) or fails. Every handler derives
its answer strictly from the AnalysisResult so the response is never fabricated.
"""
from __future__ import annotations

from app.analysis.models.analysis import AnalysisResult, Evidence
from app.copilot.models import CopilotResponse, CopilotSource


def _metric(result: AnalysisResult, metric_id: str) -> int | None:
    for m in result.metrics:
        if m.id == metric_id:
            return m.value
    return None


def _sources_from_evidence(
    evidence: list[Evidence],
    default_label: str,
    filenames: dict[str, str] | None = None,
) -> list[CopilotSource]:
    filenames = filenames or {}
    sources: list[CopilotSource] = []
    for ev in evidence:
        label = filenames.get(ev.documentId or "") or ev.documentType or ev.documentId or default_label
        sources.append(
            CopilotSource(
                label=label,
                documentId=ev.documentId or None,
                documentType=ev.documentType or None,
                sourceRef=ev.sourceRef or None,
                snippet=ev.snippet or None,
            )
        )
    if not sources:
        sources.append(CopilotSource(label=default_label))
    return sources


def _filename_map(result: AnalysisResult) -> dict[str, str]:
    return {d.id: d.filename for d in result.documents}


def _doc_sources(result: AnalysisResult, *categories: str, label: str) -> list[CopilotSource]:
    docs = [d for d in result.documents if d.category in categories]
    if not docs:
        return [CopilotSource(label=label)]
    return [
        CopilotSource(label=d.filename, documentId=d.id, documentType=d.category)
        for d in docs
    ]


def _direct_confidence(result: AnalysisResult, evidence_count: int) -> int:
    coverage = min(1.0, 0.55 + 0.15 * evidence_count)
    value = round(0.6 * 100 * coverage + 0.4 * result.confidence)
    return max(40, min(97, value))


def _unavailable_confidence(result: AnalysisResult) -> int:
    return max(20, min(55, round(result.confidence * 0.4)))


def _answer_highest_risks(result: AnalysisResult) -> CopilotResponse:
    findings = result.keyFindings[:5]
    if not findings:
        return CopilotResponse(
            answer="The current analysis does not contain any key findings to rank.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Key Findings")],
            warnings=["No key findings available in the analysis result."],
            grounded=False,
        )
    lines = ["The highest-ranked risks in the current analysis are:"]
    evidence: list[Evidence] = []
    for i, f in enumerate(findings, 1):
        line = f"{i}. {f.title} — {f.severity}"
        if f.category:
            line += f" ({f.category})"
        lines.append(line)
        if f.likelihood or f.exposure:
            lines.append(f"   Likelihood: {f.likelihood or 'n/a'} · Exposure: {f.exposure or 'n/a'}")
        evidence.extend(f.evidence)
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(evidence)),
        sources=_sources_from_evidence(evidence, "Key Findings", _filename_map(result)),
        grounded=True,
    )


def _answer_critical_risks(result: AnalysisResult) -> CopilotResponse:
    critical = [f for f in result.keyFindings if f.severity == "Critical"]
    count = _metric(result, "critical-findings")
    if not critical and count is None:
        return CopilotResponse(
            answer="The analysis does not flag any critical risks.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Critical Findings")],
            warnings=["No critical findings available."],
            grounded=False,
        )
    lines = ["Critical risks from the current analysis:"]
    if count is not None:
        lines.append(f"- {count} critical finding(s) logged in the risk register.")
    evidence: list[Evidence] = []
    for f in critical[:5]:
        lines.append(f"- {f.title} ({f.category or 'n/a'})")
        evidence.extend(f.evidence)
    if not critical:
        evidence = []
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(evidence)),
        sources=_sources_from_evidence(evidence, "Critical Findings", _filename_map(result)) if evidence
        else _doc_sources(result, "risk-register", "audit-findings", label="Critical Findings"),
        grounded=True,
    )


def _answer_audit_findings(result: AnalysisResult) -> CopilotResponse:
    open_f = _metric(result, "open-findings")
    overdue = _metric(result, "overdue-findings")
    lines = ["Audit findings status:"]
    if open_f is not None:
        lines.append(f"- {open_f} open audit finding(s).")
    if overdue is not None:
        lines.append(f"- {overdue} overdue audit finding(s) require follow-up.")
    if len(lines) == 1:
        lines.append("No audit-finding metrics are present in this analysis.")
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, 1 if open_f is not None or overdue is not None else 0),
        sources=_doc_sources(result, "audit-findings", "gia-findings", label="Audit Findings"),
        grounded=bool(open_f is not None or overdue is not None),
    )


def _answer_exceptions(result: AnalysisResult) -> CopilotResponse:
    open_e = _metric(result, "open-exceptions")
    overdue = _metric(result, "overdue-exceptions")
    lines = ["Operational exceptions:"]
    if open_e is not None:
        lines.append(f"- {open_e} open exception(s).")
    if overdue is not None:
        lines.append(f"- {overdue} overdue exception(s) requiring immediate attention.")
    if len(lines) == 1:
        lines.append("No exception metrics are present in this analysis.")
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, 1 if open_e is not None or overdue is not None else 0),
        sources=_doc_sources(result, "exception-log", label="Exception Log"),
        grounded=bool(open_e is not None or overdue is not None),
    )


def _answer_management_actions(result: AnalysisResult) -> CopilotResponse:
    actions = result.managementActions[:8]
    if not actions:
        return CopilotResponse(
            answer="The analysis does not define any management actions.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Management Actions")],
            warnings=["No management actions available."],
            grounded=False,
        )
    lines = ["Suggested management actions:"]
    for i, a in enumerate(actions, 1):
        lines.append(
            f"{i}. {a.action} — Owner: {a.owner or 'n/a'}, "
            f"Due: {a.dueDate or 'n/a'}, Priority: {a.priority}, Status: {a.status}"
        )
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(actions)),
        sources=_doc_sources(result, "risk-register", "policy", label="Management Actions"),
        grounded=True,
    )


def _answer_recommendations(result: AnalysisResult) -> CopilotResponse:
    recs = result.recommendations[:8]
    if not recs:
        return CopilotResponse(
            answer="The analysis does not include recommendations.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Recommendations")],
            warnings=["No recommendations available."],
            grounded=False,
        )
    lines = ["Recommendations from the analysis:"]
    for i, r in enumerate(recs, 1):
        lines.append(f"{i}. [{r.priority}] {r.action} (Impact: {r.impact or 'n/a'})")
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(recs)),
        sources=_sources_from_evidence(
            [ev for r in recs for ev in r.evidence], "Recommendations", _filename_map(result)
        ),
        grounded=True,
    )


def _parse_change(change_raw: str) -> int | None:
    if not change_raw:
        return None
    text = str(change_raw).replace("pts", "").strip()
    try:
        return int(float(text))
    except ValueError:
        return None


def _answer_overall_score(result: AnalysisResult) -> CopilotResponse:
    score = result.overallScore
    change = ""
    delta = _parse_change(score.change)
    if delta is not None:
        direction = "up" if delta > 0 else "down"
        change = f" ({abs(delta)} pts {direction} vs prior period)"
    answer = (
        f"The overall operational risk score is {score.score}/100 ({score.level}){change}. "
        f"{score.description or ''}"
    )
    return CopilotResponse(
        answer=answer,
        confidence=_direct_confidence(result, 1),
        sources=_doc_sources(result, label="Overall Risk Score"),
        grounded=True,
    )


def _answer_division_exposure(result: AnalysisResult) -> CopilotResponse:
    if not result.heatmap:
        return CopilotResponse(
            answer="The analysis does not include a divisional heatmap.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Division Heatmap")],
            warnings=["No divisional exposure data available."],
            grounded=False,
        )
    lines = ["Divisional risk exposure (highest severity per division):"]
    for row in result.heatmap:
        worst = max((c.level for c in row.cells), default=0)
        lines.append(f"- {row.division}: highest severity level {worst}/4")
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(result.heatmap)),
        sources=_doc_sources(result, "risk-register", "mis", label="Division Heatmap"),
        grounded=True,
    )


def _answer_coverage(result: AnalysisResult) -> CopilotResponse:
    if not result.documents:
        return CopilotResponse(
            answer="No documents are recorded for this analysis.",
            confidence=_unavailable_confidence(result),
            sources=[CopilotSource(label="Document Coverage")],
            grounded=False,
        )
    lines = ["Documents analyzed:"]
    for d in result.documents:
        lines.append(f"- {d.filename} ({d.category}, {d.evidenceCount} evidence items, {d.status})")
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(result.documents)),
        sources=[
            CopilotSource(label=d.filename, documentId=d.id, documentType=d.category)
            for d in result.documents
        ],
        grounded=True,
    )


def _answer_confidence(result: AnalysisResult) -> CopilotResponse:
    answer = (
        f"The analysis model confidence is {result.confidence}/100. "
        f"Higher values indicate stronger evidentiary support across the "
        f"{len(result.documents)} analyzed document(s)."
    )
    return CopilotResponse(
        answer=answer,
        confidence=result.confidence,
        sources=_doc_sources(result, label="Analysis Confidence"),
        grounded=True,
    )


def _answer_concerns(result: AnalysisResult) -> CopilotResponse:
    score = result.overallScore
    critical = [f for f in result.keyFindings if f.severity == "Critical"][:3]
    overdue = _metric(result, "overdue-exceptions") or _metric(result, "overdue-findings")
    lines = [
        f"Key concern: overall risk is {score.level} ({score.score}/100).",
    ]
    if critical:
        lines.append("Top critical risks:")
        for f in critical:
            lines.append(f"- {f.title} ({f.category or 'n/a'})")
    if overdue:
        lines.append(f"- {overdue} overdue item(s) need urgent attention.")
    if result.recommendations:
        top = result.recommendations[0]
        lines.append(f"Priority recommendation: {top.action}")
    if len(lines) == 1:
        return _answer_generic(result)
    return CopilotResponse(
        answer="\n".join(lines),
        confidence=_direct_confidence(result, len(critical) + (1 if overdue else 0)),
        sources=_doc_sources(result, "risk-register", "audit-findings", label="Risk Concerns"),
        grounded=True,
    )


def _answer_generic(result: AnalysisResult) -> CopilotResponse:
    topics: list[str] = []
    if result.keyFindings:
        topics.append("highest and critical risks")
    if _metric(result, "open-findings") is not None:
        topics.append("audit findings")
    if _metric(result, "open-exceptions") is not None:
        topics.append("exceptions")
    if result.recommendations:
        topics.append("recommendations")
    if result.managementActions:
        topics.append("management actions")
    if result.heatmap:
        topics.append("divisional exposure")
    topics.append("overall risk score and analysis confidence")
    text = (
        "The available analysis data does not provide enough evidence to answer "
        "that specific question directly. I can answer questions about: "
        + ", ".join(topics)
        + "."
    )
    return CopilotResponse(
        answer=text,
        confidence=_unavailable_confidence(result),
        sources=_doc_sources(result, label="Analysis Result"),
        warnings=["The available documents do not provide enough evidence for this question."],
        grounded=False,
    )


def answer_deterministic(result: AnalysisResult, question: str) -> CopilotResponse:
    q = question.lower()
    if ("risk" in q) and any(
        k in q for k in ("highest", "top", "biggest", "rank", "most")
    ):
        return _answer_highest_risks(result)
    if "critical" in q and ("risk" in q or "finding" in q):
        return _answer_critical_risks(result)
    if "audit" in q or ("finding" in q and "overdue" in q):
        return _answer_audit_findings(result)
    if "exception" in q or "overdue item" in q:
        return _answer_exceptions(result)
    if "recommend" in q or "advice" in q:
        return _answer_recommendations(result)
    if "management action" in q or ("what" in q and "action" in q and "take" in q):
        return _answer_management_actions(result)
    if "score" in q or "risk level" in q or "risk position" in q:
        return _answer_overall_score(result)
    if "division" in q or "department" in q or "exposure" in q:
        return _answer_division_exposure(result)
    if "document" in q or "coverage" in q or "analyzed" in q:
        return _answer_coverage(result)
    if "confidence" in q:
        return _answer_confidence(result)
    if "why" in q or "concern" in q or "highlight" in q or "main risk" in q:
        return _answer_concerns(result)
    return _answer_generic(result)
