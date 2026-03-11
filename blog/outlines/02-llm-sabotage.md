# Our LLM Was Sabotaging Our Scorer

**Target Audience:** Developers building LLM pipelines; teams using AI to generate or rewrite specs; anyone who's trusted an AI assistant and gotten burned by subtle output drift.

---

## Hook

We shipped a scoring bug that made every spec look worse than it was. The culprit wasn't our scorer — it was Claude. Our AI assistant was quietly rewriting action verbs into passive voice, and our regex couldn't find them. Every spec that passed through Claude before scoring took a penalty it didn't deserve.

---

## Section 1: The Bug That Wasn't Obvious

Specs were consistently scoring lower than expected — not dramatically, but enough to flag. The scores felt wrong. We started auditing.

## Section 2: What Claude Was Actually Doing

When Claude reformatted a spec for clarity, it translated imperative ACs ("Verify X appears") into declarative descriptions ("X is visible"). Technically correct English. Completely invisible to our action-verb regex. The spec meant the same thing; the scorer didn't know that.

## Section 3: Why This Is Harder Than It Sounds

This isn't a Claude bug — it's a contract problem. Our scorer expected a specific linguistic form. Our AI assistant optimized for readability. Neither was wrong. The gap between them was silent and systematic.

## Section 4: The Fix — DECLARATIVE_AC_RE

We extended the regex to match both imperative and declarative acceptance criteria forms. `DECLARATIVE_AC_RE` now catches "X is visible", "X should appear", and related passive constructions alongside the original action-verb patterns. One regex change, meaningful score recovery.

## Section 5: The Broader Lesson for AI Pipelines

Any time an LLM sits between user input and a downstream evaluator, you have a translation layer. That layer will drift. Build your evaluators to handle the realistic output distribution of your LLM — not just the ideal form you expect.

## Section 6: What We Now Test For

We added regression tests that run specs through Claude reformatting before scoring. If the score drops more than 5 points from the pre-reformat baseline, the test fails. LLM output drift is now a first-class test concern.

---

## CTA

Building an AI pipeline that scores or evaluates structured text? Test your evaluator against LLM-reformatted inputs — not just clean originals. → [speclint.ai](https://speclint.ai)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
