from __future__ import annotations

MAX_TEXT_CHARS = 1_000_000

_ALLOWED_CATEGORIES = {
    "risk-register",
    "audit-findings",
    "exception-log",
    "mis",
    "policy",
}

_FILE_EXTENSIONS = {
    "pdf": ".pdf",
    "docx": ".docx",
    "xlsx": ".xlsx",
    "xls": ".xls",
    "csv": ".csv",
}


def detect_category(filename: str) -> str:
    lower = filename.lower()
    if "risk" in lower:
        return "risk-register"
    if "audit" in lower or "gia" in lower:
        return "audit-findings"
    if "exception" in lower:
        return "exception-log"
    if "mis" in lower:
        return "mis"
    return "policy"


def resolve_category(filename: str, hint: str | None) -> str:
    if hint and hint in _ALLOWED_CATEGORIES:
        return hint
    return detect_category(filename)


def file_extension(file_type: str) -> str:
    return _FILE_EXTENSIONS[file_type]


def build_record(
    *,
    document_id: str,
    filename: str,
    file_type: str,
    category: str,
    uploaded_at: str,
    uploaded_by: str,
    size_bytes: int,
    sha256: str,
    status: str,
    error: str | None,
    extraction: dict,
) -> dict:
    text = (extraction.get("text") or "")[:MAX_TEXT_CHARS]
    return {
        "id": document_id,
        "filename": filename,
        "fileType": file_type,
        "category": category,
        "uploadedAt": uploaded_at,
        "uploadedBy": uploaded_by,
        "sizeBytes": size_bytes,
        "sha256": sha256,
        "status": status,
        "error": error,
        "text": text,
        "tables": extraction.get("tables") or [],
        "metadata": extraction.get("metadata") or {},
    }
