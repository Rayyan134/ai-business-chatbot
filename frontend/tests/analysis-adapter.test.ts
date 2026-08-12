import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  formatGeneratedAt,
  severityCounts,
  toAnalysisData,
  toReportFindings,
} from "../lib/analysis-adapter.ts";
import { partialResult, sampleResult } from "./helpers/fixtures.ts";

test("toAnalysisData maps a real result to the presentation shape", () => {
  const data = toAnalysisData(sampleResult);
  assert.equal(data.overallScore.score, 82);
  assert.equal(data.overallScore.level, "High");
  assert.equal(data.metrics.length, 2);
  assert.equal(data.recommendations.length, 1);
  assert.equal(data.keyFindings.length, 1);
  assert.equal(data.riskHeatmap.length, 1);
  assert.equal(data.riskTrend.length, 2);
  assert.equal(data.analysisSummary.paragraphs.length, 1);
});

test("toAnalysisData strips evidence and confidence from findings/recommendations", () => {
  const data = toAnalysisData(sampleResult);
  assert.ok(!("evidence" in data.keyFindings[0]));
  assert.ok(!("confidence" in data.keyFindings[0]));
  assert.ok(!("evidence" in data.recommendations[0]));
  assert.ok(!("confidence" in data.recommendations[0]));
});

test("toReportFindings maps findings to report shape", () => {
  const findings = toReportFindings(sampleResult);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, "Critical");
  assert.equal(findings[0].area, "Technology");
});

test("severityCounts tallies findings by severity, omitting empty buckets", () => {
  const counts = severityCounts(sampleResult);
  assert.equal(counts.find((c) => c.severity === "Critical")?.count, 1);
  assert.equal(counts.find((c) => c.severity === "High"), undefined);
});

test("formatGeneratedAt formats an ISO timestamp", () => {
  const formatted = formatGeneratedAt("2026-08-06T08:00:05Z");
  assert.match(formatted, /August 6, 2026/);
});

test("formatGeneratedAt falls back to raw value when unparseable", () => {
  assert.equal(formatGeneratedAt("not-a-date"), "not-a-date");
});

test("partial result keeps source warnings and reduces populated sections", () => {
  assert.equal(partialResult.status, "partial");
  assert.ok(partialResult.warnings.length > 0);
  const data = toAnalysisData(partialResult);
  assert.equal(data.metrics.length, 0);
  assert.equal(data.riskHeatmap.length, 0);
  assert.equal(data.riskTrend.length, 0);
});
