#!/usr/bin/env bun
/**
 * score-raw-inputs.ts
 * Scores the RAW input strings from GitHub issues (no refinement)
 * and compares them to the refined scores from exp_008-results.json
 * to measure the delta (the Speclint "product story").
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// ─── Reimplemented scoring logic from scoring.ts ───────────────────────────

const VAGUE_VERBS = ['improve', 'enhance', 'optimize', 'update', 'fix']

const ACTION_VERB_RE = /^(given|when|then|user can|verify|confirm|ensure|check|assert|validate|the system|it should|should|must|display|show|return|redirect|allow|prevent|enable|disable|create|delete|update|send|receive|load|render|submit|click|navigate|log|track|provide|document|include|define|implement|configure|set up|add|remove|migrate|deploy|test|run|execute|list|specify|identify|review|approve|generate|export|import|integrate|schedule|notify|alert|measure|monitor|establish|prepare|attach|link|outline|map)/i

const DECLARATIVE_AC_RE = /\b(is visible|is displayed|is enabled|is disabled|is present|is removed|is hidden|appears?\b|contains?\b|includes?\b|returns?\b|redirects?\b|loads?\b|renders?\b|shows?\b|displays?\b|supports?\b|accepts?\b|rejects?\b|blocks?\b|allows?\b|prevents?\b|triggers?\b|fires?\b|completes?\b|downloads?\b|uploads?\b|passes?\b|fails?\b|works?\b|functions?\b|remains?\b|stays?\b|persists?\b)\b/i

const DOD_RE = /\d+|logged in|returns? \d+|visible|enabled|disabled|less than|within|at least|greater than|no more than|exactly|complete|success|fail|error|approved|rejected|active|inactive/i

const VERIFICATION_RE = /(?:(?:^|\n)(?:#{1,6}\s*)?(?:verification(?:\s*steps?)?|verify|confirm|test that|assert|expect|run .{0,40} and check|unit test|integration test|e2e test|end.to.end test|test passes|manually check|open the page and verify|curl .{0,60} returns|check that|proves?|validated|validates?)|\b(?:verify|confirm|test that|assert|expect|unit test|integration test|e2e test|end.to.end test|test passes|manually check|curl .{0,60} returns|check that|proves?|validated|validates?))\b/i

const MEASURABLE_OUTCOME_RE = /(?:(?:^|\n)(?:#{1,6}\s*)?(?:measurable outcome|measure|goal|target|kpi|metric|measur|observ|track|monitor|reduc|increas|decreas|faster|slower|less|more|rate|count|number)|\b(?:measurable outcome|measure|goal|target|kpi|metric|measur|observ|track|monitor|reduc|increas|decreas|faster|slower|rate|count|number)|\d+|%)\b/i

const CONSTRAINTS_RE = /(?:^|\n|\b)(?:constraints|limitations|assumptions|rules|scope|out of scope)\b/i

const REVIEW_GATE_RE = /\b(review|approve[sd]?|approval|sign.?off|accepted by|reviewed by|qa pass|qa review|peer review|code review|pr review|pull request|demo|walkthrough|stakeholder sign|definition of done)\b/i

interface RawScoreResult {
  score: number
  breakdown: Record<string, boolean>
}

/**
 * Parse a raw GitHub issue string into pseudo-structured fields,
 * then run the same scoring logic as computeCompletenessScore().
 */
