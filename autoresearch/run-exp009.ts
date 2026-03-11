#!/usr/bin/env bun
/**
 * exp_009 - Real GitHub Issues WITH garbage-in detector live
 * Variant: v2.1-with-garbage-detector
 * 194 specs, 4 concurrent workers
 *
 * Key new fields vs exp_008:
 *   - input_quality_score (from garbage detector)
 *   - warning (present if spec was capped at 60)
 *   - capped = true when score was capped by detector
 */

import { readFileSync, appendFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE = "/Users/clawdbot/.openclaw/workspace";
const INPUT_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/real-specs/github-issues.json");
const RESULTS_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/real-specs/exp_009-results.json");
const EXP008_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/real-specs/exp_008-results.json");
const EXPERIMENTS_FILE = resolve(WORKSPACE, "products/speclint/autoresearch/experiments.jsonl");
const API_URL = "https://speclint.ai/api/lint";
const CONCURRENCY = 4;
const EXP_ID = "exp_009";
const VARIANT = "v2.1-with-garbage-detector";

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

// Load exp_008 for comparison
const exp008 = JSON.parse(readFileSync(EXP008_FILE, "utf8"));
console.log(`📊 exp_008 baseline loaded: avg=${exp008.summary.avg_score}, agent_ready=${(exp008.summary.agent_ready_pct * 100).toFixed(1)}%`);

// Result types
interface LintResult {
  id: string;
  source: string;
  score: number;
  input_quality_score: number | null;
  warning: string | null;
  capped: boolean;
  agent_ready: boolean;
  breakdown: Record<string, boolean>;
  failed: boolean;
  error?: string;
}

// Single lint call
async function lintSpec(spec: Spec): Promise<LintResult> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-license-key": API_KEY,
      },
      body: JSON.stringify({ items: [spec.input] }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        id: spec.id, source: spec.source, score: -1,
        input_quality_score: null, warning: null, capped: false,
        agent_ready: false, breakdown: {}, failed: true,
        error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = await res.json() as any;

    // Extract result — API returns { items: [...], scores: [...], lint_id }
    const item = data.items?.[0] ?? data.scores?.[0] ?? (Array.isArray(data) ? data[0] : data);
    const score: number = item?.completeness_score ?? item?.score ?? -1;
    const input_quality_score: number | null = item?.input_quality_score ?? null;
    const warning: string | null = item?.warning ?? null;
    const breakdown: Record<string, boolean> = item?.breakdown ?? item?.dimensions ?? {};
    const capped = warning !== null; // capped if a warning was returned by garbage detector
    const agentReady = score >= 70;

    return {
      id: spec.id, source: spec.source, score,
      input_quality_score, warning, capped,
      agent_ready: agentReady, breakdown, failed: false,
    };
  } catch (err: any) {
    return {
      id: spec.id, source: spec.source, score: -1,
      input_quality_score: null, warning: null, capped: false,
      agent_ready: false, breakdown: {}, failed: true, error: String(err),
    };
  }
}

