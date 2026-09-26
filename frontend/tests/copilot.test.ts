import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  ApiError,
  sendCopilotMessage,
} from "../lib/api-client.ts";
import {
  analysisPeriod,
  buildCopilotContext,
  buildRealWelcomeMessage,
  resolveReply,
  toCopilotMessage,
  welcomeMessage,
} from "../lib/copilot-data.ts";
import type { CopilotRequest, CopilotResponse } from "../components/copilot/copilot-types.ts";
import type { AnalysisResult } from "../lib/analysis-api-types.ts";
import { sampleResult } from "./helpers/fixtures.ts";

const sampleResponse: CopilotResponse = {
  answer: "The highest operational risk is card fraud exposure.",
  confidence: 88,
  sources: [
    { label: "Risk Register.xlsx", documentId: "doc-1", documentType: "xlsx", sourceRef: "Sheet1!B4" },
  ],
  warnings: [],
  grounded: true,
};

function stubFetch(response: { ok?: boolean; status?: number; body?: unknown; detail?: string }) {
  const body = response.detail ?? response.body;
  const init = {
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => body,
  } as Response;
  globalThis.fetch = async () => init;
}

test("buildCopilotContext builds a request payload", () => {
  const payload = buildCopilotContext("run-1", "res-1", "What are the risks?");
  assert.deepEqual(payload, {
    runId: "run-1",
    resultId: "res-1",
    message: "What are the risks?",
  });
});

test("buildCopilotContext coerces missing ids to null", () => {
  const payload = buildCopilotContext(undefined, null, "hi");
  assert.equal(payload.runId, null);
  assert.equal(payload.resultId, null);
});

test("toCopilotMessage maps sources to labels", () => {
  const message = toCopilotMessage(sampleResponse, "msg-9", "9:30 AM");
  assert.equal(message.role, "assistant");
  assert.equal(message.content, sampleResponse.answer);
  assert.equal(message.confidence, 88);
  assert.equal(message.sources?.[0], "Risk Register.xlsx");
  assert.equal(message.grounded, true);
});

test("sendCopilotMessage posts to the chat endpoint", async () => {
  let sentUrl: string | undefined;
  let sentBody: CopilotRequest | undefined;
  stubFetch({ body: sampleResponse });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    sentUrl = String(input);
    sentBody = JSON.parse(String(init?.body)) as CopilotRequest;
    return (await originalFetch(input, init)) as Response;
  };

  const response = await sendCopilotMessage(
    buildCopilotContext("run-1", "res-1", "What are the risks?"),
  );
  assert.equal(response.answer, sampleResponse.answer);
  assert.match(sentUrl ?? "", /\/api\/copilot\/chat$/);
  assert.equal(sentBody?.message, "What are the risks?");
  assert.equal(sentBody?.runId, "run-1");
});

test("sendCopilotMessage throws ApiError on HTTP error", async () => {
  stubFetch({ ok: false, status: 422, detail: "Either runId or resultId is required for a real analysis answer." });
  await assert.rejects(
    () => sendCopilotMessage({ runId: null, resultId: null, message: "hi" }),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal((error as ApiError).status, 422);
      return true;
    },
  );
});

test("demo resolveReply is preserved for the no-context fallback", () => {
  const reply = resolveReply("What are the highest risks?");
  assert.ok(reply.content.length > 0);
  assert.ok((reply.sources.length ?? 0) > 0);
});

/* ---------------------------------------------------------------------------
 * Welcome message: real-run data vs. preserved demo copy
 * ------------------------------------------------------------------------- */

const DEMO_WELCOME_TEXT =
  "Hi Sarah, I'm Risk Copilot. I've analyzed your 73 operational risk documents from the July cycle. Ask me about your highest risks, audit findings, department exposure or recommended actions.";