function scoreRawInput(rawInput: string): RawScoreResult {
  const lines = rawInput.split('\n')
  const title = lines[0].trim()
  const bodyText = lines.slice(1).join('\n')

  // Extract candidate acceptance criteria: markdown list items (-, *, 1., etc.)
  // This is the best-effort parse of "ACs" from unstructured text
  const listItemRE = /^(?:\s*[-*+]|\s*\d+[.)]\s)\s*(.+)/
  const potentialACs: string[] = []
  for (const line of lines) {
    const m = line.match(listItemRE)
    if (m) {
      potentialACs.push(m[1].trim())
    }
  }

  // allText = everything combined (mirrors how the real scorer works)
  const allText = [title, bodyText].join('\n')

  // has_measurable_outcome
  const has_measurable_outcome = MEASURABLE_OUTCOME_RE.test(allText)

  // has_testable_criteria: ≥2 list items that look like ACs
  const testableCount = potentialACs.filter(c => {
    const trimmed = c.trim()
    return ACTION_VERB_RE.test(trimmed) || DECLARATIVE_AC_RE.test(trimmed)
  }).length
  const has_testable_criteria = testableCount >= 2

  // has_constraints: tags not available for raw → only check text
  const has_constraints = CONSTRAINTS_RE.test(allText)

  // no_vague_verbs
  const titleWords = title.split(/\s+/)
  const titleLower = title.toLowerCase()
  const hasVagueVerb = VAGUE_VERBS.some(v => titleLower.includes(v))
  let no_vague_verbs: boolean
  if (!hasVagueVerb) {
    no_vague_verbs = true
  } else if (titleWords.length < 4) {
    no_vague_verbs = false
  } else {
    const withoutVague = VAGUE_VERBS.reduce((t, v) => t.replace(new RegExp(v, 'gi'), '').trim(), titleLower)
    no_vague_verbs = withoutVague.replace(/\s+/g, '').length >= 4
  }

  // has_definition_of_done (0 pts but tracked)
  const has_definition_of_done = potentialACs.some(c => DOD_RE.test(c))

  // has_verification_steps
  const has_verification_steps = VERIFICATION_RE.test(allText)

  // has_review_gate (advisory)
  const has_review_gate = REVIEW_GATE_RE.test(allText)

  const score =
    (has_measurable_outcome ? 20 : 0) +
    (has_testable_criteria ? 25 : 0) +
    (has_constraints ? 20 : 0) +
    (no_vague_verbs ? 20 : 0) +
    (has_verification_steps ? 15 : 0)

  return {
    score,
    breakdown: {
      has_measurable_outcome,
      has_testable_criteria,
      has_constraints,
      no_vague_verbs,
      has_definition_of_done,
      has_verification_steps,
      has_review_gate,
    },
  }
}

// ─── Load data ─────────────────────────────────────────────────────────────

const workspace = '/Users/clawdbot/.openclaw/workspace'
const issuesPath = join(workspace, 'products/speclint/autoresearch/real-specs/github-issues.json')
const refinedPath = join(workspace, 'products/speclint/autoresearch/real-specs/exp_008-results.json')
const outputPath = join(workspace, 'products/speclint/autoresearch/real-specs/raw-vs-refined.json')

interface GithubIssue {
  id: string
  input: string
  source: string
  labels: string[]
  has_body: boolean
}

interface RefinedResult {
  id: string
  source: string
  score: number
  agent_ready: boolean
  breakdown: Record<string, boolean>
  failed: boolean
  input_preview: string
  labels: string[]
  has_body: boolean
}

interface Exp008 {
  summary: {
    avg_score: number
    by_dimension: Record<string, number>
    by_source: Record<string, { avg_score: number; count: number; agent_ready_pct: number }>
    score_distribution: Record<string, number>
  }
  results: RefinedResult[]
}

const issues: GithubIssue[] = JSON.parse(readFileSync(issuesPath, 'utf8'))
const exp008: Exp008 = JSON.parse(readFileSync(refinedPath, 'utf8'))

// Build refined lookup by id
const refinedById = new Map<string, RefinedResult>()
for (const r of exp008.results) {
  refinedById.set(r.id, r)
}

// ─── Score all raw inputs ───────────────────────────────────────────────────

const DIMENSIONS = ['has_measurable_outcome', 'has_testable_criteria', 'has_constraints', 'no_vague_verbs', 'has_verification_steps']

