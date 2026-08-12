from __future__ import annotations

from pydantic import BaseModel, Field

from app.analysis.models import (
    AnalysisMetric,
    DocumentCoverage,
    HeatmapRow,
    KeyFinding,
    RiskTrendPoint,
)
from app.analysis.models.severity import Severity


class SeverityBucket(BaseModel):
    severity: Severity
    count: int


class DivisionExposureRow(BaseModel):
    division: str
    count: int
    severityScore: int
    level: Severity


class CategoryExposureRow(BaseModel):
    category: str
    count: int
    severityScore: int
    level: Severity


class AuditDivisionMetrics(BaseModel):
    division: str
    total: int
    open: int
    closed: int
    critical: int
    high: int
    medium: int
    low: int


class ExceptionDivisionMetrics(BaseModel):
    division: str
    total: int
    open: int
    overdue: int
    critical: int
    high: int
    medium: int
    low: int
    avgDaysOpen: float
    maxDaysOpen: int


class DocumentCoverageSummary(BaseModel):
    documentsReceived: int = 0
    documentsInterpreted: int = 0
    documentsSkipped: int = 0
    rowsProcessed: int = 0
    evidenceCount: int = 0


class AggregatedAnalysis(BaseModel):
    overallScore: int = 0
    overallLevel: Severity = "Low"
    overallDescription: str = ""
    metrics: list[AnalysisMetric] = Field(default_factory=list)
    heatmap: list[HeatmapRow] = Field(default_factory=list)
    trend: list[RiskTrendPoint] = Field(default_factory=list)
    trendAvailable: bool = False
    keyFindings: list[KeyFinding] = Field(default_factory=list)
    severityDistribution: list[SeverityBucket] = Field(default_factory=list)
    auditMetrics: dict[str, int] = Field(default_factory=dict)
    exceptionMetrics: dict[str, int] = Field(default_factory=dict)
    divisionExposure: list[DivisionExposureRow] = Field(default_factory=list)
    categoryExposure: list[CategoryExposureRow] = Field(default_factory=list)
    auditByDivision: list[AuditDivisionMetrics] = Field(default_factory=list)
    exceptionByDivision: list[ExceptionDivisionMetrics] = Field(default_factory=list)
    exceptionsAvgDaysOpen: float = 0.0
    exceptionsMaxDaysOpen: int = 0
    documents: list[DocumentCoverage] = Field(default_factory=list)
    coverage: DocumentCoverageSummary = Field(default_factory=DocumentCoverageSummary)
    confidence: int = 0
    warnings: list[str] = Field(default_factory=list)
