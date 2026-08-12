from __future__ import annotations

from collections import Counter

from app.analysis.models.interpreted import (
    AuditFinding,
    DocumentInterpretation,
    ExceptionItem,
    InterpretedDocuments,
    MISRow,
    RiskItem,
)
from app.analysis.pipeline.headers import FieldDef, match_headers
from app.analysis.pipeline.normalization import (
    combine_severity,
    normalize_date,
    normalize_number,
    normalize_severity,
    normalize_status,
)
from app.analysis.pipeline.source import make_source
from app.models.documents import DocumentRecord, ExtractedTable
from app.services import storage

_RISK_FIELDS = (
    FieldDef("id", ("risk id", "id", "risk reference", "ref", "reference", "risk no", "risk code", "code")),
    FieldDef("description", ("risk description", "description", "risk statement", "risk title", "risk event", "risk name", "risk detail", "issue", "control failure")),
    FieldDef("category", ("risk category", "category", "risk type", "type", "classification", "risk classification", "domain")),
    FieldDef("division", ("division", "business unit", "business division", "unit", "department", "area", "function", "business area")),
    FieldDef("likelihood", ("likelihood", "probability", "prob", "likelihood rating", "likelihood score", "inherent likelihood")),
    FieldDef("impact", ("impact", "consequence", "impact rating", "impact score", "inherent impact")),
    FieldDef("inherent", ("inherent risk", "inherent rating", "gross risk", "inherent risk rating")),
    FieldDef("residual", ("residual risk", "residual rating", "residual risk level", "net risk", "current risk")),
    FieldDef("severity", ("severity", "risk level", "overall risk", "risk rating", "rating", "current level")),
    FieldDef("owner", ("owner", "risk owner", "owner name", "responsible", "accountable")),
    FieldDef("mitigation", ("mitigation", "mitigant", "control", "current control", "existing control", "mitigation action", "key controls", "controls", "risk treatment")),
    FieldDef("status", ("status", "state", "action plan status", "current status", "workflow status", "closure status")),
)

_AUDIT_FIELDS = (
    FieldDef("id", ("finding id", "finding reference", "audit id", "audit finding id", "id", "ref")),
    FieldDef("title", ("finding heading", "finding", "finding title", "title", "finding description", "finding detail", "issue", "observation", "audit finding")),
    FieldDef("division", ("division", "business unit", "business division", "unit", "department", "area", "business area")),
    FieldDef("rating", ("severity", "rating", "audit rating", "risk rating", "rating level", "finding rating", "priority", "severity rating")),
    FieldDef("status", ("status", "current status", "finding status", "closure status")),
    FieldDef("dueDate", ("due date", "target date", "due", "due by", "deadline", "closure date", "target", "completion date")),
    FieldDef("raisedDate", ("identified date", "raised date", "date raised", "date", "opened date", "created date", "reported date", "date identified")),
    FieldDef("owner", ("owner", "action owner", "owner name", "responsible", "assigned to")),
)

_EXCEPTION_FIELDS = (
    FieldDef("id", ("exception ref", "exception reference", "exception id", "id", "ref")),
    FieldDef("description", ("description of exception", "exception description", "exception", "description", "exception detail", "issue", "narrative")),
    FieldDef("division", ("requesting department", "division", "department", "business unit", "unit", "area")),
    FieldDef("raisedDate", ("approval date", "raised date", "date raised", "date", "opened date", "logged date", "created date", "reported date")),
    FieldDef("severity", ("severity", "risk level", "risk rating", "rating", "severity level")),
    FieldDef("daysOpen", ("days open", "days", "open days", "days outstanding", "age (days)", "days since raised", "days overdue", "age days")),
    FieldDef("status", ("status", "current status", "exception status", "approval status")),
    FieldDef("expiryDate", ("expiry date", "expiration date", "valid until", "expires")),
    FieldDef("owner", ("approved by", "owner", "approver", "action owner", "assigned to")),
)

_MIS_FIELDS = (
    FieldDef("id", ("kri id", "metric id", "indicator id", "id", "ref")),
    FieldDef("indicator", ("indicator", "kri", "kpi", "metric", "metric name", "key risk indicator", "measure", "risk indicator", "event category", "loss category", "basel event category", "category")),
    FieldDef("period", ("period", "month", "reporting period", "month/year", "period end", "as of", "mth")),
    FieldDef("value", ("value", "current value", "count", "figure", "amount", "number", "score", "total", "incident count", "loss", "net loss", "gross loss")),
    FieldDef("unit", ("unit", "units", "uom", "%", "currency")),
)


def _cell(row: list[str | None], mapping: dict[str, int], field: str) -> str | None:
    index = mapping.get(field)
    if index is None or index >= len(row):
        return None
    return row[index]


def _row_number(table: ExtractedTable, row_index: int) -> int:
    return row_index + 2 if table.headers else row_index + 1


def _table_occurrences(tables: list[ExtractedTable]) -> list[int]:
    counts: Counter[str] = Counter()
    occurrences: list[int] = []
    for table in tables:
        counts[table.name] += 1
        occurrences.append(counts[table.name])
    return occurrences


