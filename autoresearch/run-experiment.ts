#!/usr/bin/env bun
/**
 * Speclint Autoresearch Experiment Runner
 * 
 * Runs all test specs through the Speclint API, records scores, and compares with baseline.
 * 
 * Usage:
 *   bun run autoresearch/run-experiment.ts [--variant <name>] [--api <url>]
 * 
 * Options:
 *   --variant  Name for this experiment variant (default: "baseline")
 *   --api      API base URL (default: "https://speclint.ai")
 *   --delay    Delay between API calls in ms (default: 500)
 */

import { readFileSync, appendFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

const BASE_DIR = dirname(new URL(import.meta.url).pathname)

interface TestSpec {
  id: string
  category: string
  input: string
  expected_score_range: [number, number]
}

interface SpecResult {
  id: string
  category: string
  score: number
  agent_ready: boolean
  breakdown: Record<string, boolean | string>
}

interface ExperimentResult {
  id: string
  timestamp: string
  variant: string
  hypothesis?: string
  dimension_targeted?: string
  metrics: {
    avg_score: number
    agent_ready_pct: number
    by_dimension: Record<string, number>
    by_category: Record<string, { avg_score: number; count: number }>
    score_in_range_pct: number
  }
  spec_results: Array<{ id: string; score: number; agent_ready: boolean; breakdown?: Record<string, boolean | string> }>
  result: string
  reasoning: string
}

// Parse args
const args = process.argv.slice(2)
const getArg = (name: string, def: string) => {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def
}
const variantName = getArg('variant', 'baseline')
const apiBase = getArg('api', 'https://speclint.ai')
const delay = parseInt(getArg('delay', '500'))
const licenseKey = getArg('key', process.env.SPECLINT_INTERNAL_KEY ?? '')

// Load test specs
const testSpecs: TestSpec[] = JSON.parse(readFileSync(resolve(BASE_DIR, 'test-specs.json'), 'utf-8'))
console.log(`Loaded ${testSpecs.length} test specs`)
console.log(`API: ${apiBase}`)
console.log(`Variant: ${variantName}`)
console.log(`Delay: ${delay}ms between calls`)
console.log('---')

// Load existing experiments to determine next ID
const experimentsPath = resolve(BASE_DIR, 'experiments.jsonl')
let existingLines: string[] = []
try {
  existingLines = readFileSync(experimentsPath, 'utf-8').trim().split('\n').filter(Boolean)
} catch { /* no file yet */ }
const nextId = `exp_${String(existingLines.length + 1).padStart(3, '0')}`

async function lintSpec(spec: string): Promise<{ score: number; agent_ready: boolean; breakdown: Record<string, boolean | string> } | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (licenseKey) headers['x-license-key'] = licenseKey
    
    const resp = await fetch(`${apiBase}/api/refine`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items: [spec],
        auto_rewrite: true,
        max_iterations: 1,
      }),
    })
    
    if (!resp.ok) {
      console.error(`  API error: ${resp.status} ${resp.statusText}`)
      // Rate limited — wait and retry once
      if (resp.status === 429) {
        console.log('  Rate limited, waiting 60s...')
        await new Promise(r => setTimeout(r, 60_000))
        return lintSpec(spec)
      }
      return null
    }
    
    const data = await resp.json() as any
    if (data.scores?.[0]) {
      const s = data.scores[0]
      return {
        score: s.completeness_score,
        agent_ready: s.agent_ready,
        breakdown: s.breakdown,
      }
    }
    return null
  } catch (err) {
    console.error(`  Fetch error:`, err)
    return null
  }
}

