# Speclint Sprint Review — Eval Checklist

*Added to sprint review process March 4, 2026.*  
*Required for any sprint that modifies: `/api/refine`, `scoring.ts`, refinement prompt, or scoring dimensions.*

---

## Pre-Sprint Review (automated, run by Alexander)

- [ ] **Trace collection:** Confirm traces are being stored since last sprint
- [ ] **Eval dataset exists:** Labeled dataset at `products/speclint/evals/labeled/` has ≥50 examples
- [ ] **Run eval suite:** Pipe labeled dataset through current pipeline, compute TPR/TNR
- [ ] **Regression check:** No metric dropped >5% from baseline in `products/speclint/evals/baseline.json`

## Sprint Review Items

- [ ] **Eval metrics table:** Present TPR, TNR, and corrected pass rate
- [ ] **New failure modes:** List any new patterns from traces since last sprint
- [ ] **Scoring changes:** If rubric was modified, show before/after TPR/TNR
- [ ] **Judge updates:** If LLM judges were modified, show dev set alignment
- [ ] **Dashboard sync:** Post eval summary to Speclint dashboard activity feed

## Post-Sprint

- [ ] **Update baseline:** Save current TPR/TNR to `products/speclint/evals/baseline.json`
- [ ] **Archive traces:** Move processed traces to `products/speclint/evals/archive/`

---

## Metrics Definitions

| Metric | Meaning | Target |
|--------|---------|--------|
| **TPR** | When human says "agent-ready", does Speclint agree? | >90% |
| **TNR** | When human says "NOT agent-ready", does Speclint agree? | >90% |
| **Corrected pass rate** | Bias-corrected % of production specs that are truly agent-ready | Report only |

## Before Eval Foundation is Built (Sprint 10)

Until SL-060 through SL-063 ship, the eval gate is lightweight:
- [ ] Manually test 5 specs through the pipeline and eyeball results
- [ ] Check that scoring.ts changes don't break existing test fixtures
- [ ] Note any surprising scores for future labeled dataset

---

*Reference: products/speclint/evals/EVAL_AUDIT.md*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
