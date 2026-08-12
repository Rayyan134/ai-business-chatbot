from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

RunStatus = Literal["queued", "processing", "ready", "partial", "failed"]


class AnalysisModelInfo(BaseModel):
    provider: str = "deterministic"
    analysisModel: str | None = None
    synthesisModel: str | None = None


class AnalysisRun(BaseModel):
    id: str
    documentIds: list[str] = Field(default_factory=list)
    status: RunStatus = "queued"
    startedAt: str | None = None
    completedAt: str | None = None
    modelInfo: AnalysisModelInfo = Field(default_factory=AnalysisModelInfo)
    resultId: str | None = None
    warnings: list[str] = Field(default_factory=list)
    error: str | None = None
