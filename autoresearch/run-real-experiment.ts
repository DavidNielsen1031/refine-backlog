#!/usr/bin/env bun
/**
 * exp_008 - Real GitHub Issues autoresearch experiment
 * Variant: v2.0-real-github-issues
 * 194 specs, 4 concurrent workers
 *
 * Fix: Use x-license-key header (NOT x-api-key)
 *      Body: {"items": ["text string"]} (NOT objects)
 */

import { readFileSync, appendFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE = "/Users/clawdbot/.openclaw/workspace";
const INPUT_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/real-specs/github-issues.json");
const RESULTS_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/real-specs/exp_008-results.json");
const EXPERIMENTS_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/experiments.jsonl");
const API_URL = "https://speclint.ai/api/lint";
const CONCURRENCY = 4;
const EXP_ID = "exp_008";
const VARIANT = "v2.0-real-github-issues";

// Load API key from env file
const envContent = readFileSync(resolve(process.env.HOME!, ".config/env/speclint-internal.env"), "utf8");
const keyMatch = envContent.match(/SPECLINT_INTERNAL_KEY=([^\s\n]+)/);
if (!keyMatch) throw new Error("SPECLINT_INTERNAL_KEY not found in env file");
const API_KEY = keyMatch[1];
console.log(`🔑 API key loaded: ${API_KEY.slice(0, 16)}...`);

// Load specs
interface Spec {
  id: string;
  input: string;
  source: string;
  labels?: string[];
  has_body?: boolean;
}

const specs: Spec[] = JSON.parse(readFileSync(INPUT_FILE, "utf8"));
const sources = [...new Set(specs.map(s => s.source))];
console.log(`📋 Loaded ${specs.length} specs from sources: ${sources.join(", ")}`);

// Result types
interface LintResult {
  id: string;
  source: string;
  score: number;
  agent_ready: boolean;
  breakdown: Record<string, boolean>;
  failed: boolean;
  error?: string;
}

// Single lint call — CORRECT format: x-license-key header, {"items": ["text"]}
async function lintSpec(spec: Spec): Promise<LintResult> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-license-key": API_KEY,          // ← CRITICAL: x-license-key, NOT x-api-key
      },
      body: JSON.stringify({ items: [spec.input] }),  // ← CRITICAL: string item, NOT object
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { id: spec.id, source: spec.source, score: -1, agent_ready: false, breakdown: {}, failed: true, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json() as any;

    // Extract result — API returns array of results
    const item = Array.isArray(data) ? data[0] : (data.items?.[0] ?? data.results?.[0] ?? data);
    const score: number = item?.completeness_score ?? item?.score ?? -1;
    const breakdown: Record<string, boolean> = item?.breakdown ?? item?.dimensions ?? {};
    const agentReady = score >= 70;

    return { id: spec.id, source: spec.source, score, agent_ready: agentReady, breakdown, failed: false };
  } catch (err: any) {
    return { id: spec.id, source: spec.source, score: -1, agent_ready: false, breakdown: {}, failed: true, error: String(err) };
  }
}

