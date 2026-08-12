"""Structured output models for the AI synthesis phase.

These models describe the JSON the LLM must return. The same models are used
to validate a fallback (deterministic) synthesis so both paths produce
identical structure.
"""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.analysis.models.severity import Severity


class SynthesisRecommendation(BaseModel):
    priority: Severity
    category: str = ""
    action: str
    impact: str = ""


class SynthesisManagementAction(BaseModel):
    action: str
    owner: str = ""
    department: str = ""
    dueDate: str = ""
    priority: Severity = "Medium"
    status: str = "Open"


class SynthesisOutput(BaseModel):
    summaryParagraphs: list[str] = Field(default_factory=list)
    recommendations: list[SynthesisRecommendation] = Field(default_factory=list)
    managementActions: list[SynthesisManagementAction] = Field(default_factory=list)
