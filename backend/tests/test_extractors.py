from pathlib import Path

import pytest

from app.services.extract import extract

SAMPLE_DIR = Path(__file__).resolve().parent.parent.parent / "sample-data"


def test_extract_xlsx_sample():
    path = SAMPLE_DIR / "Risk Register.xlsx"
    if not path.exists():
        pytest.skip("sample data not present")
    result = extract(str(path), "xlsx")
    assert result["text"]
    assert result["tables"]
    assert result["metadata"]["sheetCount"] >= 1
    assert result["metadata"]["rowCount"] >= 1
    assert result["tables"][0]["rows"]


@pytest.mark.parametrize("name", ["Audit Findings", "Exception Log", "MIS"])
def test_extract_all_xlsx_samples(name):
    path = SAMPLE_DIR / f"{name}.xlsx"
    if not path.exists():
        pytest.skip("sample data not present")
    result = extract(str(path), "xlsx")
    assert result["text"]
    assert result["tables"]
    assert result["tables"][0]["rows"]


def test_extract_policy_docx_sample():
    path = SAMPLE_DIR / "Operational Risk Policy.docx"
    if not path.exists():
        pytest.skip("sample data not present")
    result = extract(str(path), "docx")
    assert result["text"]
    assert "Operational Risk" in result["text"]


def test_extract_csv(tmp_path):
    path = tmp_path / "mis.csv"
    path.write_text("Risk Category,Count\nIT,3\nPeople,1\n", encoding="utf-8")
    result = extract(str(path), "csv")
    assert result["tables"][0]["headers"] == ["Risk Category", "Count"]
    assert len(result["tables"][0]["rows"]) == 2
    assert result["metadata"]["encoding"]
