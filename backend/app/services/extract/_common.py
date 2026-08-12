from __future__ import annotations

from datetime import date, datetime
from typing import Any

_MAX_COLUMNS = 200
_MAX_ROWS_PER_TABLE = 2_000
_MAX_TABLES = 50


def cell_value(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat(timespec="seconds")
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    text = str(value).strip()
    return text if text else None


def row_cells(row: list[Any]) -> list[str | None]:
    return [cell_value(value) for value in row[:_MAX_COLUMNS]]


def rows_to_table(name: str, rows: list[list[Any]]) -> dict:
    normalized = [row_cells(row) for row in rows[:_MAX_ROWS_PER_TABLE]]
    if not normalized:
        return {"name": name, "headers": None, "rows": []}
    if len(normalized) >= 2 and all(
        value is not None for value in normalized[0]
    ):
        headers = normalized[0]
        data = normalized[1:]
    else:
        headers = None
        data = normalized
    return {"name": name, "headers": headers, "rows": data}
