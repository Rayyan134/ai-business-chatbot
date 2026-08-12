import { test } from "node:test";
import { strict as assert } from "node:assert";
import { analyzeDocuments, handleUpload } from "../lib/upload-service.ts";
import type { DocumentRecord } from "../lib/document-types.ts";
import { sampleRun } from "./helpers/fixtures.ts";

const sampleRecord: DocumentRecord = {
  id: "doc-a",
  filename: "Risk Register.xlsx",
  fileType: "xlsx",
  category: "risk-register",
  uploadedAt: "2026-08-06T08:00:00Z",
  uploadedBy: "tester",
  sizeBytes: 1024,
  sha256: "abc",
  status: "ready",
  error: null,
  text: "content",
  tables: [],
  metadata: {},
};

test("handleUpload returns the record on success", async () => {
  globalThis.fetch = async () =>
    ({ ok: true, status: 200, json: async () => sampleRecord }) as Response;
  const record = await handleUpload({ name: "Risk Register.xlsx" } as File);
  assert.equal(record?.id, "doc-a");
  assert.equal(record?.status, "ready");
});

test("handleUpload returns null when upload fails", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  const record = await handleUpload({ name: "Risk Register.xlsx" } as File);
  assert.equal(record, null);
});

test("analyzeDocuments starts a run and returns its id", async () => {
  globalThis.fetch = async () =>
    ({ ok: true, status: 200, json: async () => sampleRun }) as Response;
  const runId = await analyzeDocuments(["doc-a", "doc-b"]);
  assert.equal(runId, "run-1");
});

test("analyzeDocuments returns null for empty document list", async () => {
  const runId = await analyzeDocuments([]);
  assert.equal(runId, null);
});

test("analyzeDocuments returns null when backend is unavailable", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  const runId = await analyzeDocuments(["doc-a"]);
  assert.equal(runId, null);
});
