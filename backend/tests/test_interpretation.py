from __future__ import annotations

import pytest

from app.analysis.models.interpreted import InterpretedDocuments
from app.analysis.pipeline.headers import FieldDef, match_headers, score_header
from app.analysis.pipeline.interpretation import (
    interpret_audit_findings,
    interpret_documents,
    interpret_exceptions,
    interpret_mis,
    interpret_risk_register,
)
from app.analysis.pipeline.normalization import (
    combine_severity,
    normalize_date,
    normalize_number,
    normalize_severity,
    normalize_status,
)
from app.models.documents import DocumentRecord, ExtractedTable


def table(name: str, headers: list[str] | None, rows: list[list[str | None]]) -> ExtractedTable:
    return ExtractedTable(name=name, headers=headers, rows=rows)


def record(
    category: str,
    tables: list[ExtractedTable],
    filename: str = "doc.xlsx",
    document_id: str = "doc1",
    status: str = "ready",
) -> DocumentRecord:
    return DocumentRecord(
        id=document_id,
        filename=filename,
        fileType="xlsx",
        category=category,
        uploadedAt="2026-08-11T00:00:00+00:00",
        uploadedBy="Sarah Chen",
        sizeBytes=100,
        sha256="abc",
        status=status,
        tables=tables,
    )


class TestNormalization:
    def test_severity_variants(self):
        assert normalize_severity("Critical") == "Critical"
        assert normalize_severity("Crit") == "Critical"
        assert normalize_severity("High (4)") == "High"
        assert normalize_severity("3") == "Medium"
        assert normalize_severity("1 - Low") == "Low"
        assert normalize_severity("Very High") == "High"
        assert normalize_severity("Moderate") == "Medium"
        assert normalize_severity("Catastrophic") == "Critical"
        assert normalize_severity("H") == "High"
        assert normalize_severity(None) is None
        assert normalize_severity("unclear") is None

    def test_combine_severity(self):
        assert combine_severity(4, 5) == "Critical"
        assert combine_severity(3, 5) == "High"
        assert combine_severity(2, 2) == "Low"
        assert combine_severity(None, 4) == "High"
        assert combine_severity(None, None) is None

    def test_status_variants(self):
        assert normalize_status("In Progress") == "In Progress"
        assert normalize_status("in-progress") == "In Progress"
        assert normalize_status("Overdue") == "Overdue"
        assert normalize_status("Completed") == "Closed"
        assert normalize_status("Not started") == "Not Started"
        assert normalize_status("Active") == "Active"
        assert normalize_status("Expired") == "Expired"
        assert normalize_status("Open") == "Open"
        assert normalize_status(None) == ""
        assert normalize_status("Some unknown state") == "Some unknown state"

    def test_date_variants(self):
        assert normalize_date("2026-02-28T00:00:00") == "2026-02-28"
        assert normalize_date("2026-02-28") == "2026-02-28"
        assert normalize_date("28/02/2026") == "2026-02-28"
        assert normalize_date("28-02-2026") == "2026-02-28"
        assert normalize_date("Feb 28, 2026") == "2026-02-28"
        assert normalize_date("28 February 2026") == "2026-02-28"
        assert normalize_date("45292") == "2024-01-01"
        assert normalize_date(None) is None
        assert normalize_date("n/a") is None

    def test_number_variants(self):
        assert normalize_number("4") == 4.0
        assert normalize_number("$620k") == 620000.0
        assert normalize_number("1,234.5") == 1234.5
        assert normalize_number("> 99.9%") == 99.9
        assert normalize_number("(5)") == -5.0
        assert normalize_number("0.992") == 0.992
        assert normalize_number(None) is None
        assert normalize_number("n/a") is None


class TestHeaderMatching:
    def test_score_prefers_exact(self):
        assert score_header("Risk Description", "risk description") == 3.0
        assert score_header("Risk Description", "description") == 2.0
        assert score_header("Business Unit", "unit") == 2.0

    def test_ambiguous_columns_warn(self):
        fields = (FieldDef("a", ("shared",)), FieldDef("b", ("shared",)))
        mapping, warnings = match_headers(["shared"], fields)
        assert mapping == {"a": 0}
        assert any("Ambiguous" in warning for warning in warnings)

    def test_token_overlap_ties_do_not_warn(self):
        fields = (
            FieldDef("id", ("finding id", "audit finding id")),
            FieldDef("title", ("finding", "finding title", "audit finding")),
        )
        mapping, warnings = match_headers(["Finding ID", "Finding", "Audit Source"], fields)
        assert mapping.get("id") == 0
        assert mapping.get("title") == 1
        assert 2 not in mapping.values()
        assert not any("Ambiguous" in warning for warning in warnings)

    def test_header_never_assigned_to_two_fields(self):
        fields = (
            FieldDef("description", ("description", "risk description")),
            FieldDef("category", ("category", "risk category")),
        )
        mapping, _ = match_headers(["Risk Category", "Risk Description"], fields)
        assert mapping["description"] == 1
        assert mapping["category"] == 0


