from __future__ import annotations

import csv
import io

from ._common import rows_to_table


def extract_csv(file_path: str) -> dict:
    import charset_normalizer

    with open(file_path, "rb") as handle:
        raw = handle.read()

    detection = charset_normalizer.from_bytes(raw).best()
    if detection:
        encoding = detection.encoding
        text = raw.decode(encoding, errors="replace")
    else:
        encoding = "utf-8"
        text = raw.decode(encoding, errors="replace")
    if text.startswith("\ufeff"):
        text = text[1:]

    try:
        dialect = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel

    rows = [row for row in csv.reader(io.StringIO(text), dialect)]
    rows = [row for row in rows if any(cell.strip() for cell in row)]

    table = rows_to_table("CSV", rows)
    headers = table["headers"]
    data = table["rows"]

    text_parts: list[str] = []
    if headers:
        text_parts.append(", ".join(headers))
    for row in data:
        text_parts.append(", ".join(cell or "" for cell in row))

    return {
        "text": "\n".join(text_parts),
        "tables": [table],
        "metadata": {
            "encoding": encoding,
            "rowCount": len(data),
            "columnHeaders": headers,
        },
    }
