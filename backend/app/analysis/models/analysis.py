from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .severity import Severity

ResultStatus = Literal["processing", "ready", "partial", "failed"]
TrendDirection = Literal["up", "down"]


class OverallScore(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    level: Severity = "Low"
    description: str = ""
    change: str = ""


class AnalysisMetric(BaseModel):
    id: str
    label: str
    value: int
    change: str = ""
    trend: TrendDirection = "down"
    positive: bool = True


class HeatmapCell(BaseModel):
    category: str
    level: int = Field(default=0, ge=0, le=4)


class HeatmapRow(BaseModel):
    division: str
    cells: list[HeatmapCell] = Field(default_factory=list)


class RiskTrendPoint(BaseModel):
    month: str
    high: int = 0
    medium: int = 0
    low: int = 0


class Evidence(BaseModel):
    documentId: str
    documentType: str
    sourceRef: str
    snippet: str | None = None


class KeyFinding(BaseModel):
    id: str
    title: str
    category: str = ""
    severity: Severity
    likelihood: str = ""
    exposure: str = ""
    evidence: list[Evidence] = Field(default_factory=list)
    confidence: int = Field(default=0, ge=0, le=100)


class Recommendation(BaseModel):
    id: str
    priority: Severity
    category: str = ""
    action: str
    impact: str = ""
    evidence: list[Evidence] = Field(default_factory=list)
    confidence: int = Field(default=0, ge=0, le=100)


class ManagementAction(BaseModel):
    id: str
    action: str
    owner: str = ""
    department: str = ""
    dueDate: str = ""
    priority: Severity
    status: str = ""


class SourceCount(BaseModel):
    label: str
    count: str


class AnalysisSummary(BaseModel):
    generatedAt: str = ""
    paragraphs: list[str] = Field(default_factory=list)
    sources: list[SourceCount] = Field(default_factory=list)


class DocumentCoverage(BaseModel):
    id: str
    filename: str
    category: str = ""
    status: str = ""
    evidenceCount: int = 0


class AnalysisResult(BaseModel):
    id: str
    status: ResultStatus = "processing"
    createdAt: str
    confidence: int = Field(default=0, ge=0, le=100)
    warnings: list[str] = Field(default_factory=list)
    documents: list[DocumentCoverage] = Field(default_factory=list)
    overallScore: OverallScore = Field(default_factory=OverallScore)
    metrics: list[AnalysisMetric] = Field(default_factory=list)
    heatmap: list[HeatmapRow] = Field(default_factory=list)
    trend: list[RiskTrendPoint] = Field(default_factory=list)
    keyFindings: list[KeyFinding] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)
    managementActions: list[ManagementAction] = Field(default_factory=list)
    summary: AnalysisSummary = Field(default_factory=AnalysisSummary)
