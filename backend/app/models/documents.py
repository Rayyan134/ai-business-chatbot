from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

FileType = Literal["pdf", "docx", "xlsx", "xls", "csv"]
DocCategory = Literal[
    "risk-register",
    "audit-findings",
    "exception-log",
    "mis",
    "policy",
]
RecordStatus = Literal["processing", "ready", "failed"]


class ExtractedTable(BaseModel):
    name: str
    headers: list[str] | None = None
    rows: list[list[str | None]]


class DocumentMetadata(BaseModel):
    pageCount: int | None = None
    sheetCount: int | None = None
    rowCount: int | None = None
    columnHeaders: list[str] | None = None
    encoding: str | None = None
    author: str | None = None
    createdAt: str | None = None


class DocumentRecord(BaseModel):
    id: str
    filename: str
    fileType: FileType
    category: DocCategory
    uploadedAt: str
    uploadedBy: str
    sizeBytes: int
    sha256: str
    status: RecordStatus
    error: str | None = None
    text: str = Field(default="", max_length=1_000_000)
    tables: list[ExtractedTable] = Field(default_factory=list)
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)


class DocumentSummary(BaseModel):
    id: str
    filename: str
    fileType: FileType
    category: DocCategory
    uploadedAt: str
    uploadedBy: str
    sizeBytes: int
    status: RecordStatus
    error: str | None = None
