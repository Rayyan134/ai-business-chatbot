from __future__ import annotations

import docx
from docx.document import Document as DocumentObject
from docx.table import Table
from docx.text.paragraph import Paragraph

from ._common import rows_to_table

_DOCX_NAMESPACE = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def _iter_block_items(document: DocumentObject):
    body = document.element.body
    for child in body.iterchildren():
        tag = child.tag
        if tag == f"{_DOCX_NAMESPACE}p":
            yield Paragraph(child, document)
        elif tag == f"{_DOCX_NAMESPACE}tbl":
            yield Table(child, document)


def extract_docx(file_path: str) -> dict:
    document = docx.Document(file_path)

    text_parts: list[str] = []
    tables: list[dict] = []
    for item in _iter_block_items(document):
        if isinstance(item, Paragraph):
            if item.text.strip():
                text_parts.append(item.text.strip())
        elif isinstance(item, Table):
            rows = [[cell.text.strip() for cell in row.cells] for row in item.rows]
            tables.append(rows_to_table("Table", rows))

    properties = document.core_properties
    metadata = {
        "author": properties.author or None,
        "createdAt": properties.created.isoformat(timespec="seconds")
        if properties.created
        else None,
    }

    return {
        "text": "\n\n".join(text_parts),
        "tables": tables[:_MAX_TABLES],
        "metadata": metadata,
    }


_MAX_TABLES = 50
