#!/usr/bin/env bun
/**
 * LLM-as-Judge: Validates whether Speclint's refinement produces genuine quality
 * improvement or just regex-friendly patterns.
 * 
 * Samples 30 specs across score ranges and asks Claude Haiku to judge quality.
 */

import { readFileSync, writeFileSync } from 'fs'

const API_KEY = process.env.LB_ANTHROPIC_API_KEY || 
  readFileSync(`${process.env.HOME}/.config/env/global.env`, 'utf8')
    .split('\n')
    .find(l => l.startsWith('LB_ANTHROPIC_API_KEY='))
    ?.split('=').slice(1).join('=')
    ?.trim()

if (!API_KEY) throw new Error('No Anthropic API key found')

const BASE = new URL('.', import.meta.url).pathname

// Load data
const exp009Data = JSON.parse(readFileSync(`${BASE}real-specs/exp_009-results.json`, 'utf8'))
const exp009Results: any[] = exp009Data.results || []
const rawSpecs: any[] = JSON.parse(readFileSync(`${BASE}real-specs/github-issues.json`, 'utf8'))

// Build lookup: id → raw input
const rawMap = new Map(rawSpecs.map(s => [s.id, s.input]))

// Load SPECLINT_INTERNAL_KEY for API calls
const SPECLINT_KEY = readFileSync(`${process.env.HOME}/.config/env/speclint-internal.env`, 'utf8')
  .split('\n')
  .find(l => l.startsWith('SPECLINT_INTERNAL_KEY='))
  ?.split('=').slice(1).join('=')
  ?.trim()

// Filter to successful results
const valid = exp009Results.filter(r => !r.failed && rawMap.has(r.id))

const highScore = valid.filter(r => r.score >= 95)
const midScore = valid.filter(r => r.score >= 70 && r.score < 95)
const lowScore = valid.filter(r => r.score < 70)

function sample(arr: any[], n: number): any[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// Sample 30: 15 high, 10 mid, 5 low (proportional to distribution)
const samples = [
  ...sample(highScore, Math.min(15, highScore.length)),
  ...sample(midScore, Math.min(10, midScore.length)),
  ...sample(lowScore, Math.min(5, lowScore.length)),
]

console.log(`Sampled ${samples.length} specs: ${Math.min(15, highScore.length)} high, ${Math.min(10, midScore.length)} mid, ${Math.min(5, lowScore.length)} low`)

// Function to get refined text from Speclint API
async function getRefinedText(rawInput: string): Promise<string | null> {
  try {
    const res = await fetch('https://speclint.ai/api/lint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-license-key': SPECLINT_KEY! },
      body: JSON.stringify({ items: [rawInput] }),
    })
    if (!res.ok) return null
    const data = await res.json() as any
    const item = data.items?.[0]
    if (!item) return null
    
    // Reconstruct refined spec from structured fields
    const parts: string[] = []
    if (item.title) parts.push(`Title: ${item.title}`)
    if (item.problem) parts.push(`Problem: ${item.problem}`)
    if (item.acceptanceCriteria?.length) parts.push(`Acceptance Criteria:\n${item.acceptanceCriteria.map((c: string) => '- ' + c).join('\n')}`)
    if (item.assumptions?.length) parts.push(`Constraints:\n${item.assumptions.map((a: string) => '- ' + a).join('\n')}`)
    if (item.verificationSteps?.length) parts.push(`Verification Steps:\n${item.verificationSteps.map((v: string) => '- ' + v).join('\n')}`)
    
    return parts.length > 0 ? parts.join('\n\n') : null
  } catch { return null }
}

interface JudgeResult {
  id: string
  source: string
  regex_score: number
  input_quality: number
  raw_input: string
  refined_output: string
  judge: {
    accuracy: number
    completeness: number
    specificity: number
    over_specification: number
    relevance: number
    overall: number
    notes: string
  } | null
  error?: string
}

async function judgeSpec(spec: any, refinedText: string): Promise<JudgeResult> {
  const rawInput = rawMap.get(spec.id) || ''
  const refinedOutput = refinedText
  
  const prompt = `You are evaluating whether an AI spec refinement tool genuinely improved a software spec or just added boilerplate keywords.

ORIGINAL SPEC (raw GitHub issue):
---
${rawInput.slice(0, 2000)}
---

REFINED SPEC (after AI refinement):
---
${refinedOutput.slice(0, 3000)}
---

Score the refinement on these 5 dimensions (1-5 each, where 1=terrible, 3=acceptable, 5=excellent):

1. ACCURACY: Does the refined spec preserve the original intent without hallucinating requirements that weren't implied?
2. COMPLETENESS: Are the added acceptance criteria, constraints, and verification steps genuinely useful for an engineer?
3. SPECIFICITY: Are the additions specific to THIS feature, or generic boilerplate that could apply to anything?
4. OVER_SPECIFICATION: Does it avoid adding unnecessary constraints that limit valid implementations? (5=no over-spec, 1=heavily over-specified)
5. RELEVANCE: Are verification steps relevant to the actual feature, not just pattern-filling?

Respond with ONLY valid JSON, no markdown:
{"accuracy":N,"completeness":N,"specificity":N,"over_specification":N,"relevance":N,"overall":N,"notes":"one sentence"}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`API ${res.status}: ${err.slice(0, 200)}`)
    }

    const data = await res.json() as any
    const text = data.content?.[0]?.text || ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 100)}`)
    
    const judge = JSON.parse(jsonMatch[0])
    
    return {
      id: spec.id,
      source: spec.source || 'unknown',
      regex_score: spec.completeness_score,
      input_quality: spec.input_quality_score || 0,
      raw_input: rawInput.slice(0, 500),
      refined_output: refinedOutput.slice(0, 500),
      judge,
    }
  } catch (err: any) {
    return {
      id: spec.id,
      source: spec.source || 'unknown',
      regex_score: spec.completeness_score,
      input_quality: spec.input_quality_score || 0,
      raw_input: rawInput.slice(0, 500),
      refined_output: refinedOutput.slice(0, 500),
      judge: null,
      error: err.message,
    }
  }
}

