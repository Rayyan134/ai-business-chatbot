"""Pydantic models for the Risk Copilot API.

Field names use the JSON contract documented in the milestone plan:
request uses runId/resultId/message; response sources use camelCase.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class CopilotSource(BaseModel):
    label: str
    documentId: str | None = None
    documentType: str | None = None
    sourceRef: str | None = None
    snippet: str | None = None


class CopilotResponse(BaseModel):
    answer: str
    confidence: int = Field(ge=0, le=100)
    sources: list[CopilotSource] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    grounded: bool = True


class CopilotRequest(BaseModel):
    runId: str | None = None
    resultId: str | None = None
    message: str = Field(..., min_length=1, max_length=2000)


class CopilotOutput(BaseModel):
    """Structured output returned by the LLM (mirrors CopilotResponse minus warnings)."""

    answer: str
    confidence: int = Field(ge=0, le=100)
    sources: list[CopilotSource] = Field(default_factory=list)
    grounded: bool = True