def _label(record: DocumentRecord) -> str:
    return f"[{record.filename}]"


def _item_id(
    row: list[str | None], mapping: dict[str, int], record: DocumentRecord, table_index: int, row_index: int
) -> str:
    value = _cell(row, mapping, "id")
    if value:
        return value
    return f"{record.id}-t{table_index}-r{row_index + 1}"


def _derive_unit(value_header: str | None, value: str | None) -> str:
    text = f"{value_header or ''} {value or ''}"
    if "$" in text:
        return "$"
    if "%" in text:
        return "%"
    return ""


def interpret_risk_register(record: DocumentRecord) -> tuple[list[RiskItem], list[str]]:
    items: list[RiskItem] = []
    warnings: list[str] = []
    label = _label(record)
    occurrences = _table_occurrences(record.tables)

    for table_index, table in enumerate(record.tables):
        if not table.headers:
            warnings.append(f"{label} table '{table.name}' has no headers; skipped")
            continue
        mapping, header_warnings = match_headers(table.headers, _RISK_FIELDS)
        warnings.extend(f"{label} {warning}" for warning in header_warnings)

        for row_index, row in enumerate(table.rows):
            if not any(row):
                continue
            row_ref = _row_number(table, row_index)
            description = _cell(row, mapping, "description")
            if not description:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: missing risk description; row skipped"
                )
                continue

            severity = (
                normalize_severity(_cell(row, mapping, "severity"))
                or normalize_severity(_cell(row, mapping, "residual"))
                or normalize_severity(_cell(row, mapping, "inherent"))
            )
            if severity is None:
                severity = combine_severity(
                    normalize_number(_cell(row, mapping, "likelihood")),
                    normalize_number(_cell(row, mapping, "impact")),
                )
            if severity is None:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: cannot determine severity; row skipped"
                )
                continue

            items.append(
                RiskItem(
                    id=_item_id(row, mapping, record, table_index, row_index),
                    description=description,
                    category=_cell(row, mapping, "category") or "",
                    division=_cell(row, mapping, "division") or "",
                    likelihood=_cell(row, mapping, "likelihood") or "",
                    impact=_cell(row, mapping, "impact") or "",
                    severity=severity,
                    status=normalize_status(_cell(row, mapping, "status")),
                    owner=_cell(row, mapping, "owner") or "",
                    mitigation=_cell(row, mapping, "mitigation") or "",
                    source=make_source(
                        record, table.name, occurrences[table_index], row_ref, row
                    ),
                )
            )
    return items, warnings


def interpret_audit_findings(
    record: DocumentRecord,
) -> tuple[list[AuditFinding], list[str]]:
    items: list[AuditFinding] = []
    warnings: list[str] = []
    label = _label(record)
    occurrences = _table_occurrences(record.tables)

    for table_index, table in enumerate(record.tables):
        if not table.headers:
            warnings.append(f"{label} table '{table.name}' has no headers; skipped")
            continue
        mapping, header_warnings = match_headers(table.headers, _AUDIT_FIELDS)
        warnings.extend(f"{label} {warning}" for warning in header_warnings)

        for row_index, row in enumerate(table.rows):
            if not any(row):
                continue
            row_ref = _row_number(table, row_index)
            title = _cell(row, mapping, "title")
            if not title:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: missing finding title; row skipped"
                )
                continue

            rating = normalize_severity(_cell(row, mapping, "rating"))
            if rating is None:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: cannot determine rating; row skipped"
                )
                continue

            items.append(
                AuditFinding(
                    id=_item_id(row, mapping, record, table_index, row_index),
                    title=title,
                    division=_cell(row, mapping, "division") or "",
                    rating=rating,
                    status=normalize_status(_cell(row, mapping, "status")),
                    dueDate=normalize_date(_cell(row, mapping, "dueDate")) or "",
                    owner=_cell(row, mapping, "owner") or "",
                    source=make_source(
                        record, table.name, occurrences[table_index], row_ref, row
                    ),
                )
            )
    return items, warnings


