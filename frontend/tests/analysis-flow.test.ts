import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  pollAnalysisRun,
  resolveAnalysisSource,
  startAnalysisRun,
} from "../lib/analysis-flow.ts";
import {
  sampleResult,
  sampleRun,
} from "./helpers/fixtures.ts";

test("startAnalysisRun returns null for empty document list", async () => {
  const result = await startAnalysisRun([], async () => {
    throw new Error("should not be called");
  });
  assert.equal(result, null);
});

test("startAnalysisRun returns run id on success", async () => {
  const runId = await startAnalysisRun(["doc-a"], async () => sampleRun);
  assert.equal(runId, "run-1");
});

test("startAnalysisRun returns null when createRun fails", async () => {
  const runId = await startAnalysisRun(["doc-a"], async () => {
    throw new Error("boom");
  });
  assert.equal(runId, null);
});

test("resolveAnalysisSource returns real result from resultId", async () => {
  const source = await resolveAnalysisSource(
    { resultId: "result-1" },
    { getResult: async () => sampleResult },
  );
  assert.equal(source.kind, "real");
  if (source.kind === "real") assert.equal(source.result.id, "result-1");
});

test("resolveAnalysisSource follows runId through to result when ready", async () => {
  const source = await resolveAnalysisSource(
    { runId: "run-1" },
    {
      getRun: async () => sampleRun,
      getResult: async (id) => ({ ...sampleResult, id }),
    },
  );
  assert.equal(source.kind, "real");
});

test("resolveAnalysisSource returns demo when run is still queued", async () => {
  const source = await resolveAnalysisSource(
    { runId: "run-1" },
    { getRun: async () => ({ ...sampleRun, status: "queued", resultId: null }) },
  );
  assert.equal(source.kind, "demo");
});

test("resolveAnalysisSource returns demo when run is failed", async () => {
  const source = await resolveAnalysisSource(
    { runId: "run-1" },
    { getRun: async () => ({ ...sampleRun, status: "failed", resultId: null }) },
  );
  assert.equal(source.kind, "demo");
});

test("resolveAnalysisSource returns demo when fetchers throw", async () => {
  const source = await resolveAnalysisSource(
    { runId: "run-1" },
    { getRun: async () => { throw new Error("backend down"); } },
  );
  assert.equal(source.kind, "demo");
});

test("resolveAnalysisSource returns demo when no identifiers given", async () => {
  const source = await resolveAnalysisSource({});
  assert.equal(source.kind, "demo");
});

test("pollAnalysisRun returns ready immediately", async () => {
  const result = await pollAnalysisRun("run-1", {
    intervalMs: 5,
    timeoutMs: 1000,
    fetchRun: async () => sampleRun,
  });
  assert.equal(result.outcome, "ready");
  assert.equal(result.run?.id, "run-1");
});

test("pollAnalysisRun returns partial outcome for partial status", async () => {
  const result = await pollAnalysisRun("run-partial", {
    intervalMs: 5,
    timeoutMs: 1000,
    fetchRun: async () => ({ ...sampleRun, status: "partial" }),
  });
  assert.equal(result.outcome, "partial");
});

test("pollAnalysisRun returns failed outcome", async () => {
  const result = await pollAnalysisRun("run-failed", {
    intervalMs: 5,
    timeoutMs: 1000,
    fetchRun: async () => ({ ...sampleRun, status: "failed" }),
  });
  assert.equal(result.outcome, "failed");
});

test("pollAnalysisRun returns unavailable after two consecutive errors", async () => {
  let calls = 0;
  const result = await pollAnalysisRun("run-1", {
    intervalMs: 5,
    timeoutMs: 1000,
    fetchRun: async () => {
      calls += 1;
      throw new Error("down");
    },
  });
  assert.equal(result.outcome, "unavailable");
  assert.equal(calls, 2);
});

test("pollAnalysisRun times out while run stays queued", async () => {
  const result = await pollAnalysisRun("run-1", {
    intervalMs: 5,
    timeoutMs: 30,
    fetchRun: async () => ({ ...sampleRun, status: "queued", resultId: null }),
  });
  assert.equal(result.outcome, "timeout");
  assert.equal(result.run, null);
});
