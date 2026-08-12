from __future__ import annotations

from app.services import normalizer, storage, validation
from app.services.extract import extract


def ingest_document(
    data: bytes, filename: str, category_hint: str | None = None
) -> dict:
    file_type = validation.detect_file_type(filename, data)
    document_id = storage.generate_document_id()
    uploaded_at = storage.now_iso()
    sha256 = storage.content_sha256(data)

    storage.write_raw(data, document_id, normalizer.file_extension(file_type))
    category = normalizer.resolve_category(filename, category_hint)

    status = "ready"
    error = None
    try:
        extraction = extract(
            str(storage.UPLOAD_RAW_DIR / f"{document_id}{normalizer.file_extension(file_type)}"),
            file_type,
        )
    except Exception as exc:
        status = "failed"
        error = f"Failed to parse {file_type} document: {type(exc).__name__}."
        extraction = {"text": "", "tables": [], "metadata": {}}

    record = normalizer.build_record(
        document_id=document_id,
        filename=filename,
        file_type=file_type,
        category=category,
        uploaded_at=uploaded_at,
        uploaded_by="Sarah Chen",
        size_bytes=len(data),
        sha256=sha256,
        status=status,
        error=error,
        extraction=extraction,
    )

    storage.write_parsed(document_id, record)
    return record
