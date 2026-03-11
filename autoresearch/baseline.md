# Speclint Autoresearch — Baseline (NEVER MODIFIED BY AGENT)

## What Speclint Does
Scores specs 0-100 across 5 dimensions, explains weaknesses, and rewrites to improve.
Three surfaces: web app (speclint.ai), GitHub Action, MCP server.

## Scoring Dimensions (from scoring.ts)
- **has_measurable_outcome** (20 pts) — spec has measurable/observable outcome language
- **has_testable_criteria** (25 pts) — ≥2 acceptance criteria with action verbs
- **has_constraints** (20 pts) — tags ≥2 OR assumptions present OR constraint language
- **no_vague_verbs** (20 pts) — title avoids "improve/enhance/optimize/update/fix" without specificity
- **has_verification_steps** (15 pts) — spec shows HOW to verify it works

Agent-ready threshold: score ≥ 70

## Constraints
- Model: claude-haiku-4-5 (cost ceiling — cannot switch to larger model)
- Scoring is deterministic (regex-based in scoring.ts) — NOT LLM-scored
- Refinement prompt is LLM-based (the thing we're optimizing)
- No changes to scoring.ts without human approval
- All experiments must be non-destructive (never modify production prompts directly)

## Scoring
- Primary: % of agent-ready specs (score ≥ 70) — higher is better
- Secondary: Average score improvement (refined score - input baseline)
- Tertiary: Score consistency (low variance across similar input quality)
- Calibration: human labels when available (SL-062)

## Codebase Paths
- Refinement prompt: `products/refine-backlog/app/src/app/api/refine/route.ts` (REFINEMENT_PROMPT const)
- Scoring logic: `products/refine-backlog/app/src/lib/scoring.ts`
- Rewrite prompt builder: `products/refine-backlog/app/src/lib/rewrite-prompt.ts`
- Traces API: `/api/traces` (Upstash KV, keyed by date)
- Internal API key: in Vercel env vars (INTERNAL_API_KEY)

## What the Agent CANNOT Change
- scoring.ts (deterministic rubric — David must approve)
- Model choice (claude-haiku-4-5 is cost-locked)
- This file
- Production deployment (agent cannot deploy to Vercel)