class TestRiskRegister:
    HEADERS = [
        "Risk ID", "Risk Category", "Risk Description",
        "Inherent Likelihood (1-5)", "Inherent Impact (1-5)", "Inherent Risk Score",
        "Key Controls", "Control Effectiveness", "Residual Risk Level",
        "Risk Owner", "Action Plan Status",
    ]

    def test_normal_risk_register(self):
        doc = record("risk-register", [
            table("Sheet1", self.HEADERS, [
                ["RISK-2026-001", "Cybersecurity / Tech",
                 "Unauthorized access to core banking credentials via phishing attack",
                 "4", "5", "20", "MFA, PAM tool", "Effective", "Medium",
                 "CISO / IT Sec", "In Progress"],
                ["RISK-2026-002", "Third-Party / Vendor",
                 "Outage at primary cloud hosting provider",
                 "3", "5", "15", "DR site replication", "Needs Improvement", "High",
                 "Head of Cloud Ops", "Open"],
            ]),
        ])
        items, warnings = interpret_risk_register(doc)
        assert warnings == []
        assert len(items) == 2
        first = items[0]
        assert first.id == "RISK-2026-001"
        assert first.severity == "Medium"
        assert first.status == "In Progress"
        assert first.owner == "CISO / IT Sec"
        assert first.mitigation == "MFA, PAM tool"
        assert first.category == "Cybersecurity / Tech"
        assert first.likelihood == "4"
        assert first.impact == "5"
        assert first.source.sourceRef == "Sheet1 · row 2"
        assert first.source.snippet is not None
        assert "RISK-2026-001" in first.source.snippet
        assert items[1].severity == "High"
        assert items[1].status == "Open"

    def test_reordered_columns(self):
        headers = [
            "Residual Risk Level", "Risk Owner", "Risk ID",
            "Risk Description", "Action Plan Status",
            "Inherent Impact (1-5)", "Inherent Likelihood (1-5)", "Risk Category",
        ]
        doc = record("risk-register", [
            table("Sheet1", headers, [
                ["High", "IT Sec", "R1", "Legacy access risk", "Open",
                 "5", "4", "Cyber"],
            ]),
        ])
        items, _ = interpret_risk_register(doc)
        assert len(items) == 1
        assert items[0].severity == "High"
        assert items[0].owner == "IT Sec"
        assert items[0].category == "Cyber"
        assert items[0].likelihood == "4"
        assert items[0].impact == "5"

    def test_alternative_column_names(self):
        headers = [
            "ID", "Risk Event", "Risk Type", "Business Unit", "Probability", "Consequence",
            "Overall Risk Level", "Risk Owner", "Mitigating Controls", "Status",
        ]
        doc = record("risk-register", [
            table("Sheet1", headers, [
                ["R1", "Third party data breach", "Cyber", "Retail",
                 "4", "5", "Critical", "IT Sec", "MFA", "Open"],
            ]),
        ])
        items, _ = interpret_risk_register(doc)
        assert len(items) == 1
        item = items[0]
        assert item.description == "Third party data breach"
        assert item.category == "Cyber"
        assert item.severity == "Critical"
        assert item.division == "Retail"
        assert item.likelihood == "4"
        assert item.impact == "5"
        assert item.owner == "IT Sec"
        assert item.mitigation == "MFA"
        assert item.status == "Open"

    def test_missing_optional_columns(self):
        doc = record("risk-register", [
            table("Sheet1", ["Risk Description", "Residual Risk Level"], [
                ["Missing owner and mitigation", "High"],
            ]),
        ])
        items, _ = interpret_risk_register(doc)
        assert len(items) == 1
        assert items[0].owner == ""
        assert items[0].mitigation == ""
        assert items[0].status == ""

    def test_malformed_rows(self):
        doc = record("risk-register", [
            table("Sheet1", ["Risk ID", "Risk Description", "Residual Risk Level"], [
                ["R1", "Valid risk", "High"],
                ["R2", None, "Medium"],
                ["R3", "No severity", None],
                [None, None, None],
            ]),
        ])
        items, warnings = interpret_risk_register(doc)
        assert len(items) == 1
        assert items[0].id == "R1"
        assert any("missing risk description" in w for w in warnings)
        assert any("cannot determine severity" in w for w in warnings)

    def test_severity_derived_from_likelihood_impact(self):
        doc = record("risk-register", [
            table("Sheet1", ["Risk Description", "Inherent Likelihood (1-5)", "Inherent Impact (1-5)"], [
                ["High loss event", "4", "5"],
                ["Low impact event", "2", "2"],
            ]),
        ])
        items, _ = interpret_risk_register(doc)
        assert [item.severity for item in items] == ["Critical", "Low"]

    def test_headerless_table_skipped(self):
        doc = record("risk-register", [table("Sheet1", None, [["A", "High"]])])
        items, warnings = interpret_risk_register(doc)
        assert items == []
        assert any("no headers" in w for w in warnings)

    def test_synthesized_ids_and_table_occurrences(self):
        doc = record("risk-register", [
            table("Sheet1", ["Risk Description", "Residual Risk Level"], [["A", "High"]]),
            table("Sheet1", ["Risk Description", "Residual Risk Level"], [["B", "Low"]]),
        ])
        items, _ = interpret_risk_register(doc)
        assert len(items) == 2
        assert items[0].source.sourceRef == "Sheet1 · row 2"
        assert items[1].source.sourceRef == "Sheet1 (table 2) · row 2"
        assert items[0].id == "doc1-t0-r1"
        assert items[1].id == "doc1-t1-r1"