// Promise pool — N concurrent workers
async function runWithConcurrency(
  items: Spec[],
  concurrency: number,
  fn: (item: Spec, index: number) => Promise<LintResult>,
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
console.log(`\n🚀 Starting ${EXP_ID} — ${specs.length} specs @ ${CONCURRENCY} concurrent workers`);
console.log(`   Variant: ${VARIANT}`);
console.log(`   Est. time: ~${Math.ceil(specs.length / CONCURRENCY * 6 / 60)} minutes\n`);

const startTime = Date.now();

const allResults = await runWithConcurrency(
  specs,
  CONCURRENCY,
  (spec) => lintSpec(spec),
  (done, total, result) => {
    const pct = ((done / total) * 100).toFixed(0);
    const cap = result.capped ? " 🚫CAP" : "";
    const status = result.failed ? "❌ FAIL" : `✅ ${result.score}${cap}`;
    process.stdout.write(`\r  [${done}/${total}] ${pct}% — ${result.id}: ${status}      `);
  },
);

const elapsed = Date.now() - startTime;
console.log(`\n\n⏱  Completed in ${(elapsed / 1000).toFixed(1)}s`);

// --- Aggregate metrics ---
const successful = allResults.filter(r => !r.failed);
const failed = allResults.filter(r => r.failed);
const capped = successful.filter(r => r.capped);

// Average score (only successful)
const avgScore = successful.length > 0
  ? Math.round(successful.reduce((sum, r) => sum + r.score, 0) / successful.length)
  : 0;

// Agent-ready rate (score >= 70, only successful)
const agentReadyCount = successful.filter(r => r.agent_ready).length;
const agentReadyRate = successful.length > 0 ? agentReadyCount / successful.length : 0;

// Average input_quality_score (only specs that have it)
const withQuality = successful.filter(r => r.input_quality_score !== null);
const avgInputQuality = withQuality.length > 0
  ? Math.round(withQuality.reduce((sum, r) => sum + (r.input_quality_score ?? 0), 0) / withQuality.length)
  : null;

// Per-dimension pass rates
const allDimensions = new Set<string>();
successful.forEach(r => Object.keys(r.breakdown).forEach(d => allDimensions.add(d)));

const dimensionPassRates: Record<string, number> = {};
allDimensions.forEach(dim => {
  const passing = successful.filter(r => r.breakdown[dim] === true).length;
  dimensionPassRates[dim] = successful.length > 0 ? passing / successful.length : 0;
});

// Per-source breakdown (also track capped per source)
const sourceStats: Record<string, { count: number; total_score: number; agent_ready: number; capped: number }> = {};
successful.forEach(r => {
  if (!sourceStats[r.source]) sourceStats[r.source] = { count: 0, total_score: 0, agent_ready: 0, capped: 0 };
  sourceStats[r.source].count++;
  sourceStats[r.source].total_score += r.score;
  if (r.agent_ready) sourceStats[r.source].agent_ready++;
  if (r.capped) sourceStats[r.source].capped++;
});

const sourceBreakdown: Record<string, { avg_score: number; count: number; agent_ready_pct: number; capped_count: number }> = {};
Object.entries(sourceStats).forEach(([src, stats]) => {
  sourceBreakdown[src] = {
    avg_score: Math.round(stats.total_score / stats.count),
    count: stats.count,
    agent_ready_pct: stats.count > 0 ? stats.agent_ready / stats.count : 0,
    capped_count: stats.capped,
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
  avg_input_quality_score: avgInputQuality,
  capped_count: capped.length,
  capped_pct: successful.length > 0 ? capped.length / successful.length : 0,
  by_dimension: dimensionPassRates,
  by_source: sourceBreakdown,
  score_distribution: scoreDistribution,
};

// --- Comparison to exp_008 ---
const e8 = exp008.summary;
const scoreDelta = avgScore - e8.avg_score;
const agentReadyDelta = agentReadyRate - e8.agent_ready_pct;

// --- Print Summary ---
console.log(`\n${"═".repeat(65)}`);
console.log(`  ${EXP_ID} RESULTS — Real GitHub Issues + Garbage Detector`);
console.log(`${"═".repeat(65)}`);
console.log(`  Total specs:         ${specs.length}`);
console.log(`  Successful:          ${successful.length}`);
console.log(`  Failed:              ${failed.length}`);
console.log(`  Avg score:           ${avgScore}/100`);
console.log(`  Agent-ready:         ${agentReadyCount}/${successful.length} (${(agentReadyRate * 100).toFixed(1)}%)`);
if (avgInputQuality !== null) {
  console.log(`  Avg input quality:   ${avgInputQuality}/100 (${withQuality.length} specs)`);
}
console.log(`  Capped by detector:  ${capped.length} specs (${((capped.length / successful.length) * 100).toFixed(1)}%)`);

console.log(`\n  ── Comparison to exp_008 (pre-garbage-detector) ──`);
console.log(`  Avg score:   ${e8.avg_score} → ${avgScore}  (${scoreDelta >= 0 ? "+" : ""}${scoreDelta} pts)`);
console.log(`  Agent-ready: ${(e8.agent_ready_pct * 100).toFixed(1)}% → ${(agentReadyRate * 100).toFixed(1)}%  (${agentReadyDelta >= 0 ? "+" : ""}${(agentReadyDelta * 100).toFixed(1)} pp)`);
console.log(`  Capped:      N/A → ${capped.length} specs (${((capped.length / successful.length) * 100).toFixed(1)}%)`);

console.log(`\n  Score distribution (successful):`);
Object.entries(scoreDistribution).forEach(([range, count]) => {
  const bar = "█".repeat(Math.round(count / Math.max(successful.length, 1) * 30));
  console.log(`    ${range.padEnd(8)} ${String(count).padStart(3)} ${bar}`);
});

console.log(`\n  By source:`);
Object.entries(sourceBreakdown).forEach(([src, stats]) => {
  const e8src = e8.by_source?.[src];
  const delta = e8src ? ` (was ${e8src.avg_score})` : "";
  console.log(`    ${src.padEnd(10)} avg=${stats.avg_score}${delta}  count=${stats.count}  agent_ready=${(stats.agent_ready_pct * 100).toFixed(0)}%  capped=${stats.capped_count}`);
});

console.log(`\n  Dimension pass rates (successful specs):`);
Object.entries(dimensionPassRates)
  .sort((a, b) => a[1] - b[1])
  .forEach(([dim, rate]) => {
    const pct = (rate * 100).toFixed(1);
    const bar = "█".repeat(Math.round(rate * 20));
    const e8rate = e8.by_dimension?.[dim];
    const delta = e8rate !== undefined ? ` (was ${(e8rate * 100).toFixed(1)}%)` : "";
    console.log(`    ${dim.padEnd(35)} ${pct.padStart(6)}%${delta}  ${bar}`);
  });

if (capped.length > 0) {
  console.log(`\n  Capped specs (sample — first 5):`);
  capped.slice(0, 5).forEach(r => {
    console.log(`    ${r.id}: score=${r.score}, iq=${r.input_quality_score}  ⚠️  ${r.warning?.slice(0, 80) ?? "capped"}`);
  });
  if (capped.length > 5) console.log(`    ... and ${capped.length - 5} more`);
}

if (failed.length > 0) {
  console.log(`\n  Failed specs (${failed.length}):`);
  failed.slice(0, 5).forEach(r => {
    console.log(`    ${r.id}: ${r.error?.slice(0, 80) ?? "unknown error"}`);
  });
  if (failed.length > 5) console.log(`    ... and ${failed.length - 5} more`);
}
console.log(`${"═".repeat(65)}\n`);

// --- Save detailed results ---
const detailedResults = {
  experiment_id: EXP_ID,
  timestamp: new Date().toISOString(),
  variant: VARIANT,
  summary,
  comparison_to_exp_008: {
    avg_score_delta: scoreDelta,
    agent_ready_delta_pp: agentReadyDelta * 100,
    capped_count: capped.length,
    note: "Scores deflated by garbage-in detector. Capped specs had score forced to ≤60 with warning.",
  },
  results: allResults,
};
writeFileSync(RESULTS_FILE, JSON.stringify(detailedResults, null, 2));
console.log(`💾 Detailed results saved to: ${RESULTS_FILE}`);

// --- Append to experiments.jsonl ---
const cappedPct = (capped.length / successful.length * 100).toFixed(1);
const expRecord = {
  id: EXP_ID,
  timestamp: new Date().toISOString(),
  variant: VARIANT,
  hypothesis: "With garbage-in detector live, speculative/vague GitHub issues will be capped at 60. Average score and agent-ready rate should drop from exp_008 (avg=98, 100% agent-ready). This gives HONEST numbers.",
  data_source: "github-issues.json",
  spec_count: successful.length,
  failed_count: failed.length,
  elapsed_ms: elapsed,
  metrics: {
    avg_score: avgScore,
    agent_ready_pct: agentReadyRate,
    agent_ready_count: agentReadyCount,
    avg_input_quality_score: avgInputQuality,
    capped_count: capped.length,
    capped_pct: summary.capped_pct,
    by_dimension: dimensionPassRates,
    by_source: sourceBreakdown,
    score_distribution: scoreDistribution,
  },
  comparison_to_exp_008: {
    avg_score_delta: scoreDelta,
    agent_ready_delta_pp: agentReadyDelta * 100,
    exp_008_avg_score: e8.avg_score,
    exp_008_agent_ready_pct: e8.agent_ready_pct,
  },
  result: agentReadyRate >= 0.5 ? (agentReadyRate >= 0.7 ? "PARTIAL" : "PARTIAL-LOW") : "FAIL",
  reasoning: `Real GitHub issues WITH garbage detector: avg=${avgScore} (was ${e8.avg_score}), agent_ready=${(agentReadyRate * 100).toFixed(1)}% (was ${(e8.agent_ready_pct * 100).toFixed(1)}%). ${capped.length} specs (${cappedPct}%) capped by detector. Delta: ${scoreDelta} pts from exp_008.`,
};

appendFileSync(EXPERIMENTS_FILE, JSON.stringify(expRecord) + "\n");
console.log(`📊 Experiment appended to: ${EXPERIMENTS_FILE}`);
console.log(`\n✅ ${EXP_ID} complete!`);
