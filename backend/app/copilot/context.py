"""Build a compact, factual snapshot of an AnalysisResult for the Copilot LLM.

Only numbers, labels, and truncated snippets derived from the result are included
so the model cannot invent figures. Mirrors synthesis/context.py conventions.
"""
from __future__ import annotations

from app.analysis.models.analysis import AnalysisResult, Evidence


def _truncate(value: str | None, limit: int = 160) -> str | None:
    if not value:
        return None
    value = value.strip()
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def _evidence_snapshot(evidence: list[Evidence]) -> list[dict]:
    out: list[dict] = []
    for ev in evidence:
        out.append(
            {
                "documentId": ev.documentId,
                "documentType": ev.documentType,
                "sourceRef": ev.sourceRef,
                "snippet": _truncate(ev.snippet, 120),
            }
        )
    return out


def build_context(result: AnalysisResult) -> dict:
    findings = []
    for f in result.keyFindings[:10]:
        finding: dict = {
            "id": f.id,
            "title": _truncate(f.title, 160),
            "category": f.category,
            "severity": f.severity,
            "likelihood": f.likelihood,
            "exposure": f.exposure,
            "confidence": f.confidence,
        }
        evidence = _evidence_snapshot(f.evidence)
        if evidence:
            finding["evidence"] = evidence
        findings.append(finding)

    recommendations = []
    for r in result.recommendations[:10]:
        rec: dict = {
            "id": r.id,
            "priority": r.priority,
            "category": r.category,
            "action": _truncate(r.action, 220),
            "impact": _truncate(r.impact, 160),
            "confidence": r.confidence,
        }
        evidence = _evidence_snapshot(r.evidence)
        if evidence:
            rec["evidence"] = evidence
        recommendations.append(rec)

    actions = [
        {
            "id": a.id,
            "action": _truncate(a.action, 220),
            "owner": a.owner,
            "department": a.department,
            "dueDate": a.dueDate,
            "priority": a.priority,
            "status": a.status,
        }
        for a in result.managementActions[:10]
    ]

    heatmap = [
        {
            "division": row.division,
            "cells": [{"category": c.category, "level": c.level} for c in row.cells],
        }
        for row in result.heatmap
    ]

    trend = [
        {"month": t.month, "high": t.high, "medium": t.medium, "low": t.low}
        for t in result.trend[-12:]
    ]

    documents = [
        {
            "id": d.id,
            "filename": d.filename,
            "category": d.category,
            "status": d.status,
            "evidenceCount": d.evidenceCount,
        }
        for d in result.documents
    ]

    summary = {
        "generatedAt": result.summary.generatedAt,
        "paragraphs": result.summary.paragraphs[:3],
        "sources": [{"label": s.label, "count": s.count} for s in result.summary.sources],
    }

    return {
        "overallScore": {
            "score": result.overallScore.score,
            "level": result.overallScore.level,
            "description": _truncate(result.overallScore.description, 200),
            "change": result.overallScore.change,
        },
        "confidence": result.confidence,
        "metrics": [
            {"id": m.id, "label": m.label, "value": m.value}
            for m in result.metrics
            if m.value is not None
        ],
        "keyFindings": findings,
        "recommendations": recommendations,
        "managementActions": actions,
        "heatmap": heatmap,
        "trend": trend,
        "documents": documents,
        "summary": summary,
        "warnings": result.warnings,
    }