class TestAuditFindings:
    HEADERS = [
        "Finding ID", "Audit Project Reference", "Finding Heading", "Severity",
        "Identified Date", "Target Date", "Management Response / Agreed Action",
        "Owner", "Status",
    ]

    def test_normal_audit_findings(self):
        doc = record("audit-findings", [
            table("Sheet1", self.HEADERS, [
                ["AUD-2025-014", "GIA-2025-04 Wealth Mgt",
                 "Inadequate High-Net-Worth Client Sanctions Screening",
                 "High", "2025-10-15T00:00:00", "2026-02-28T00:00:00",
                 "Implement automated batch screening", "Compliance Lead", "Overdue"],
                ["AUD-2026-001", "GIA-2026-01 Treasury Ops",
                 "Delayed Interbank Swift Reconciliation Sign-offs",
                 "Medium", "2026-02-10T00:00:00", "2026-06-30T00:00:00",
                 "Enforce 24-hour SLA", "Treasury Ops Lead", "In Progress"],
            ]),
        ])
        items, warnings = interpret_audit_findings(doc)
        assert warnings == []
        assert len(items) == 2
        first = items[0]
        assert first.id == "AUD-2025-014"
        assert first.title.startswith("Inadequate")
        assert first.rating == "High"
        assert first.dueDate == "2026-02-28"
        assert first.status == "Overdue"
        assert first.owner == "Compliance Lead"
        assert first.source.sourceRef == "Sheet1 · row 2"
        assert items[1].rating == "Medium"
        assert items[1].status == "In Progress"

    def test_missing_rating_skips_row(self):
        doc = record("audit-findings", [
            table("Sheet1", ["Finding ID", "Finding Heading", "Severity"], [
                ["A1", "Good finding", "High"],
                ["A2", "No rating", None],
            ]),
        ])
        items, warnings = interpret_audit_findings(doc)
        assert len(items) == 1
        assert any("cannot determine rating" in w for w in warnings)


class TestExceptions:
    def test_normal_exception_log(self):
        headers = [
            "Exception Ref", "Requesting Department", "Description of Exception",
            "Approval Date", "Severity", "Days Open", "Current Status", "Owner",
        ]
        doc = record("exception-log", [
            table("Sheet1", headers, [
                ["EXC-001", "Corporate Banking", "Temporary limit exceedance",
                 "2026-01-15T00:00:00", "High", "35", "Active", "CRO"],
                ["EXC-002", "IT", "USB write access",
                 "2026-02-01T00:00:00", "Low", "10", "Expired", "CISO"],
            ]),
        ])
        items, warnings = interpret_exceptions(doc)
        assert warnings == []
        assert len(items) == 2
        assert items[0].severity == "High"
        assert items[0].daysOpen == 35
        assert items[0].raisedDate == "2026-01-15"
        assert items[0].status == "Active"
        assert items[1].severity == "Low"
        assert items[1].status == "Expired"

    def test_severity_derived_from_days_open(self):
        doc = record("exception-log", [
            table("Sheet1", ["Description of Exception", "Days Open"], [
                ["Long standing exception", "45"],
            ]),
        ])
        items, warnings = interpret_exceptions(doc)
        assert len(items) == 1
        assert items[0].severity == "High"
        assert items[0].daysOpen == 45
        assert any("severity derived from 45 days open" in w for w in warnings)

    def test_skipped_without_severity(self):
        doc = record("exception-log", [
            table("Sheet1", ["Description of Exception"], [
                ["No severity info"],
            ]),
        ])
        items, warnings = interpret_exceptions(doc)
        assert items == []
        assert any("cannot determine severity" in w for w in warnings)