interface SpecComparison {
  id: string
  source: string
  raw_score: number
  refined_score: number
  delta: number
  raw_breakdown: Record<string, boolean>
  refined_breakdown: Record<string, boolean>
  title: string
}

const comparisons: SpecComparison[] = []

for (const issue of issues) {
  const rawResult = scoreRawInput(issue.input)
  const refined = refinedById.get(issue.id)

  if (!refined) {
    console.warn(`⚠️  No refined result for ${issue.id}`)
    continue
  }

  const title = issue.input.split('\n')[0].trim()

  comparisons.push({
    id: issue.id,
    source: issue.source,
    raw_score: rawResult.score,
    refined_score: refined.score,
    delta: refined.score - rawResult.score,
    raw_breakdown: rawResult.breakdown,
    refined_breakdown: refined.breakdown as Record<string, boolean>,
    title,
  })
}

// ─── Compute summary stats ──────────────────────────────────────────────────

const n = comparisons.length

const avgRaw = comparisons.reduce((s, c) => s + c.raw_score, 0) / n
const avgRefined = comparisons.reduce((s, c) => s + c.refined_score, 0) / n
const avgDelta = avgRefined - avgRaw

// Per-dimension raw vs refined pass rates
const dimStats: Record<string, { raw_pass: number; refined_pass: number; raw_rate: number; refined_rate: number; lift: number }> = {}
for (const dim of DIMENSIONS) {
  const rawPass = comparisons.filter(c => c.raw_breakdown[dim] === true).length
  const refinedPass = comparisons.filter(c => c.refined_breakdown[dim] === true).length
  dimStats[dim] = {
    raw_pass: rawPass,
    refined_pass: refinedPass,
    raw_rate: rawPass / n,
    refined_rate: refinedPass / n,
    lift: (refinedPass - rawPass) / n,
  }
}

// Per-source breakdown
const sources = ['nextjs', 'react', 'supabase', 'vscode']
const sourceStats: Record<string, {
  count: number
  avg_raw: number
  avg_refined: number
  avg_delta: number
  raw_agent_ready_pct: number
  refined_agent_ready_pct: number
}> = {}

for (const src of sources) {
  const group = comparisons.filter(c => c.source === src)
  if (group.length === 0) continue
  const gn = group.length
  sourceStats[src] = {
    count: gn,
    avg_raw: group.reduce((s, c) => s + c.raw_score, 0) / gn,
    avg_refined: group.reduce((s, c) => s + c.refined_score, 0) / gn,
    avg_delta: group.reduce((s, c) => s + c.delta, 0) / gn,
    raw_agent_ready_pct: group.filter(c => c.raw_score >= 70).length / gn,
    refined_agent_ready_pct: group.filter(c => c.refined_score >= 70).length / gn,
  }
}

// Raw score distribution
const rawDist: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
for (const c of comparisons) {
  if (c.raw_score <= 20) rawDist['0-20']++
  else if (c.raw_score <= 40) rawDist['21-40']++
  else if (c.raw_score <= 60) rawDist['41-60']++
  else if (c.raw_score <= 80) rawDist['61-80']++
  else rawDist['81-100']++
}

// Top 10 biggest deltas
const top10 = [...comparisons]
  .sort((a, b) => b.delta - a.delta)
  .slice(0, 10)
  .map(c => ({
    id: c.id,
    source: c.source,
    title: c.title,
    raw_score: c.raw_score,
    refined_score: c.refined_score,
    delta: c.delta,
  }))

// Agent-ready counts
const rawAgentReady = comparisons.filter(c => c.raw_score >= 70).length
const refinedAgentReady = comparisons.filter(c => c.refined_score >= 70).length

// ─── Build output ───────────────────────────────────────────────────────────

