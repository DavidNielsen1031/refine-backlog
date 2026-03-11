---
title: "We Applied Karpathy's Autoresearch Pattern to Our Spec Linter. We Mostly Found Bugs in Our Own Scoring."
date: 2026-03-11
author: Speclint Team
slug: autoresearch-speclint
description: "We expected to optimize our refinement prompt with Karpathy's autoresearch loop. Instead we discovered our scoring system was broken and the model was already better than we thought. Here's the honest breakdown."
---

Andrej Karpathy published the [autoresearch pattern](https://github.com/karpathy/autoresearch) — a loop where you write a baseline, define a scoring function, and let AI iterate on improving the score through systematic experiments. One change at a time. Keep what works. Revert what doesn't.

We applied it to [Speclint](https://speclint.ai), our spec quality linter for coding agents. We expected to dramatically improve our refinement prompt. Instead, we learned something more useful: **our scoring system was broken, and the model was already better than we thought.**

## The Setup

Speclint takes vague software specs and refines them into agent-ready tickets. It scores output on 5 dimensions: testable criteria, measurable outcome, constraints, specific language, and verification steps. Score ≥70 means "safe to hand to Cursor, Codex, or Claude Code."

We built the autoresearch loop:
- **Baseline:** 35 synthetic test specs across 4 quality tiers
- **Scoring:** Our own deterministic scorer — regex-based, no LLM in the evaluation loop
- **Model:** Claude Haiku (cost-locked — we're bootstrapped)
- **Protocol:** ONE change per experiment. Keep if target dimension improves ≥5% without regressing others >3%

## The First Mistake: Measuring the Wrong Thing

Experiment 1 scored our 35 synthetic specs **before** refinement:
- Average score: **45/100**
- Agent-ready: **23%**
- Worst dimension: `has_constraints` at **14%**

Naturally, we targeted constraints. Wrote a prompt variant emphasizing assumptions and scope boundaries.

Before deploying it, we ran exp_002 — the same specs scored **after** running through our production API:
- Average score: **45 → 75** (+30 points)
- `has_constraints`: **14% → 100%**

The model was already generating constraints. Our baseline had scored raw inputs, not refined outputs. The "constraints problem" we were about to optimize didn't exist.

**Lesson 1: Measure the actual system end-to-end before optimizing anything.**

## Five Experiments, Two Categories of Wins

With the false signal eliminated, the real bottleneck emerged: `has_verification_steps` at 24%. Five focused experiments followed:

**Measurement fixes (accounted for ~30 of 54 total points gained):**
- exp_005: `verificationSteps` wasn't included in the text blob our scorer evaluated. The model was generating them; we just weren't counting them. Fix: one line of code. Impact: +30 points.
- exp_007: `ACTION_VERB_RE` was too narrow — didn't include common verbs like "configure," "deploy," "integrate." The model was writing good acceptance criteria; the regex didn't recognize them.

**Genuine prompt improvements (~24 points):**
- exp_004: Added `verificationSteps` as an explicit field in the refinement prompt. Model started generating them consistently.
- exp_006: Added "each criterion MUST start with an action verb." Made acceptance criteria more actionable.
- exp_007: Added measurable outcome guidance with concrete examples.

Synthetic results after 7 experiments: **45 → 99 average, 23% → 100% agent-ready.**

Impressive numbers. But more than half the improvement came from fixing how we measure, not what the model produces. Without the one-change-at-a-time protocol, we never would have isolated that.

## Real GitHub Issues: The Honesty Test

Synthetic specs are a controlled environment. Real GitHub issues are messy, multilingual, sometimes just a single word. We pulled 194 issues across 10 repos: Next.js, React, Supabase, VS Code, Prisma, Tailwind, Deno, LangChain, OpenAI Python, and Svelte.

Results on real issues:
- Raw average: **51/100**
- Refined average: **97/100** (+46 points)
- Agent-ready: **98.9%**

But then we noticed: issues that were just "HDD" or keyboard mash also refined to score 95+. The model had learned to perfectly produce the keywords our regex looks for. High scores, questionable quality.

We shipped a garbage-in detector — 50 lines of heuristics that evaluate input quality before the LLM touches it. Speculative inputs get capped at 60 regardless of how well the model pattern-matches. It caught 2 of 194 real specs — a small number, because real GitHub issues are generally high-quality input. But it matters for the edge cases.

## LLM-as-Judge: Was the Quality Actually Real?

The score said +46 points. But was the model producing genuinely useful refinements, or just gaming our regex patterns?

We ran an independent LLM-as-judge evaluation. Sampled 27 specs across score ranges, sent each raw input + refined output to a separate Claude instance, and asked it to rate quality on 5 dimensions (1-5 scale):

**Results (24 successful evaluations):**
- **Accuracy:** 4.88/5 — refined specs preserve original intent without hallucinating requirements
- **Completeness:** 4.92/5 — added acceptance criteria, constraints, and verification steps are genuinely useful
- **Specificity:** 4.92/5 — additions are specific to each feature, not generic boilerplate
- **Over-specification:** 4.71/5 — minimal unnecessary constraints added
- **Relevance:** 5.00/5 — verification steps are relevant to the actual feature
- **Overall:** 4.90/5

21 out of 24 specs scored a perfect 5. Zero specs flagged as boilerplate. Zero red flags where high regex scores masked low actual quality.

The quality was real. The model wasn't gaming — it was genuinely producing specific, useful, actionable refinements. Our regex scorer happened to correlate well with actual quality, even though that was somewhat accidental.

## What We Actually Learned

### 1. The model was already good. We just couldn't see it.

Before we started, Speclint's refinement was already producing 4.9/5 quality output according to independent evaluation. The autoresearch process didn't dramatically improve quality — it found bugs in our measurement system that were hiding how good it already was.

This is probably more common than people realize. If you're using a frontier model and a well-structured prompt, the model might already be doing a good job. Your scoring system might be the bottleneck.

### 2. Autoresearch is a diagnostic tool disguised as an optimization tool

The one-change-at-a-time protocol is brutal but clarifying. When exp_004 added verification step guidance and the score barely moved, it forced us to ask why — and we found the scorer wasn't counting verification steps at all. Without that protocol, we'd have changed three things at once and credited the wrong one.

The pattern's greatest value wasn't the score improvement. It was systematically revealing what was broken in our evaluation pipeline.

### 3. Synthetic test suites lie to you in a specific way

Our 35 synthetic specs had expected score ranges (e.g., "terrible_01: expect 0-30"). After refinement, score-in-range accuracy was **11%**. Every "terrible" spec refined to 90+, which was correct behavior — but our test suite called it wrong.

If you build a test suite before understanding what your system does, you'll optimize against your own misconceptions.

### 4. When your model scores 100% on everything, you have a measurement problem

86.6% of refined outputs scored exactly 100 on our regex scorer, including garbage inputs. The scorer checks for keyword presence, not quality. The model learned to perfectly produce those keywords. The garbage-in detector was the fix — but the real lesson is: **if your evaluation can be gamed, it will be gamed, even unintentionally.**

### 5. LLM-as-judge is the credibility layer you need

The regex scorer told us +46 points. The LLM judge told us the quality is 4.9/5 and genuinely specific to each feature. Both are useful signals, but only the judge answers the question users actually care about: "Is this output actually good?"

If you're building an AI product and only evaluating with deterministic heuristics, you're measuring the shadow on the wall.

## The Numbers

**Autoresearch progression (synthetic, 35 specs):**
- Baseline (raw inputs): avg 45, 23% agent-ready
- After 7 experiments: avg 99, 100% agent-ready
- ~30 points from measurement fixes, ~24 from prompt improvements

**Real-world validation (194 GitHub issues, 10 repos):**
- Raw → refined delta: 51 → 97 (+46 points)
- Agent-ready: 98.9%

**LLM-as-Judge (24 evaluated specs):**
- Overall quality: 4.90/5
- Specificity (not boilerplate): 4.92/5
- Accuracy (no hallucination): 4.88/5
- Boilerplate rate: 0%

## Should You Try This?

Yes, but calibrate your expectations. If you're hoping autoresearch will turn a mediocre prompt into a great one, it might. But if your prompt is already decent, the pattern's real value is exposing problems in your evaluation system.

Go in expecting to find measurement bugs. You'll either be right (and fix something important) or pleasantly surprised (and have the data to prove your system works).

The pattern works. Just don't confuse "the score went up" with "the product got better." Sometimes those are the same thing. Sometimes the score was just broken.

---

*[Speclint](https://speclint.ai) is an open-source spec linter for coding agents. Score your specs, fix the gaps, ship better code. Free at [speclint.ai](https://speclint.ai) or [view on GitHub](https://github.com/DavidNielsen1031/speclint).*
