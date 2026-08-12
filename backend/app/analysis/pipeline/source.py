from __future__ import annotations

from app.analysis.models.interpreted import SourceRef
from app.models.documents import DocumentRecord

_SNIPPET_LIMIT = 200


def make_source(
    document: DocumentRecord,
    table_name: str,
    table_occurrence: int,
    row_number: int,
    row_cells: list[str | None],
) -> SourceRef:
    label = table_name
    if table_occurrence > 1:
        label = f"{table_name} (table {table_occurrence})"
    snippet = " · ".join(cell for cell in row_cells if cell)
    return SourceRef(
        documentId=document.id,
        documentType=document.fileType,
        category=document.category,
        sourceRef=f"{label} · row {row_number}",
        snippet=snippet[:_SNIPPET_LIMIT],
    )
