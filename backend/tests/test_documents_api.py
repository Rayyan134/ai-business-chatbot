from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_invalid_type():
    response = client.post(
        "/api/documents",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 422


def test_upload_rejects_wrong_magic(tmp_path):
    response = client.post(
        "/api/documents",
        files={"file": ("report.pdf", b"this is not a pdf", "application/pdf")},
    )
    assert response.status_code == 422


def test_upload_and_retrieve(tmp_path):
    csv_content = "Risk Category,Count\nIT,3\n".encode("utf-8")
    created = client.post(
        "/api/documents",
        files={"file": ("Risk Register.csv", csv_content, "text/csv")},
    )
    assert created.status_code == 201
    record = created.json()
    assert record["category"] == "risk-register"
    assert record["fileType"] == "csv"
    assert record["status"] == "ready"
    assert record["text"]

    fetched = client.get(f"/api/documents/{record['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == record["id"]

    listed = client.get("/api/documents")
    assert listed.status_code == 200
    assert any(item["id"] == record["id"] for item in listed.json())


def test_upload_category_hint_override(tmp_path):
    created = client.post(
        "/api/documents",
        files={"file": ("weird_name.csv", b"a,b\n1,2\n", "text/csv")},
        data={"category": "exception-log"},
    )
    assert created.status_code == 201
    assert created.json()["category"] == "exception-log"


def test_get_missing_document():
    response = client.get("/api/documents/nonexistent")
    assert response.status_code == 404
