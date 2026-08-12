import type {
  AnalysisResult,
  AnalysisRun,
} from "@/lib/analysis-api-types";
import {
  createAnalysisRun,
  fetchAnalysisRun,
  fetchAnalysisResult,
} from "@/lib/api-client";

export type AnalysisSource =
  | { kind: "demo" }
  | { kind: "real"; result: AnalysisResult };

export interface SourceFetchers {
  getRun: (runId: string) => Promise<AnalysisRun>;
  getResult: (resultId: string) => Promise<AnalysisResult>;
}

export type RunPollOutcome =
  | "ready"
  | "partial"
  | "failed"
  | "timeout"
  | "unavailable";

export interface RunPollResult {
  run: AnalysisRun | null;
  outcome: RunPollOutcome;
}

export interface RunPollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  fetchRun?: (runId: string) => Promise<AnalysisRun>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startAnalysisRun(
  documentIds: string[],
  createRun: (ids: string[]) => Promise<AnalysisRun> = createAnalysisRun,
): Promise<string | null> {
  if (!documentIds.length) return null;
  try {
    const run = await createRun(documentIds);
    return run.id;
  } catch (error) {
    console.warn("Starting AI analysis run failed:", error);
    return null;
  }
}

export async function resolveAnalysisSource(
  params: { runId?: string | null; resultId?: string | null },
  fetchers: Partial<SourceFetchers> = {},
): Promise<AnalysisSource> {
  const getRun = fetchers.getRun ?? fetchAnalysisRun;
  const getResult = fetchers.getResult ?? fetchAnalysisResult;

  if (params.resultId) {
    try {
      return { kind: "real", result: await getResult(params.resultId) };
    } catch (error) {
      console.warn("Fetching analysis result failed:", error);
      return { kind: "demo" };
    }
  }

  if (params.runId) {
    try {
      const run = await getRun(params.runId);
      if (
        (run.status === "ready" || run.status === "partial") &&
        run.resultId
      ) {
        const result = await getResult(run.resultId);
        return { kind: "real", result };
      }
    } catch (error) {
      console.warn("Fetching analysis run failed:", error);
    }
  }

  return { kind: "demo" };
}

export async function pollAnalysisRun(
  runId: string,
  options: RunPollOptions = {},
): Promise<RunPollResult> {
  const intervalMs = options.intervalMs ?? 1500;
  const timeoutMs = options.timeoutMs ?? 60000;
  const fetchRun = options.fetchRun ?? fetchAnalysisRun;
  const deadline = Date.now() + timeoutMs;
  let consecutiveErrors = 0;

  while (Date.now() < deadline) {
    let run: AnalysisRun;
    try {
      run = await fetchRun(runId);
      consecutiveErrors = 0;
    } catch {
      consecutiveErrors += 1;
      if (consecutiveErrors >= 2) {
        return { run: null, outcome: "unavailable" };
      }
      await delay(intervalMs);
      continue;
    }

    if (run.status === "ready") return { run, outcome: "ready" };
    if (run.status === "partial") return { run, outcome: "partial" };
    if (run.status === "failed") return { run, outcome: "failed" };
    await delay(intervalMs);
  }

  return { run: null, outcome: "timeout" };
}
