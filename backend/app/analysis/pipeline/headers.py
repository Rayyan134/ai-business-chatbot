from __future__ import annotations

import re
from dataclasses import dataclass


def normalize_header(text: str) -> str:
    cleaned = re.sub(r"[^a-z0-9%$]+", " ", str(text).lower())
    return " ".join(cleaned.split())


def score_header(header: str, synonym: str) -> float:
    h = normalize_header(header)
    s = normalize_header(synonym)
    if not h or not s:
        return 0.0
    if h == s:
        return 3.0
    if s in h:
        return 2.0
    if h in s:
        return 1.5
    h_tokens = set(h.split())
    s_tokens = set(s.split())
    if h_tokens & s_tokens:
        return 1.0
    return 0.0


@dataclass(frozen=True)
class FieldDef:
    name: str
    synonyms: tuple[str, ...]


def match_headers(
    headers: list[str | None],
    field_defs: tuple[FieldDef, ...],
) -> tuple[dict[str, int], list[str]]:
    warnings: list[str] = []
    mapping: dict[str, int] = {}

    candidates = []
    for index, header in enumerate(headers):
        if header is None:
            continue
        best_field = None
        best_score = 0.0
        for field in field_defs:
            score = max(score_header(header, synonym) for synonym in field.synonyms)
            if score > best_score:
                best_field = field.name
                best_score = score
        if best_field is not None:
            candidates.append((best_score, index, header, best_field))
    candidates.sort(key=lambda entry: entry[0], reverse=True)

    assigned: set[str] = set()
    for score, index, header, field in candidates:
        if field in assigned:
            continue
        mapping[field] = index
        assigned.add(field)

    for index, header in enumerate(headers):
        if header is None:
            continue
        ranked = []
        for field in field_defs:
            score = max(score_header(header, synonym) for synonym in field.synonyms)
            if score > 0:
                ranked.append((score, field.name))
        ranked.sort(key=lambda entry: entry[0], reverse=True)
        if (
            len(ranked) >= 2
            and ranked[0][0] == ranked[1][0]
            and ranked[0][0] >= 1.5
        ):
            warnings.append(
                f"Ambiguous column '{header}' (matches {', '.join(entry[1] for entry in ranked[:2])})"
            )

    return mapping, warnings
