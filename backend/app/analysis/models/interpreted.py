from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .severity import Severity

FileType = Literal["pdf", "docx", "xlsx", "xls", "csv"]


class SourceRef(BaseModel):
    documentId: str
    documentType: FileType
    category: str = ""
    sourceRef: str
    snippet: str | None = None


class RiskItem(BaseModel):
    id: str
    description: str
    category: str = ""
    division: str = ""
    likelihood: str = ""
    impact: str = ""
    severity: Severity
    status: str = ""
    owner: str = ""
    mitigation: str = ""
    source: SourceRef


class AuditFinding(BaseModel):
    id: str
    title: str
    division: str = ""
    rating: Severity
    status: str = ""
    dueDate: str = ""
    owner: str = ""
    source: SourceRef


class ExceptionItem(BaseModel):
    id: str
    description: str
    division: str = ""
    raisedDate: str = ""
    severity: Severity
    status: str = ""
    daysOpen: int = 0
    owner: str = ""
    source: SourceRef


class MISRow(BaseModel):
    id: str
    indicator: str
    period: str = ""
    value: str = ""
    unit: str = ""
    source: SourceRef


class DocumentInterpretation(BaseModel):
    id: str
    filename: str
    category: str = ""
    status: Literal["interpreted", "skipped"] = "interpreted"
    available: bool = True
    evidenceCount: int = 0
    rowsProcessed: int = 0
    reason: str = ""


class InterpretedDocuments(BaseModel):
    documentIds: list[str] = Field(default_factory=list)
    riskRegister: list[RiskItem] = Field(default_factory=list)
    auditFindings: list[AuditFinding] = Field(default_factory=list)
    exceptions: list[ExceptionItem] = Field(default_factory=list)
    misRows: list[MISRow] = Field(default_factory=list)
    coverage: list[DocumentInterpretation] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