// Run sequentially: fetch refined text from Speclint API, then judge with Claude
const results: JudgeResult[] = []
for (let i = 0; i < samples.length; i++) {
  const spec = samples[i]
  const rawInput = rawMap.get(spec.id) || ''
  process.stdout.write(`[${i + 1}/${samples.length}] ${spec.id}: fetching refined...`)
  
  const refinedText = await getRefinedText(rawInput)
  if (!refinedText) {
    console.log(' ✗ no refined text')
    results.push({
      id: spec.id, source: spec.source || 'unknown', regex_score: spec.score,
      input_quality: spec.input_quality_score || 0, raw_input: rawInput.slice(0, 500),
      refined_output: '', judge: null, error: 'Failed to get refined text from API'
    })
    continue
  }
  
  process.stdout.write(' judging...')
  const result = await judgeSpec(spec, refinedText)
  results.push(result)
  if (result.judge) {
    console.log(` ✓ overall=${result.judge.overall}`)
  } else {
    console.log(` ✗ ${result.error}`)
  }
  // Rate limit: 1.5s between requests (Speclint + Anthropic)
  if (i < samples.length - 1) await new Promise(r => setTimeout(r, 1500))
}

// Save results
writeFileSync(`${BASE}real-specs/llm-judge-results.json`, JSON.stringify(results, null, 2))

// Analysis
const successful = results.filter(r => r.judge !== null)
const dims = ['accuracy', 'completeness', 'specificity', 'over_specification', 'relevance', 'overall'] as const

console.log('\n' + '='.repeat(60))
console.log('LLM-AS-JUDGE RESULTS')
console.log('='.repeat(60))
console.log(`\nSuccessful evaluations: ${successful.length}/${results.length}`)

// Average per dimension
console.log('\n--- Average Scores (1-5 scale) ---')
for (const dim of dims) {
  const scores = successful.map(r => (r.judge as any)[dim]).filter((n: any) => typeof n === 'number')
  const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  console.log(`  ${dim.padEnd(20)} ${avg.toFixed(2)}`)
}

// Overall quality distribution
const overallScores = successful.map(r => r.judge!.overall)
console.log('\n--- Overall Quality Distribution ---')
for (let i = 5; i >= 1; i--) {
  const count = overallScores.filter(s => s === i).length
  console.log(`  ${i}/5: ${'█'.repeat(count)} (${count})`)
}

// Inflation analysis
const avgRegex = successful.reduce((a, r) => a + r.regex_score, 0) / successful.length
const avgJudge = successful.reduce((a, r) => a + r.judge!.overall, 0) / successful.length
const judgeAsPct = (avgJudge / 5) * 100  // normalize to 0-100 scale
console.log(`\n--- Inflation Analysis ---`)
console.log(`  Avg regex score:      ${avgRegex.toFixed(1)}/100`)
console.log(`  Avg judge score:      ${avgJudge.toFixed(2)}/5 (${judgeAsPct.toFixed(1)}% on 100-scale)`)
console.log(`  Gap (inflation):      ${(avgRegex - judgeAsPct).toFixed(1)} points`)

// Red flags: high regex score but low judge score
const redFlags = successful.filter(r => r.regex_score >= 90 && r.judge!.overall <= 2)
console.log(`\n--- Red Flags (regex ≥90, judge ≤2) ---`)
if (redFlags.length === 0) {
  console.log('  None! No specs with high regex scores got low judge ratings.')
} else {
  console.log(`  ${redFlags.length} specs flagged:`)
  redFlags.forEach(r => {
    console.log(`    ${r.id}: regex=${r.regex_score}, judge=${r.judge!.overall}, notes="${r.judge!.notes}"`)
  })
}

// Specificity check (the key question: boilerplate or genuine?)
const specificityScores = successful.map(r => (r.judge as any).specificity).filter((n: any) => typeof n === 'number')
const avgSpecificity = specificityScores.reduce((a: number, b: number) => a + b, 0) / specificityScores.length
const boilerplateCount = specificityScores.filter((s: number) => s <= 2).length
console.log(`\n--- Boilerplate Check ---`)
console.log(`  Avg specificity:      ${avgSpecificity.toFixed(2)}/5`)
console.log(`  Boilerplate (≤2):     ${boilerplateCount}/${specificityScores.length} (${(boilerplateCount/specificityScores.length*100).toFixed(0)}%)`)

console.log(`\nResults saved to real-specs/llm-judge-results.json`)
