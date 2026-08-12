from __future__ import annotations

from ._common import rows_to_table


def extract_pdf(file_path: str) -> dict:
    import pdfplumber

    text_parts: list[str] = []
    tables: list[dict] = []

    with pdfplumber.open(file_path) as pdf:
        page_count = len(pdf.pages)
        for index, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)
            for raw_table in page.extract_tables() or []:
                cleaned = [
                    [(cell.strip() if cell else None) for cell in row]
                    for row in raw_table
                ]
                tables.append(rows_to_table(f"Page {index}", cleaned))

    text = "\n\n".join(part.strip() for part in text_parts)
    if not text and not tables:
        raise ValueError(
            "PDF contains no extractable text layer; scanned PDFs require "
            "OCR, which is not supported yet."
        )

    return {
        "text": text,
        "tables": tables[:_MAX_TABLES],
        "metadata": {"pageCount": page_count},
    }


_MAX_TABLES = 50