const output = {
  generated_at: new Date().toISOString(),
  total_specs: n,
  summary: {
    avg_raw_score: Math.round(avgRaw * 10) / 10,
    avg_refined_score: Math.round(avgRefined * 10) / 10,
    avg_delta: Math.round(avgDelta * 10) / 10,
    raw_agent_ready_count: rawAgentReady,
    refined_agent_ready_count: refinedAgentReady,
    raw_agent_ready_pct: Math.round((rawAgentReady / n) * 1000) / 10,
    refined_agent_ready_pct: Math.round((refinedAgentReady / n) * 1000) / 10,
  },
  by_dimension: dimStats,
  by_source: sourceStats,
  raw_score_distribution: rawDist,
  refined_score_distribution: exp008.summary.score_distribution,
  top10_biggest_deltas: top10,
  all_comparisons: comparisons,
}

writeFileSync(outputPath, JSON.stringify(output, null, 2))

// ─── Print report ───────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(60))
console.log('  SPECLINT: RAW vs REFINED SCORE ANALYSIS')
console.log('═'.repeat(60))

console.log(`\n📊 OVERALL (n=${n})`)
console.log(`  Avg raw score:     ${output.summary.avg_raw_score}`)
console.log(`  Avg refined score: ${output.summary.avg_refined_score}`)
console.log(`  Avg delta:         +${output.summary.avg_delta} pts`)
console.log(`  Agent-ready raw:   ${rawAgentReady}/${n} (${output.summary.raw_agent_ready_pct}%)`)
console.log(`  Agent-ready after: ${refinedAgentReady}/${n} (${output.summary.refined_agent_ready_pct}%)`)

console.log('\n📐 PER-DIMENSION (raw pass rate → refined pass rate)')
const dimLabels: Record<string, string> = {
  has_measurable_outcome: 'Measurable outcome  ',
  has_testable_criteria:  'Testable criteria   ',
  has_constraints:        'Constraints/scope   ',
  no_vague_verbs:         'No vague verbs      ',
  has_verification_steps: 'Verification steps  ',
}
for (const dim of DIMENSIONS) {
  const s = dimStats[dim]
  const rawPct = (s.raw_rate * 100).toFixed(1)
  const refPct = (s.refined_rate * 100).toFixed(1)
  const lift = (s.lift * 100).toFixed(1)
  const sign = s.lift >= 0 ? '+' : ''
  console.log(`  ${dimLabels[dim]}  ${rawPct.padStart(5)}% → ${refPct.padStart(5)}%  (${sign}${lift}%)`)
}

console.log('\n🗂️  PER-SOURCE BREAKDOWN')
for (const src of sources) {
  if (!sourceStats[src]) continue
  const s = sourceStats[src]
  console.log(`  ${src.padEnd(10)}  raw=${s.avg_raw.toFixed(1)}  refined=${s.avg_refined.toFixed(1)}  Δ=+${s.avg_delta.toFixed(1)}  agent-ready: ${(s.raw_agent_ready_pct*100).toFixed(0)}% → ${(s.refined_agent_ready_pct*100).toFixed(0)}%`)
}

console.log('\n📈 RAW SCORE DISTRIBUTION')
for (const [bucket, count] of Object.entries(rawDist)) {
  const bar = '█'.repeat(Math.round(count / n * 40))
  console.log(`  ${bucket.padEnd(8)}  ${String(count).padStart(3)}  ${bar}`)
}

console.log('\n🏆 TOP 10 BIGGEST DELTAS (most impressive transformations)')
for (let i = 0; i < top10.length; i++) {
  const t = top10[i]
  const shortTitle = t.title.length > 55 ? t.title.slice(0, 52) + '…' : t.title
  console.log(`  ${String(i + 1).padStart(2)}. [${t.source}] ${shortTitle}`)
  console.log(`      ${t.raw_score} → ${t.refined_score}  (Δ +${t.delta})`)
}

console.log(`\n✅ Full results saved to: products/speclint/autoresearch/real-specs/raw-vs-refined.json\n`)
