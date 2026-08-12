from __future__ import annotations

from .csv import extract_csv
from .docx import extract_docx
from .pdf import extract_pdf
from .xlsx import extract_xlsx

EXTRACTORS = {
    "pdf": extract_pdf,
    "docx": extract_docx,
    "xlsx": extract_xlsx,
    "xls": extract_xlsx,
    "csv": extract_csv,
}


def extract(file_path: str, file_type: str) -> dict:
    extractor = EXTRACTORS[file_type]
    if file_type == "xls":
        return extractor(file_path, xls=True)
    return extractor(file_path)