// Promise pool — N concurrent workers
async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<LintResult>,
  onProgress: (done: number, total: number, result: LintResult) => void,
): Promise<LintResult[]> {
  const results: LintResult[] = [];
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const result = await fn(items[i], i);
      results.push(result);
      onProgress(results.length, items.length, result);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// --- Run ---
console.log(`\n🚀 Starting exp_008 — ${specs.length} specs @ ${CONCURRENCY} concurrent workers`);
console.log(`   Est. time: ~${Math.ceil(specs.length / CONCURRENCY * 6 / 60)} minutes\n`);

const startTime = Date.now();

const allResults = await runWithConcurrency(
  specs,
  CONCURRENCY,
  (spec) => lintSpec(spec),
  (done, total, result) => {
    const pct = ((done / total) * 100).toFixed(0);
    const status = result.failed ? "❌ FAIL" : `✅ ${result.score}`;
    process.stdout.write(`\r  [${done}/${total}] ${pct}% — ${result.id}: ${status}      `);
  },
);

const elapsed = Date.now() - startTime;
console.log(`\n\n⏱  Completed in ${(elapsed / 1000).toFixed(1)}s`);

// --- Aggregate metrics ---
const successful = allResults.filter(r => !r.failed);
const failed = allResults.filter(r => r.failed);

// Average score (only successful)
const avgScore = successful.length > 0
  ? Math.round(successful.reduce((sum, r) => sum + r.score, 0) / successful.length)
  : 0;

// Agent-ready rate (score >= 70, only successful)
const agentReadyCount = successful.filter(r => r.agent_ready).length;
const agentReadyRate = successful.length > 0 ? agentReadyCount / successful.length : 0;

// Per-dimension pass rates
const allDimensions = new Set<string>();
successful.forEach(r => Object.keys(r.breakdown).forEach(d => allDimensions.add(d)));

const dimensionPassRates: Record<string, number> = {};
allDimensions.forEach(dim => {
  const passing = successful.filter(r => r.breakdown[dim] === true).length;
  dimensionPassRates[dim] = successful.length > 0 ? passing / successful.length : 0;
});

// Per-source breakdown
const sourceStats: Record<string, { count: number; total_score: number; agent_ready: number }> = {};
successful.forEach(r => {
  if (!sourceStats[r.source]) sourceStats[r.source] = { count: 0, total_score: 0, agent_ready: 0 };
  sourceStats[r.source].count++;
  sourceStats[r.source].total_score += r.score;
  if (r.agent_ready) sourceStats[r.source].agent_ready++;
});

const sourceBreakdown: Record<string, { avg_score: number; count: number; agent_ready_pct: number }> = {};
Object.entries(sourceStats).forEach(([src, stats]) => {
  sourceBreakdown[src] = {
    avg_score: Math.round(stats.total_score / stats.count),
    count: stats.count,
    agent_ready_pct: stats.count > 0 ? stats.agent_ready / stats.count : 0,
  };
});

// Score distribution (successful only)
const scoreDistribution = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
successful.forEach(r => {
  if (r.score <= 20) scoreDistribution["0-20"]++;
  else if (r.score <= 40) scoreDistribution["21-40"]++;
  else if (r.score <= 60) scoreDistribution["41-60"]++;
  else if (r.score <= 80) scoreDistribution["61-80"]++;
  else scoreDistribution["81-100"]++;
});

const summary = {
  avg_score: avgScore,
  agent_ready_pct: agentReadyRate,
  agent_ready_count: agentReadyCount,
  by_dimension: dimensionPassRates,
  by_source: sourceBreakdown,
  score_distribution: scoreDistribution,
};

// --- Print Summary ---
console.log(`\n${"═".repeat(60)}`);
console.log(`  exp_008 RESULTS — Real GitHub Issues`);
console.log(`${"═".repeat(60)}`);
console.log(`  Total specs:     ${specs.length}`);
console.log(`  Successful:      ${successful.length}`);
console.log(`  Failed:          ${failed.length}`);
console.log(`  Avg score:       ${avgScore}/100`);
console.log(`  Agent-ready:     ${agentReadyCount}/${successful.length} (${(agentReadyRate * 100).toFixed(1)}%)`);
console.log(`\n  Score distribution (successful):`);
Object.entries(scoreDistribution).forEach(([range, count]) => {
  const bar = "█".repeat(Math.round(count / successful.length * 30));
  console.log(`    ${range.padEnd(8)} ${String(count).padStart(3)} ${bar}`);
});
console.log(`\n  By source:`);
Object.entries(sourceBreakdown).forEach(([src, stats]) => {
  console.log(`    ${src.padEnd(10)} avg=${stats.avg_score} count=${stats.count} agent_ready=${(stats.agent_ready_pct * 100).toFixed(0)}%`);
});
console.log(`\n  Dimension pass rates (successful specs):`);
Object.entries(dimensionPassRates)
  .filter(([dim]) => !dim.includes("review_gate") && !dim.includes("definition_of_done"))
  .sort((a, b) => a[1] - b[1])
  .forEach(([dim, rate]) => {
    const pct = (rate * 100).toFixed(1);
    const bar = "█".repeat(Math.round(rate * 20));
    console.log(`    ${dim.padEnd(35)} ${pct.padStart(6)}%  ${bar}`);
  });

if (failed.length > 0) {
  console.log(`\n  Failed specs (${failed.length}):`);
  failed.slice(0, 5).forEach(r => {
    console.log(`    ${r.id}: ${r.error?.slice(0, 80) ?? "unknown error"}`);
  });
  if (failed.length > 5) console.log(`    ... and ${failed.length - 5} more`);
}
console.log(`${"═".repeat(60)}\n`);

// --- Save detailed results ---
const detailedResults = {
  experiment_id: EXP_ID,
  timestamp: new Date().toISOString(),
  variant: VARIANT,
  summary,
  results: allResults,
};
writeFileSync(RESULTS_FILE, JSON.stringify(detailedResults, null, 2));
console.log(`💾 Detailed results saved to: ${RESULTS_FILE}`);

// --- Append to experiments.jsonl ---
const expRecord = {
  id: EXP_ID,
  timestamp: new Date().toISOString(),
  variant: VARIANT,
  hypothesis: "Real GitHub issues will score lower than synthetic specs (exp_001-007 avg=99). Testing whether Speclint generalizes to real-world issue quality.",
  data_source: "github-issues.json",
  spec_count: successful.length,
  failed_count: failed.length,
  elapsed_ms: elapsed,
  metrics: {
    avg_score: avgScore,
    agent_ready_pct: agentReadyRate,
    agent_ready_count: agentReadyCount,
    by_dimension: dimensionPassRates,
    by_source: sourceBreakdown,
    score_distribution: scoreDistribution,
  },
  spec_results: allResults,
  result: agentReadyRate >= 0.95 ? "PASS" : agentReadyRate >= 0.7 ? "PARTIAL" : "FAIL",
  reasoning: `Real GitHub issues avg=${avgScore}, agent_ready=${(agentReadyRate * 100).toFixed(1)}%. vs synthetic avg=99 in exp_001-007. Delta: ${99 - avgScore} pts.`,
};

appendFileSync(EXPERIMENTS_FILE, JSON.stringify(expRecord) + "\n");
console.log(`📊 Experiment appended to: ${EXPERIMENTS_FILE}`);
console.log(`\n✅ exp_008 complete!`);