class TestMIS:
    def test_kri_sheet(self):
        headers = ["KRI ID", "Metric Name", "Business Unit", "Current Value", "Status", "Trend"]
        doc = record("mis", [
            table("Key Risk Indicators", headers, [
                ["KRI-IT-01", "Core Banking Availability", "IT Ops", "0.992", "Red", "Degrading"],
            ]),
        ])
        items, warnings = interpret_mis(doc)
        assert warnings == []
        assert len(items) == 1
        assert items[0].indicator == "Core Banking Availability"
        assert items[0].value == "0.992"
        assert items[0].id == "KRI-IT-01"
        assert items[0].source.sourceRef == "Key Risk Indicators · row 2"

    def test_loss_sheet(self):
        headers = ["Basel Event Category", "Incident Count", "Gross Loss ($)", "Recoveries ($)", "Net Loss ($)"]
        doc = record("mis", [
            table("Basel Loss Summary", headers, [
                ["External Fraud", "85", "620000", "45000", "575000"],
            ]),
        ])
        items, _ = interpret_mis(doc)
        assert len(items) == 1
        assert items[0].indicator == "External Fraud"
        assert items[0].value == "85"
        assert items[0].unit == ""

    def test_unit_derived_from_value_column(self):
        doc = record("mis", [
            table("Basel Loss Summary", ["Basel Event Category", "Gross Loss ($)"], [
                ["Internal Fraud", "120000"],
            ]),
        ])
        items, _ = interpret_mis(doc)
        assert items[0].value == "120000"
        assert items[0].unit == "$"

    def test_missing_indicator_skips_row(self):
        doc = record("mis", [
            table("Sheet1", ["Some Column"], [["just data"]]),
        ])
        items, warnings = interpret_mis(doc)
        assert items == []
        assert any("missing indicator name" in w for w in warnings)


class TestDispatch:
    def test_mixed_documents_and_warnings(self, monkeypatch):
        risk = record(
            "risk-register",
            [table("Sheet1", ["Risk Description", "Residual Risk Level"], [["R1", "High"]])],
            filename="Risk Register.xlsx",
            document_id="doc-risk",
        )
        audit = record(
            "audit-findings",
            [table("Sheet1", ["Finding Heading", "Severity"], [["F1", "Critical"]])],
            filename="Audit Findings.xlsx",
            document_id="doc-audit",
        )
        failed = record(
            "risk-register",
            [table("Sheet1", ["Risk Description"], [["x"]])],
            filename="Broken.xlsx",
            document_id="doc-failed",
            status="failed",
        )
        policy = record(
            "policy",
            [table("Sheet1", ["Title"], [["Policy text"]])],
            filename="Policy.docx",
            document_id="doc-policy",
        )

        def fake_read(document_id):
            docs = {
                "doc-risk": risk,
                "doc-audit": audit,
                "doc-failed": failed,
                "doc-policy": policy,
            }
            model = docs.get(document_id)
            return model.model_dump(mode="json") if model else None

        monkeypatch.setattr("app.services.storage.read_parsed", fake_read)
        result = interpret_documents(["doc-risk", "doc-audit", "doc-failed", "doc-policy", "doc-missing"])
        assert isinstance(result, InterpretedDocuments)
        assert len(result.riskRegister) == 1
        assert len(result.auditFindings) == 1
        assert any("skipped: status is 'failed'" in w for w in result.warnings)
        assert any("unsupported category 'policy'" in w for w in result.warnings)
        assert any("not found in store" in w for w in result.warnings)

    def test_empty_document_list(self, monkeypatch):
        monkeypatch.setattr(
            "app.services.storage.read_parsed", lambda doc_id: None
        )
        result = interpret_documents([])
        assert result.riskRegister == []
        assert result.warnings == []
