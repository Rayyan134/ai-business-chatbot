import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _path(value: str | None, default: Path) -> Path:
    if not value:
        return default
    p = Path(value)
    return p if p.is_absolute() else BASE_DIR / p


def _int(value: str | None, default: int) -> int:
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


UPLOAD_RAW_DIR = _path(os.getenv("UPLOAD_RAW_DIR"), BASE_DIR / "uploads" / "raw")
UPLOAD_PARSED_DIR = _path(
    os.getenv("UPLOAD_PARSED_DIR"), BASE_DIR / "uploads" / "parsed"
)
MAX_FILE_SIZE_BYTES = _int(os.getenv("MAX_FILE_SIZE_MB"), 20) * 1024 * 1024
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]
DOCUMENT_TTL_DAYS = _int(os.getenv("DOCUMENT_TTL_DAYS"), 30)

# --- AI synthesis configuration ---
# API key comes exclusively from the backend environment; it is never sent to
# the frontend and is never logged.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
# Model names are configurable and never hardcoded into business logic.
# The interpretation model is reserved for future LLM-assisted interpretation;
# the current interpretation pipeline is deterministic and does not use it.
ANALYSIS_INTERPRETATION_MODEL = os.getenv(
    "ANALYSIS_INTERPRETATION_MODEL", "gpt-4o-mini"
)
ANALYSIS_SYNTHESIS_MODEL = os.getenv("ANALYSIS_SYNTHESIS_MODEL", "gpt-4o-mini")
# Per-request timeout in seconds for AI calls.
ANALYSIS_AI_TIMEOUT = _int(os.getenv("ANALYSIS_AI_TIMEOUT"), 30)
