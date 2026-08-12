import pytest

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.fixture(autouse=True)
def _isolate_store(tmp_path, monkeypatch):
    from app.services import analysis_store

    monkeypatch.setattr(analysis_store, "RUNS_DIR", tmp_path / "runs")
    monkeypatch.setattr(analysis_store, "RESULTS_DIR", tmp_path / "results")


def test_create_run_rejects_empty_document_ids():
    response = client.post("/api/analysis", json={"documentIds": []})
    assert response.status_code == 422

    response = client.post("/api/analysis", json={})
    assert response.status_code == 422


def test_create_run_and_fetch_result():
    created = client.post("/api/analysis", json={"documentIds": ["doc1"]})
    assert created.status_code == 202
    run = created.json()
    assert run["status"] == "ready"
    assert run["resultId"]

    fetched = client.get(f"/api/analysis/runs/{run['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == run["id"]

    result = client.get(f"/api/analysis/results/{run['resultId']}")
    assert result.status_code == 200
    body = result.json()
    assert body["status"] == "ready"
    assert body["summary"]["paragraphs"]
    assert body["id"] == run["resultId"]


def test_get_missing_run_returns_404():
    response = client.get("/api/analysis/runs/missing")
    assert response.status_code == 404


def test_get_missing_result_returns_404():
    response = client.get("/api/analysis/results/missing")
    assert response.status_code == 404
