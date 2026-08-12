import pytest

from app.services.validation import (
    ALLOWED_EXTENSIONS,
    DocumentValidationError,
    detect_file_type,
)

_CSV = b"col1,col2\nvalue1,value2\n"


def _fake_xlsx() -> bytes:
    import io
    import zipfile

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("xl/workbook.xml", "<workbook/>")
        archive.writestr("xl/worksheets/sheet1.xml", "<worksheet/>")
    return buffer.getvalue()


def _fake_docx() -> bytes:
    import io
    import zipfile

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("word/document.xml", "<document/>")
    return buffer.getvalue()


def test_allowed_extensions_are_expected():
    assert set(ALLOWED_EXTENSIONS) == {
        ".pdf",
        ".docx",
        ".xlsx",
        ".xls",
        ".csv",
    }


@pytest.mark.parametrize(
    ("filename", "data", "expected"),
    [
        ("risk register.pdf", b"%PDF-1.7\n" + b"x" * 120, "pdf"),
        ("report.docx", _fake_docx(), "docx"),
        ("spreadsheet.xlsx", _fake_xlsx(), "xlsx"),
        ("audit.xls", b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1rest", "xls"),
        ("mis.csv", _CSV, "csv"),
    ],
)
def test_detect_valid_files(filename, data, expected):
    assert detect_file_type(filename, data) == expected


@pytest.mark.parametrize(
    ("filename", "data"),
    [
        ("notes.txt", b"plain text"),
        ("doc.pdf", b"not a pdf at all"),
        ("report.docx", _fake_xlsx()),
        ("spreadsheet.xlsx", _CSV),
        ("audit.xls", b"%PDF-1.7\ncontent"),
    ],
)
def test_detect_rejects_mismatches(filename, data):
    with pytest.raises(DocumentValidationError):
        detect_file_type(filename, data)


def test_rejects_empty_file():
    with pytest.raises(DocumentValidationError):
        detect_file_type("empty.csv", b"")


def test_rejects_oversized_file():
    data = b"a" * (20 * 1024 * 1024 + 1)
    with pytest.raises(DocumentValidationError):
        detect_file_type("large.csv", data)


def test_rejects_binary_csv():
    with pytest.raises(DocumentValidationError):
        detect_file_type("malicious.csv", b"\x00\x01\x02binary")
