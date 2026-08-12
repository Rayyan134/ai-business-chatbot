from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config import UPLOAD_PARSED_DIR, UPLOAD_RAW_DIR


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def generate_document_id() -> str:
    return uuid.uuid4().hex


def content_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def ensure_directories() -> None:
    UPLOAD_RAW_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_PARSED_DIR.mkdir(parents=True, exist_ok=True)


def write_raw(data: bytes, document_id: str, extension: str) -> Path:
    ensure_directories()
    path = UPLOAD_RAW_DIR / f"{document_id}{extension}"
    path.write_bytes(data)
    return path


def write_parsed(document_id: str, record: dict) -> Path:
    ensure_directories()
    path = UPLOAD_PARSED_DIR / f"{document_id}.json"
    path.write_text(
        json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return path


def read_parsed(document_id: str) -> dict | None:
    path = UPLOAD_PARSED_DIR / f"{document_id}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def list_parsed() -> list[dict]:
    ensure_directories()
    records: list[dict] = []
    for path in sorted(UPLOAD_PARSED_DIR.glob("*.json"), reverse=True):
        record = json.loads(path.read_text(encoding="utf-8"))
        records.append(record)
    return records