def interpret_exceptions(
    record: DocumentRecord,
) -> tuple[list[ExceptionItem], list[str]]:
    items: list[ExceptionItem] = []
    warnings: list[str] = []
    label = _label(record)
    occurrences = _table_occurrences(record.tables)

    for table_index, table in enumerate(record.tables):
        if not table.headers:
            warnings.append(f"{label} table '{table.name}' has no headers; skipped")
            continue
        mapping, header_warnings = match_headers(table.headers, _EXCEPTION_FIELDS)
        warnings.extend(f"{label} {warning}" for warning in header_warnings)

        for row_index, row in enumerate(table.rows):
            if not any(row):
                continue
            row_ref = _row_number(table, row_index)
            description = _cell(row, mapping, "description")
            if not description:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: missing exception description; row skipped"
                )
                continue

            severity = normalize_severity(_cell(row, mapping, "severity"))
            days_open = normalize_number(_cell(row, mapping, "daysOpen"))
            derived = None
            if severity is None and days_open is not None:
                derived = (
                    "High"
                    if days_open >= 30
                    else "Medium"
                    if days_open >= 15
                    else "Low"
                )
                warnings.append(
                    f"{label} {table.name} row {row_ref}: severity derived from {int(days_open)} days open"
                )
            if severity is None and derived is None:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: cannot determine severity; row skipped"
                )
                continue

            items.append(
                ExceptionItem(
                    id=_item_id(row, mapping, record, table_index, row_index),
                    description=description,
                    division=_cell(row, mapping, "division") or "",
                    raisedDate=normalize_date(_cell(row, mapping, "raisedDate")) or "",
                    severity=severity or derived,
                    status=normalize_status(_cell(row, mapping, "status")),
                    daysOpen=int(days_open) if days_open is not None else 0,
                    owner=_cell(row, mapping, "owner") or "",
                    source=make_source(
                        record, table.name, occurrences[table_index], row_ref, row
                    ),
                )
            )
    return items, warnings


def interpret_mis(record: DocumentRecord) -> tuple[list[MISRow], list[str]]:
    items: list[MISRow] = []
    warnings: list[str] = []
    label = _label(record)
    occurrences = _table_occurrences(record.tables)

    for table_index, table in enumerate(record.tables):
        if not table.headers:
            warnings.append(f"{label} table '{table.name}' has no headers; skipped")
            continue
        mapping, header_warnings = match_headers(table.headers, _MIS_FIELDS)
        warnings.extend(f"{label} {warning}" for warning in header_warnings)
        value_header = (
            table.headers[mapping["value"]] if "value" in mapping else None
        )

        for row_index, row in enumerate(table.rows):
            if not any(row):
                continue
            row_ref = _row_number(table, row_index)
            indicator = _cell(row, mapping, "indicator")
            if not indicator:
                warnings.append(
                    f"{label} {table.name} row {row_ref}: missing indicator name; row skipped"
                )
                continue

            value = _cell(row, mapping, "value") or ""
            unit = _cell(row, mapping, "unit") or _derive_unit(value_header, value)
            items.append(
                MISRow(
                    id=_item_id(row, mapping, record, table_index, row_index),
                    indicator=indicator,
                    period=_cell(row, mapping, "period") or "",
                    value=value,
                    unit=unit,
                    source=make_source(
                        record, table.name, occurrences[table_index], row_ref, row
                    ),
                )
            )
    return items, warnings


_INTERPRETERS = {
    "risk-register": interpret_risk_register,
    "audit-findings": interpret_audit_findings,
    "exception-log": interpret_exceptions,
    "mis": interpret_mis,
}

_BUCKETS = {
    "risk-register": "riskRegister",
    "audit-findings": "auditFindings",
    "exception-log": "exceptions",
    "mis": "misRows",
}


def interpret_documents(document_ids: list[str]) -> InterpretedDocuments:
    buckets: dict[str, list] = {
        "riskRegister": [],
        "auditFindings": [],
        "exceptions": [],
        "misRows": [],
    }
    warnings: list[str] = []
    coverage: list[DocumentInterpretation] = []

    for document_id in document_ids:
        raw = storage.read_parsed(document_id)
        if raw is None:
            warnings.append(f"Document '{document_id}' not found in store")
            coverage.append(
                DocumentInterpretation(
                    id=document_id,
                    filename=document_id,
                    status="skipped",
                    available=False,
                    reason="not found in store",
                )
            )
            continue
        record = DocumentRecord.model_validate(raw)
        if record.status != "ready":
            warnings.append(f"[{record.filename}] skipped: status is '{record.status}'")
            coverage.append(
                DocumentInterpretation(
                    id=document_id,
                    filename=record.filename,
                    category=record.category,
                    status="skipped",
                    available=False,
                    reason=f"status is '{record.status}'",
                )
            )
            continue
        interpreter = _INTERPRETERS.get(record.category)
        if interpreter is None:
            warnings.append(
                f"[{record.filename}] unsupported category '{record.category}'"
            )
            coverage.append(
                DocumentInterpretation(
                    id=document_id,
                    filename=record.filename,
                    category=record.category,
                    status="skipped",
                    available=True,
                    reason=f"unsupported category '{record.category}'",
                )
            )
            continue
        items, doc_warnings = interpreter(record)
        buckets[_BUCKETS[record.category]].extend(items)
        warnings.extend(doc_warnings)
        coverage.append(
            DocumentInterpretation(
                id=document_id,
                filename=record.filename,
                category=record.category,
                status="interpreted",
                available=True,
                evidenceCount=len(items),
                rowsProcessed=sum(len(table.rows) for table in record.tables),
            )
        )

    return InterpretedDocuments(
        documentIds=document_ids,
        riskRegister=buckets["riskRegister"],
        auditFindings=buckets["auditFindings"],
        exceptions=buckets["exceptions"],
        misRows=buckets["misRows"],
        coverage=coverage,
        warnings=warnings,
    )
