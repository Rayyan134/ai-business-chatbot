from __future__ import annotations

import re
from datetime import date, datetime, timedelta

_SEVERITY_WORDS = {
    "Critical": {"critical", "crit", "catastrophic", "severe", "extreme"},
    "High": {"high", "major", "serious"},
    "Medium": {"medium", "moderate", "med"},
    "Low": {"low", "minor", "minimal", "negligible"},
}

_STATUS_WORDS = {
    "Open": {"open", "new", "outstanding", "unresolved", "not closed"},
    "In Progress": {"in progress", "underway", "ongoing", "started", "working"},
    "Closed": {"closed", "resolved", "completed", "done", "fixed", "cleared", "mitigated"},
    "Overdue": {"overdue", "past due", "behind schedule", "delayed"},
    "Pending": {"pending", "queued", "waiting", "on hold", "scheduled", "to do"},
    "Approved": {"approved", "endorsed", "signed off"},
    "Not Started": {"not started", "planned", "not yet started"},
    "Expired": {"expired", "lapsed"},
    "Active": {"active", "current", "in force"},
}


def normalize_severity(value: str | None) -> str | None:
    if value is None:
        return None
    text = " ".join(str(value).strip().lower().split())
    if not text:
        return None

    if text in {"c", "cr"}:
        return "Critical"
    if text == "h":
        return "High"
    if text == "m":
        return "Medium"
    if text == "l":
        return "Low"

    words = set(re.findall(r"[a-z]+", text))
    for severity, synonyms in _SEVERITY_WORDS.items():
        if synonyms & words:
            return severity

    number = re.search(r"(\d+(?:\.\d+)?)", text)
    if number:
        return _severity_from_number(float(number.group(1)))

    return None


def _severity_from_number(value: float) -> str | None:
    if value >= 5:
        return "Critical"
    if value >= 4:
        return "High"
    if value >= 3:
        return "Medium"
    if value >= 1:
        return "Low"
    return None


def combine_severity(
    likelihood: float | None, impact: float | None
) -> str | None:
    if likelihood is not None and impact is not None:
        product = likelihood * impact
        if product >= 20:
            return "Critical"
        if product >= 10:
            return "High"
        if product >= 5:
            return "Medium"
        return "Low"
    if likelihood is not None:
        return _severity_from_number(likelihood)
    if impact is not None:
        return _severity_from_number(impact)
    return None


def normalize_status(value: str | None) -> str:
    if value is None:
        return ""
    text = " ".join(str(value).strip().lower().split())
    if not text:
        return ""

    words = set(re.findall(r"[a-z0-9]+", text))
    best_status: str | None = None
    best_length = 0
    for status, synonyms in _STATUS_WORDS.items():
        for synonym in synonyms:
            synonym_words = set(re.findall(r"[a-z0-9]+", synonym))
            if (
                synonym_words
                and synonym_words <= words
                and len(synonym_words) > best_length
            ):
                best_status = status
                best_length = len(synonym_words)
    if best_status is not None:
        return best_status
    return str(value).strip()


def normalize_date(value: str | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.date().isoformat()
    text = str(value).strip()
    if not text:
        return None

    iso_match = re.match(r"^(\d{4}-\d{2}-\d{2})", text)
    if iso_match:
        return iso_match.group(1)

    serial = re.match(r"^(\d{4,5})$", text)
    if serial:
        days = int(serial.group(1))
        if 20000 <= days <= 80000:
            return (datetime(1899, 12, 30) + timedelta(days=days)).date().isoformat()

    dash = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$", text)
    if dash:
        first, second, year = int(dash.group(1)), int(dash.group(2)), int(dash.group(3))
        if year < 100:
            year += 2000
        if first > 12:
            return f"{year:04d}-{second:02d}-{first:02d}"
        return f"{year:04d}-{first:02d}-{second:02d}"

    cleaned = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", text)
    for fmt in (
        "%d %B %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%b %d, %Y",
        "%B %Y",
        "%d %B %y",
    ):
        try:
            return datetime.strptime(cleaned, fmt).date().isoformat()
        except ValueError:
            continue

    return None


def normalize_number(value: str | None) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None

    sign = -1.0 if text.startswith("(") and ")" in text else 1.0
    compact = text.replace(",", "").replace("$", "").replace(" ", "").lower()
    multiplier = 1.0
    if compact.endswith("k"):
        multiplier, compact = 1e3, compact[:-1]
    elif compact.endswith("m"):
        multiplier, compact = 1e6, compact[:-1]
    elif compact.endswith("b"):
        multiplier, compact = 1e9, compact[:-1]

    match = re.search(r"-?\d+(?:\.\d+)?", compact)
    if not match:
        return None
    return sign * float(match.group(0)) * multiplier
