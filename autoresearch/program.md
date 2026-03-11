# Speclint Autoresearch — Agent Instructions

## Your Goal
Autonomously improve Speclint's spec refinement quality by running experiments on the refinement prompt, testing against synthetic specs, and compounding improvements.

## The Loop (repeat forever)
1. **GENERATE** — Create/maintain a bank of 50+ synthetic test specs at varying quality levels (terrible → mediocre → good → excellent)
2. **BASELINE** — Run all test specs through current prompt, record scores
3. **HYPOTHESIZE** — Identify the weakest scoring dimension (e.g. "only 40% of specs get verification steps") and form a hypothesis
4. **MUTATE** — Create a prompt variant that targets the weak dimension (ONE change at a time)
5. **TEST** — Run all test specs through the variant prompt, record scores
6. **COMPARE** — Compare variant vs baseline on ALL dimensions (not just the target)
7. **DECIDE** — If variant improves target dimension without regressing others: KEEP. If regression: REVERT
8. **LOG** — Record the experiment in experiments.jsonl

## Experiment Protocol
- Change only ONE thing per experiment (scientific method)
- Test against the FULL spec bank (not cherry-picked examples)
- Record before/after metrics per dimension
- If a change improves target dimension by ≥5% without regressing others: KEEP
- If any dimension regresses by >3%: REVERT (even if target improved)
- If mixed/marginal results: run 3 more iterations and decide on average

## What You Can Modify
- Prompt variants (stored in `prompts/` directory, NOT production code)
- Test spec bank (test-specs.json)
- strategy.json parameters
- Temperature and retry settings

## What You CANNOT Modify
- scoring.ts (deterministic rubric)
- Production code directly
- Model choice
- baseline.md

## Dimensions to Optimize (from scoring.ts)
1. **has_measurable_outcome** (20 pts) — regex: numbers, %, reduce/increase, rate/count, kpi, metric
2. **has_testable_criteria** (25 pts) — ≥2 ACs with action/declarative verbs
3. **has_constraints** (20 pts) — tags ≥2 OR assumptions OR constraint language
4. **no_vague_verbs** (20 pts) — title avoids improve/enhance/optimize/update/fix
5. **has_verification_steps** (15 pts) — verification/test/assert language anywhere in spec

## Test Spec Categories
Each category should have 10+ specs:
- **Terrible** (expect 0-20): one-liners, no context, vague verbs only
- **Mediocre** (expect 30-50): some structure, missing ACs or verification
- **Good** (expect 60-80): structured but missing one dimension
- **Excellent** (expect 85-100): all dimensions present, should score ≥70

## Output Format (experiments.jsonl)
```json
{
  "id": "exp_001",
  "timestamp": "2026-03-10T15:00:00Z",
  "hypothesis": "Adding 'Include at least one verification step' to prompt boosts has_verification_steps",
  "dimension_targeted": "has_verification_steps",
  "prompt_variant": "prompts/v1.1-verification-boost.md",
  "metrics_before": {
    "avg_score": 62,
    "agent_ready_pct": 0.45,
    "by_dimension": {
      "has_measurable_outcome": 0.72,
      "has_testable_criteria": 0.85,
      "has_constraints": 0.68,
      "no_vague_verbs": 0.80,
      "has_verification_steps": 0.35
    }
  },
  "metrics_after": { ... },
  "result": "KEEP",
  "reasoning": "Verification steps improved from 35% to 65% with no regression on other dimensions"
}
```