async function runExperiment() {
  const results: SpecResult[] = []
  
  for (let i = 0; i < testSpecs.length; i++) {
    const spec = testSpecs[i]
    process.stdout.write(`[${i + 1}/${testSpecs.length}] ${spec.id}... `)
    
    const result = await lintSpec(spec.input)
    
    if (result) {
      results.push({
        id: spec.id,
        category: spec.category,
        score: result.score,
        agent_ready: result.agent_ready,
        breakdown: result.breakdown,
      })
      console.log(`score=${result.score} agent_ready=${result.agent_ready}`)
    } else {
      console.log('FAILED')
      results.push({
        id: spec.id,
        category: spec.category,
        score: -1,
        agent_ready: false,
        breakdown: {},
      })
    }
    
    // Delay between calls to avoid rate limiting
    if (i < testSpecs.length - 1) {
      await new Promise(r => setTimeout(r, delay))
    }
  }
  
  // Compute metrics
  const validResults = results.filter(r => r.score >= 0)
  const avgScore = Math.round(validResults.reduce((s, r) => s + r.score, 0) / validResults.length)
  const agentReadyPct = validResults.filter(r => r.agent_ready).length / validResults.length
  
  // Dimension pass rates
  const dimensions = ['has_measurable_outcome', 'has_testable_criteria', 'has_constraints', 'no_vague_verbs', 'has_verification_steps']
  const byDimension: Record<string, number> = {}
  for (const dim of dimensions) {
    const passes = validResults.filter(r => r.breakdown[dim] === true).length
    byDimension[dim] = passes / validResults.length
  }
  
  // By category
  const categories = [...new Set(validResults.map(r => r.category))]
  const byCategory: Record<string, { avg_score: number; count: number }> = {}
  for (const cat of categories) {
    const catResults = validResults.filter(r => r.category === cat)
    byCategory[cat] = {
      avg_score: Math.round(catResults.reduce((s, r) => s + r.score, 0) / catResults.length),
      count: catResults.length,
    }
  }
  
  // Score-in-range accuracy
  const inRange = validResults.filter(r => {
    const spec = testSpecs.find(s => s.id === r.id)!
    return r.score >= spec.expected_score_range[0] && r.score <= spec.expected_score_range[1]
  }).length
  const scoreInRangePct = inRange / validResults.length
  
  const experiment: ExperimentResult = {
    id: nextId,
    timestamp: new Date().toISOString(),
    variant: variantName,
    metrics: {
      avg_score: avgScore,
      agent_ready_pct: agentReadyPct,
      by_dimension: byDimension,
      by_category: byCategory,
      score_in_range_pct: scoreInRangePct,
    },
    spec_results: results.map(r => ({ id: r.id, score: r.score, agent_ready: r.agent_ready, breakdown: r.breakdown })),
    result: 'PENDING_COMPARISON',
    reasoning: '',
  }
  
  // Print summary
  console.log('\n=== EXPERIMENT RESULTS ===')
  console.log(`ID: ${nextId}`)
  console.log(`Variant: ${variantName}`)
  console.log(`Avg Score: ${avgScore}`)
  console.log(`Agent Ready: ${(agentReadyPct * 100).toFixed(1)}%`)
  console.log('\nDimension Pass Rates:')
  for (const [dim, rate] of Object.entries(byDimension).sort((a, b) => a[1] - b[1])) {
    const pct = (rate * 100).toFixed(1)
    const bar = rate < 0.3 ? '🔴' : rate < 0.6 ? '🟡' : '🟢'
    console.log(`  ${bar} ${dim}: ${pct}%`)
  }
  console.log('\nBy Category:')
  for (const [cat, data] of Object.entries(byCategory)) {
    console.log(`  ${cat}: avg ${data.avg_score} (n=${data.count})`)
  }
  console.log(`\nScore-in-range accuracy: ${(scoreInRangePct * 100).toFixed(1)}%`)
  
  // Compare with baseline if available
  if (existingLines.length > 0) {
    const baseline = JSON.parse(existingLines[0]) as ExperimentResult
    console.log('\n=== COMPARISON vs BASELINE ===')
    console.log(`Avg Score: ${baseline.metrics.avg_score} → ${avgScore} (${avgScore > baseline.metrics.avg_score ? '+' : ''}${avgScore - baseline.metrics.avg_score})`)
    console.log(`Agent Ready: ${(baseline.metrics.agent_ready_pct * 100).toFixed(1)}% → ${(agentReadyPct * 100).toFixed(1)}%`)
    
    let anyRegression = false
    for (const dim of dimensions) {
      const before = baseline.metrics.by_dimension[dim] ?? 0
      const after = byDimension[dim]
      const delta = after - before
      const pct = (delta * 100).toFixed(1)
      const indicator = delta > 0.05 ? '✅' : delta < -0.03 ? '❌ REGRESSION' : '➖'
      if (delta < -0.03) anyRegression = true
      console.log(`  ${indicator} ${dim}: ${(before * 100).toFixed(1)}% → ${(after * 100).toFixed(1)}% (${delta > 0 ? '+' : ''}${pct}%)`)
    }
    
    experiment.reasoning = anyRegression 
      ? 'Regression detected in one or more dimensions'
      : `Variant ${variantName} vs baseline comparison complete`
  }
  
  // Append to experiments.jsonl
  appendFileSync(experimentsPath, JSON.stringify(experiment) + '\n')
  console.log(`\nSaved to ${experimentsPath}`)
  
  return experiment
}

runExperiment().catch(console.error)
