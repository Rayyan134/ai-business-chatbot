import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  ApiError,
  buildExportUrl,
  createAnalysisRun,
  fetchAnalysisResult,
  fetchAnalysisRun,
  fetchExportFile,
  filenameFromContentDisposition,
} from "../lib/api-client.ts";
import { sampleResult, sampleRun } from "./helpers/fixtures.ts";

function stubFetch(response: {
  ok?: boolean;
  status?: number;
  body?: unknown;
  detail?: string;
}) {
  const body = response.detail ?? response.body;
  const init = {
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => body,
  } as Response;
  globalThis.fetch = async () => init;
}

function stubFetchFailure() {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
}

test("createAnalysisRun posts documentIds and returns the run", async () => {
  let sentBody: unknown;
  stubFetch({ body: sampleRun });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    sentBody = JSON.parse(String(init?.body));
    return (await originalFetch(input, init)) as Response;
  };

  const run = await createAnalysisRun(["doc-a", "doc-b"]);
  assert.equal(run.id, "run-1");
  assert.deepEqual(sentBody, { documentIds: ["doc-a", "doc-b"] });
});

test("fetchAnalysisRun returns the run", async () => {
  stubFetch({ body: sampleRun });
  const run = await fetchAnalysisRun("run-1");
  assert.equal(run.id, "run-1");
});

test("fetchAnalysisResult returns the result", async () => {
  stubFetch({ body: sampleResult });
  const result = await fetchAnalysisResult("result-1");
  assert.equal(result.id, "result-1");
});

test("createAnalysisRun throws ApiError with detail on HTTP error", async () => {
  stubFetch({
    ok: false,
    status: 422,
    detail: "documentIds must be a non-empty list of document ids.",
  });
  await assert.rejects(
    () => createAnalysisRun([]),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal((error as ApiError).status, 422);
      return true;
    },
  );
});

test("fetchAnalysisRun throws ApiError on 404", async () => {
  stubFetch({ ok: false, status: 404, detail: "Analysis run not found." });
  await assert.rejects(
    () => fetchAnalysisRun("missing"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal((error as ApiError).status, 404);
      return true;
    },
  );
});

test("fetchAnalysisResult propagates network failure", async () => {
  stubFetchFailure();
  await assert.rejects(() => fetchAnalysisResult("result-1"), TypeError);
});

test("buildExportUrl includes result and run identifiers", () => {
  assert.equal(
    buildExportUrl("word", { resultId: "res-1", runId: "run-1" }),
    "http://localhost:8000/api/exports/report?result_id=res-1&run_id=run-1",
  );
  assert.equal(
    buildExportUrl("powerpoint", { resultId: "res-1" }),
    "http://localhost:8000/api/exports/presentation?result_id=res-1",
  );
  assert.equal(buildExportUrl("word", {}), "http://localhost:8000/api/exports/report");
});

test("filenameFromContentDisposition parses the filename", () => {
  assert.equal(
    filenameFromContentDisposition('attachment; filename="Report.docx"'),
    "Report.docx",
  );
  assert.equal(
    filenameFromContentDisposition(
      "attachment; filename*=utf-8''Meridian-Bank-Board-Presentation.pptx",
    ),
    "Meridian-Bank-Board-Presentation.pptx",
  );
  assert.equal(filenameFromContentDisposition(null), null);
});

function stubExportFetch(ok: boolean, filename?: string) {
  globalThis.fetch = async () => {
    const init = {
      ok,
      status: ok ? 200 : 404,
      blob: async () => new Blob(["PK"]),
      headers: {
        get: (name: string) =>
          name === "content-disposition" && filename
            ? `attachment; filename="${filename}"`
            : null,
      },
      json: async () => ({ detail: "Analysis result not found." }),
    } as unknown as Response;
    return init;
  };
}

test("fetchExportFile returns the blob and parsed filename", async () => {
  stubExportFetch(true, "Meridian-Bank-Operational-Risk-Report-2026-08-06.docx");
  const file = await fetchExportFile("word", { resultId: "res-1" });
  assert.equal(file.filename, "Meridian-Bank-Operational-Risk-Report-2026-08-06.docx");
  assert.equal(await file.blob.text(), "PK");
});

test("fetchExportFile falls back to a default filename", async () => {
  stubExportFetch(true);
  const file = await fetchExportFile("powerpoint", { resultId: "res-1" });
  assert.equal(file.filename, "Meridian-Bank-Board-Presentation.pptx");
});

test("fetchExportFile throws ApiError on HTTP error", async () => {
  stubExportFetch(false);
  await assert.rejects(
    () => fetchExportFile("word", { resultId: "missing" }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal((error as ApiError).status, 404);
      return true;
    },
  );
});
