#!/usr/bin/env bun
/**
 * Speclint Autoresearch - exp_008
 * Real GitHub Issues Experiment (Parallel Workers)
 *
 * Tests 194 real GitHub issues from Next.js, React, Supabase, VS Code
 * against the production Speclint API at /api/lint
 * 
 * Uses 4 parallel workers to complete in ~5 min vs 20 min sequential
 * Each worker processes sequentially, keeping throughput well under 2 req/sec
 */

import { readFileSync, appendFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

const BASE_DIR = dirname(new URL(import.meta.url).pathname)
const REAL_SPECS_DIR = resolve(BASE_DIR, 'real-specs')

const API_BASE = 'https://speclint.ai'
const CONCURRENCY = 4       // 4 workers × ~8s/req = ~0.5 req/sec total (well under 2/sec limit)
const RETRY_DELAY_MS = 65_000
const EXP_ID = 'exp_008'
const VARIANT = 'v2.0-real-github-issues'

// Load API key
const envFile = `${process.env.HOME}/.config/env/speclint-internal.env`
let apiKey = process.env.SPECLINT_INTERNAL_KEY ?? ''
if (!apiKey) {
  try {
    const envContent = readFileSync(envFile, 'utf-8')
    const match = envContent.match(/SPECLINT_INTERNAL_KEY=(.+)/)
    if (match) apiKey = match[1].trim()
  } catch { /* ignore */ }
}
if (!apiKey) {
  console.error('❌ No SPECLINT_INTERNAL_KEY found!')
  process.exit(1)
}
console.log(`✅ API key: ${apiKey.slice(0, 15)}...`)

interface GitHubIssue {
  id: string
  input: string
  source: string
  labels: string[]
  has_body: boolean
}

interface SpecResult {
  id: string
  source: string
  score: number
  agent_ready: boolean
  breakdown: Record<string, boolean>
  failed: boolean
}

// Load GitHub issues
const issues: GitHubIssue[] = JSON.parse(
  readFileSync(resolve(REAL_SPECS_DIR, 'github-issues.json'), 'utf-8')
)
const sources = issues.reduce((acc, i) => {
  acc[i.source] = (acc[i.source] ?? 0) + 1
  return acc
}, {} as Record<string, number>)
console.log(`📋 ${issues.length} issues | sources: ${JSON.stringify(sources)}`)
console.log(`🚀 ${CONCURRENCY} workers | API: ${API_BASE}/api/lint`)
console.log(`⏱  Est. ~${Math.ceil(issues.length / CONCURRENCY * 8 / 60)} min`)
console.log('---')

// Shared progress counter
let completed = 0
const results: SpecResult[] = new Array(issues.length)

async function lintIssue(issue: GitHubIssue, attempt = 1): Promise<{ score: number; agent_ready: boolean; breakdown: Record<string, boolean> } | null> {
  try {
    const resp = await fetch(`${API_BASE}/api/lint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': apiKey,
      },
      body: JSON.stringify({ items: [issue.input] }),
    })

    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      if (resp.status === 429 && attempt <= 2) {
        console.log(`  [${issue.id}] Rate limited, retrying after ${RETRY_DELAY_MS / 1000}s...`)
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        return lintIssue(issue, attempt + 1)
      }
      console.error(`  [${issue.id}] ❌ ${resp.status}: ${body.slice(0, 120)}`)
      return null
    }

    const data = await resp.json() as any
    if (data.scores?.[0]) {
      const s = data.scores[0]
      return {
        score: s.completeness_score ?? 0,
        agent_ready: s.agent_ready ?? false,
        breakdown: s.breakdown ?? {},
      }
    }
    console.error(`  [${issue.id}] ⚠️  Unexpected shape: ${JSON.stringify(data).slice(0, 100)}`)
    return null
  } catch (err) {
    console.error(`  [${issue.id}] 💥 Fetch error:`, err)
    return null
  }
}

// Worker: processes a subset of issues
async function worker(workerId: number, indices: number[]) {
  for (const idx of indices) {
    const issue = issues[idx]
    const result = await lintIssue(issue)
    completed++
    const progress = `[${String(completed).padStart(3, '0')}/${issues.length}]`

    if (result) {
      results[idx] = {
        id: issue.id,
        source: issue.source,
        score: result.score,
        agent_ready: result.agent_ready,
        breakdown: result.breakdown,
        failed: false,
      }
      const emoji = result.score >= 70 ? '✅' : result.score >= 40 ? '🟡' : '🔴'
      console.log(`${progress} W${workerId} ${issue.id} ${emoji} score=${result.score} ready=${result.agent_ready}`)
    } else {
      results[idx] = {
        id: issue.id,
        source: issue.source,
        score: -1,
        agent_ready: false,
        breakdown: {},
        failed: true,
      }
      console.log(`${progress} W${workerId} ${issue.id} 💥 FAILED`)
    }
  }
}

async function run() {
  const startTime = Date.now()

  // Distribute work across workers (round-robin)
  const workerIndices: number[][] = Array.from({ length: CONCURRENCY }, () => [])
  for (let i = 0; i < issues.length; i++) {
    workerIndices[i % CONCURRENCY].push(i)
  }

  // Run all workers in parallel
  await Promise.all(workerIndices.map((indices, i) => worker(i + 1, indices)))

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n⏱  Done in ${elapsed}s (${(elapsed / 60).toFixed(1)} min)`)

  // Compute metrics
  const validResults = results.filter(r => r && !r.failed)
  const failedCount = results.filter(r => r && r.failed).length
  const avgScore = Math.round(validResults.reduce((s, r) => s + r.score, 0) / validResults.length)
  const agentReadyCount = validResults.filter(r => r.agent_ready).length
  const agentReadyPct = agentReadyCount / validResults.length

  // Dimension pass rates
  const dimensions = [
    'has_measurable_outcome',
    'has_testable_criteria',
    'has_constraints',
    'no_vague_verbs',
    'has_verification_steps',
  ]
  const byDimension: Record<string, number> = {}
  for (const dim of dimensions) {
    byDimension[dim] = validResults.filter(r => r.breakdown[dim] === true).length / validResults.length
  }

  // By source
  const bySource: Record<string, { avg_score: number; count: number; agent_ready_pct: number }> = {}
  for (const src of Object.keys(sources)) {
    const srcResults = validResults.filter(r => r.source === src)
    if (srcResults.length === 0) continue
    bySource[src] = {
      avg_score: Math.round(srcResults.reduce((s, r) => s + r.score, 0) / srcResults.length),
      count: srcResults.length,
      agent_ready_pct: srcResults.filter(r => r.agent_ready).length / srcResults.length,
    }
  }

  // Score distribution
  const scoreDistribution: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
  for (const r of validResults) {
    if (r.score <= 20) scoreDistribution['0-20']++
    else if (r.score <= 40) scoreDistribution['21-40']++
    else if (r.score <= 60) scoreDistribution['41-60']++
    else if (r.score <= 80) scoreDistribution['61-80']++
    else scoreDistribution['81-100']++
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║       EXP_008 RESULTS SUMMARY         ║')
  console.log('╚═══════════════════════════════════════╝')
  console.log(`ID:           ${EXP_ID}`)
  console.log(`Variant:      ${VARIANT}`)
  console.log(`Total specs:  ${issues.length} (${validResults.length} ok, ${failedCount} failed)`)
  console.log(`Avg Score:    ${avgScore}`)
  console.log(`Agent-Ready:  ${agentReadyCount}/${validResults.length} (${(agentReadyPct * 100).toFixed(1)}%)`)

  console.log('\nDimension Pass Rates:')
  for (const [dim, rate] of Object.entries(byDimension).sort((a, b) => a[1] - b[1])) {
    const pct = (rate * 100).toFixed(1)
    const icon = rate < 0.3 ? '🔴' : rate < 0.6 ? '🟡' : '🟢'
    console.log(`  ${icon} ${dim}: ${pct}%`)
  }

  console.log('\nBy Source:')
  for (const [src, data] of Object.entries(bySource)) {
    console.log(`  ${src}: avg=${data.avg_score} ready=${(data.agent_ready_pct * 100).toFixed(1)}% (n=${data.count})`)
  }

  console.log('\nScore Distribution:')
  for (const [range, count] of Object.entries(scoreDistribution)) {
    const pct = ((count / validResults.length) * 100).toFixed(1)
    console.log(`  ${range}: ${String(count).padStart(3)} (${pct}%)`)
  }

  // Build experiment record
  const experiment = {
    id: EXP_ID,
    timestamp: new Date().toISOString(),
    variant: VARIANT,
    hypothesis: 'Real GitHub issues will score lower than synthetic specs (exp_001-007 avg=99). Testing whether Speclint generalizes to real-world issue quality.',
    data_source: 'github-issues.json',
    spec_count: issues.length,
    failed_count: failedCount,
    metrics: {
      avg_score: avgScore,
      agent_ready_pct: agentReadyPct,
      agent_ready_count: agentReadyCount,
      by_dimension: byDimension,
      by_source: bySource,
      score_distribution: scoreDistribution,
    },
    spec_results: results.map((r, idx) => ({
      id: r?.id ?? issues[idx].id,
      source: r?.source ?? issues[idx].source,
      score: r?.score ?? -1,
      agent_ready: r?.agent_ready ?? false,
      breakdown: r?.breakdown ?? {},
      failed: r?.failed ?? true,
    })),
    result: avgScore >= 70 ? 'PASS' : avgScore >= 40 ? 'PARTIAL' : 'FAIL',
    reasoning: `Real GitHub issues avg=${avgScore}, agent_ready=${(agentReadyPct * 100).toFixed(1)}%. vs synthetic avg=99 in exp_001-007. Delta: ${99 - avgScore} pts.`,
  }

  // Save to experiments.jsonl
  const experimentsPath = resolve(BASE_DIR, 'experiments.jsonl')
  appendFileSync(experimentsPath, JSON.stringify(experiment) + '\n')
  console.log(`\n💾 Appended to experiments.jsonl`)

  // Save detailed results
  const detailedPath = resolve(REAL_SPECS_DIR, 'exp_008-results.json')
  writeFileSync(detailedPath, JSON.stringify({
    experiment_id: EXP_ID,
    timestamp: experiment.timestamp,
    variant: VARIANT,
    summary: experiment.metrics,
    results: results.map((r, idx) => ({
      ...(r ?? { id: issues[idx].id, source: issues[idx].source, score: -1, agent_ready: false, breakdown: {}, failed: true }),
      input_preview: issues[idx].input.slice(0, 300),
      labels: issues[idx].labels,
      has_body: issues[idx].has_body,
    })),
  }, null, 2))
  console.log(`💾 Saved detailed results to real-specs/exp_008-results.json`)
  console.log('\n✅ exp_008 complete!')

  return experiment
}

run().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