test("demo mode still uses the existing demo welcome message verbatim", () => {
  assert.equal(welcomeMessage.content, DEMO_WELCOME_TEXT);
  assert.equal(welcomeMessage.confidence, 100);
  assert.deepEqual(welcomeMessage.sources, [
    "Risk Register",
    "Audit Findings",
    "Exception Log",
    "MIS Reports",
  ]);
});

test("real-run welcome uses the actual document count", () => {
  const result: AnalysisResult = {
    ...sampleResult,
    documents: [
      { id: "d1", filename: "Risk Register.xlsx", category: "risk-register", status: "ready", evidenceCount: 9 },
      { id: "d2", filename: "GIA Findings.pdf", category: "audit-findings", status: "ready", evidenceCount: 4 },
      { id: "d3", filename: "Exception Log.csv", category: "exception-log", status: "ready", evidenceCount: 2 },
    ],
  };

  const message = buildRealWelcomeMessage(result, new Date("2026-08-06T09:00:00Z"));

  assert.match(message.content, /your 3 operational risk documents/);
  assert.doesNotMatch(message.content, /73/);
});

test("real-run welcome uses singular wording for a single document", () => {
  // sampleResult ships exactly one document.
  const message = buildRealWelcomeMessage(sampleResult, new Date("2026-08-06T09:00:00Z"));
  assert.match(message.content, /your 1 operational risk document\b/);
  assert.doesNotMatch(message.content, /documents/);
});

test("real-run welcome derives the analysis period from the result", () => {
  const message = buildRealWelcomeMessage(sampleResult, new Date("2026-08-06T09:00:00Z"));
  assert.match(message.content, /from the August 2026 cycle/);
  assert.doesNotMatch(message.content, /July cycle/);
});

test("real-run welcome omits the period clause when no date is usable", () => {
  const result: AnalysisResult = {
    ...sampleResult,
    createdAt: "not-a-date",
    summary: { generatedAt: "", paragraphs: [], sources: [] },
  };
  const message = buildRealWelcomeMessage(result, new Date("2026-08-06T09:00:00Z"));
  assert.equal(analysisPeriod(result), null);
  assert.doesNotMatch(message.content, /cycle/);
  assert.match(message.content, /your 1 operational risk document\b/);
});

test("real-run welcome metadata is never hardcoded", () => {
  const result: AnalysisResult = {
    ...sampleResult,
    confidence: 61,
    documents: [
      { id: "d1", filename: "Board Pack.pdf", category: "mis", status: "ready", evidenceCount: 1 },
      { id: "d2", filename: "Policy Register.docx", category: "policy", status: "ready", evidenceCount: 3 },
    ],
  };
  const message = buildRealWelcomeMessage(result, new Date("2026-08-06T09:00:00Z"));

  // Confidence comes from the result, not a constant.
  assert.equal(message.confidence, 61);
  // Sources come from real filenames, not the demo list.
  assert.deepEqual(message.sources, ["Board Pack.pdf", "Policy Register.docx"]);
  assert.doesNotMatch(message.content, /73|Risk Register"|Exception Log/);
});

test("real-run welcome handles a run with no documents honestly", () => {
  const result: AnalysisResult = { ...sampleResult, documents: [] };
  const message = buildRealWelcomeMessage(result, new Date("2026-08-06T09:00:00Z"));

  assert.match(message.content, /no source documents attached yet/i);
  assert.doesNotMatch(message.content, /\b0 operational risk documents/);
  assert.deepEqual(message.sources, []);
});

test("analysisPeriod prefers summary.generatedAt and falls back to createdAt", () => {
  const fromSummary = analysisPeriod({
    ...sampleResult,
    createdAt: "2020-01-01T00:00:00Z",
    summary: { generatedAt: "2026-08-06T08:00:05Z", paragraphs: [], sources: [] },
  });
  assert.equal(fromSummary, "August 2026");

  const fromCreatedAt = analysisPeriod({
    ...sampleResult,
    createdAt: "2026-03-04T08:00:05Z",
    summary: { generatedAt: "", paragraphs: [], sources: [] },
  });
  assert.equal(fromCreatedAt, "March 2026");
});
