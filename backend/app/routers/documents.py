from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models import DocumentRecord, DocumentSummary
from app.services import storage, validation
from app.services.ingest import ingest_document

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("", response_model=DocumentRecord, status_code=201)
def upload_document(
    file: Annotated[UploadFile, File(...)],
    category: Annotated[str, Form()] = "",
) -> DocumentRecord:
    data = file.file.read()
    try:
        record = ingest_document(data, file.filename or "upload", category or None)
    except validation.DocumentValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return DocumentRecord(**record)


@router.get("", response_model=list[DocumentSummary])
def list_documents() -> list[DocumentSummary]:
    summaries = [
        {key: record[key] for key in DocumentSummary.model_fields}
        for record in storage.list_parsed()
    ]
    return [DocumentSummary(**summary) for summary in summaries]


@router.get("/{document_id}", response_model=DocumentRecord)
def get_document(document_id: str) -> DocumentRecord:
    record = storage.read_parsed(document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentRecord(**record)
