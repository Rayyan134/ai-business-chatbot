from __future__ import annotations

import re
import zipfile
from io import BytesIO

from app.config import MAX_FILE_SIZE_BYTES

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".xlsx": "xlsx",
    ".xls": "xls",
    ".csv": "csv",
}

_PDF_SIGNATURE = b"%PDF"
_ZIP_SIGNATURE = b"PK\x03\x04"
_OLE_SIGNATURE = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"

_PAGE_RANGE = (100, 100_000)


class DocumentValidationError(Exception):
    """Raised when an uploaded file fails validation."""


def _sanitize_extension(filename: str) -> str | None:
    match = re.search(r"\.([A-Za-z0-9]{1,8})$", filename)
    return f".{match.group(1).lower()}" if match else None


def _is_zip_with_entry(data: bytes, prefix: str) -> bool:
    try:
        with zipfile.ZipFile(BytesIO(data)) as archive:
            return any(name.startswith(prefix) for name in archive.namelist())
    except (zipfile.BadZipFile, OSError):
        return False


def _validate_magic(data: bytes, file_type: str) -> bool:
    if file_type == "pdf":
        return data.startswith(_PDF_SIGNATURE) and _PAGE_RANGE[0] <= len(data)
    if file_type == "docx":
        return _is_zip_with_entry(data, "word/")
    if file_type == "xlsx":
        return _is_zip_with_entry(data, "xl/")
    if file_type == "xls":
        return data.startswith(_OLE_SIGNATURE)
    if file_type == "csv":
        return b"\x00" not in data
    return False


def detect_file_type(filename: str, data: bytes) -> str:
    extension = _sanitize_extension(filename)
    if extension is None or extension not in ALLOWED_EXTENSIONS:
        raise DocumentValidationError(
            f"Unsupported file type '{filename}'. Allowed: "
            f"{', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )

    file_type = ALLOWED_EXTENSIONS[extension]

    if len(data) > MAX_FILE_SIZE_BYTES:
        raise DocumentValidationError(
            f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB limit."
        )
    if len(data) == 0:
        raise DocumentValidationError("Uploaded file is empty.")

    if not _validate_magic(data, file_type):
        raise DocumentValidationError(
            f"File contents do not match the .{extension} extension."
        )

    return file_type
