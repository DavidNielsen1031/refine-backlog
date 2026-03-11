# Sprint 10 Full Persona Review — Pre-Ship Pass

**Reviewer:** 10 personas + Alexander (Governor)
**Scope:** Complete branch diff main → sprint/speclint/s10 (13 files, +1,723 lines)
**Date:** 2026-03-09

---

## Customer Personas (6)

### Jake (Buyer) — 🟡 SHOULD-FIX

1. **[HIGH]** `codebase_context` and `target_agent` are only gated in `/api/rewrite`, but `/api/refine`'s `auto_rewrite` path (Jake's preferred single-call flow) has **no codebase_context passthrough**. Jake pays for codebase-aware rewrites but can't use them via his preferred endpoint — forced into a second call.
2. **[MEDIUM]** GitHub Action has no `codebase-context` or `target-agent` inputs. Sprint 10's two highest-value features are invisible from the Action YAML.
3. **[MEDIUM]** The `x-source: github-action` header is sent but never verified server-side. No audit trail separation between Action vs. direct API.
4. **[LOW]** Free tier returns `changes[]` — the full change playbook. Moat is thin when the recipe is free.

### Sam (Operator) — 🔴 BLOCKER

1. **[BLOCKER]** `GITHUB_TOKEN: ${{ env.GITHUB_TOKEN }}` in composite action steps is wrong. Composite actions can't access `secrets.*` directly — calling workflows must set it as an env var. Not documented. First-time users get silent `gh` auth failures.
2. **[HIGH]** Score threshold: `if [ "$SCORE" -lt "$SPECLINT_THRESHOLD" ]` uses bash integer arithmetic. `jq` could return a float (e.g. `72.5`) from future API changes → "integer expression expected" crash.
3. **[HIGH]** Threshold failure emits `::warning::` but does NOT `exit 1`. CI pipelines expecting non-zero exit codes silently pass. Needs configurable `fail-on-threshold`.
4. **[MEDIUM]** `/tmp/speclint-result.json` has no unique path. Matrix builds or concurrent jobs on self-hosted runners will race.
5. **[LOW]** `jq`, `curl`, `gh` used but not listed as dependencies. Silent fail on custom runners.

### Maya v2 (Solo Dev) — 🟡 SHOULD-FIX

1. **[HIGH]** No way to enter a **paid** license key in the spec tester. "Fix it" only offers "Get free key." `change key` clears localStorage but shows no re-entry form. Maya paying $29/mo is stuck on free tier in the homepage tester.
2. **[HIGH]** No before/after diff view. Changes list shows *what* changed but not *where*. Biggest UX gap vs. ChatGPT.
3. **[MEDIUM]** "Fix it" button only shown when `score < 70`. Score of 71 with a failing dimension? No button. Should be `has any failing dimensions`, not score threshold.
4. **[MEDIUM]** Spec tester calls `/api/lint` not `/api/refine`. If behavior differs, Maya gets inconsistent scores between tester and API.
5. **[LOW]** `animateCounter` uses `requestAnimationFrame` with no cleanup on unmount. Leaks rAF loop if user navigates away mid-animation.

### Priya (Engineering PM) — 🟡 SHOULD-FIX

1. **[HIGH]** Zero Linear/Jira integration visible. Priya's #1 workflow is unaddressed. If not in scope, remove from persona target list.
2. **[MEDIUM]** RemediationSection now has "Path A" and "Path B" — added cognitive load for a non-technical PM selling this to a VP.
3. **[MEDIUM]** 4-tier pricing stacked on mobile: Lite/Free cards look equal weight. "Most popular" Solo card loses visual hierarchy when stacked vertically.
4. **[LOW]** Lite plan says "All 5 scoring dimensions" — but Free also scores all 5. Priya can't explain to VP why Lite > Free from the copy alone.
5. **[LOW]** No ROI calculator or time-savings metrics. "Proves ROI to VP" remains unaddressed.

### Kai (Pipeline Operator) — 🟡 SHOULD-FIX

1. **[HIGH]** **Latency SLA broken for chained rewrites.** `max_iterations: 3` on 5 items = up to 15 LLM calls. No timeout or circuit breaker. Kai's pipeline stalls.
2. **[HIGH]** `/api/refine`'s `auto_rewrite` doesn't accept `codebase_context`. Kai's single-call value prop is broken — must call `/api/rewrite` separately.
3. **[MEDIUM]** `changes[]` described as "category-level not content-level" is entirely LLM-enforced, not schema-enforced. No deterministic field contract.
4. **[MEDIUM]** No `X-RateLimit-Remaining` or `X-RateLimit-Reset` headers. Pipeline can't pre-check limits without real requests.
5. **[LOW]** `Infinity` in `TIER_LIMITS` would serialize as `null` in JSON if ever exposed. Currently masked by early-exit but fragile.

### Derek (Skeptic) — 🟡 SHOULD-FIX

1. **[HIGH]** Free tier returns detailed `changes[]`. Derek's objection is "I can do this in ChatGPT." Giving him the full rewrite recipe for free validates that objection.
2. **[MEDIUM]** `<30 min setup` promise broken by Action GITHUB_TOKEN confusion (see Sam's blocker).
3. **[MEDIUM]** Free rewrite requires email → wait for key → paste key. 3+ steps and 30-60s friction at the "I'm curious" moment. Derek closes the tab.
4. **[LOW]** No "score guarantee" social proof hook. No visual before/after jump metric on the homepage.
5. **[LOW]** Free CTA "Get Started Free" links to `/get-key` but inline key form exists in tester. Inconsistent conversion paths.

---

## Quality Personas (4)

### Quinn (QA) — 🟡 SHOULD-FIX

1. **[HIGH]** `handleRequestKey` validates email with `keyEmail.includes('@')` only. Input `@` alone passes. Backend normalizes to `@undefined` → KV collision or silent failure.
2. **[HIGH]** In `refine/route.ts`: `auto_rewrite` and `rewrite_mode` assigned before validation blocks. If early returns are ever reordered, stale values persist.
3. **[MEDIUM]** `showFixIt` requires `score < 70` AND `has failing dimensions`. These can diverge due to weighting. If all scored dims pass but score < 70 (impossible with current weights, but fragile), or score ≥ 70 with failures, Fix It logic breaks.
4. **[MEDIUM]** SVG score display has no `aria-label` or `role`. Textarea has no label pairing. Screen readers can't access core functionality.
5. **[LOW]** GitHub Action: if `jq` fails on malformed JSON, `HAS_REWRITE` is empty, silently skipping rewrite comment without error.
6. **[LOW]** `animateCounter` fires 800ms of rAF even when `from === to` (no-op animation).

### Morgan (Code Review) — 🟡 SHOULD-FIX

1. **[HIGH]** **Duplicate types.** `RewriteMode` and `TargetAgent` defined independently in both `refine/route.ts` and `rewrite/route.ts`. Will drift when one changes. Belongs in shared `@/lib/types`.
2. **[HIGH]** **Prompt divergence.** `REWRITE_SYSTEM_PROMPT` (refine) is static string. `buildSystemPrompt()` (rewrite) is dynamic builder. Shared gap-guidance maintained separately → scoring inconsistency between `/api/refine?auto_rewrite=true` and `/api/rewrite`.
3. **[MEDIUM]** `parseRewrittenToRefinedItem` fallback regex extracts ACs by action verbs. Specs without action verbs fall back to `[title]` — single-item AC array that scores poorly. Silent bad re-scores.
4. **[MEDIUM]** `checkRewriteRateLimit` KV failure fallback returns `{ allowed: true, remaining: 1 }` for paid tiers. `remaining: 1` is a lie — implies near-limit when actually unlimited. Should be `undefined` or `-1`.
5. **[LOW]** `DISPOSABLE_DOMAINS` hardcoded Set of 20 domains. Trivially bypassed. Requires code deploy to update. Should be in KV/config.
6. **[LOW]** `MAX_REWRITE_ITEMS = 5` not exported or tested. Magic constant with no boundary test.

### Sasha (Mobile/Responsive UX) — 🟡 SHOULD-FIX

1. **[HIGH]** **iOS scroll trap:** Rewritten spec `<pre>` has `max-h-80 overflow-y-auto`. On iOS Safari, nested scrollable elements require two-finger swipe — users scroll the whole page instead, feel stuck, give up on copy step.
2. **[HIGH]** **iOS auto-zoom:** Textarea `font-mono text-sm` (14px) triggers iOS zoom-on-focus when font-size < 16px. Breaks two-column layout. Need `text-base` or `font-size: 16px` minimum.
3. **[MEDIUM]** Score circle SVG at `w-32 h-32` dominates mobile viewport. On 375px iPhone, circle + breakdown + button compete for space above the fold. Score should shrink on mobile.
4. **[MEDIUM]** Key form inline input + button on small screens: email input and "Get Key" button cramped at <375px. Needs stacked layout on `sm:`.
5. **[LOW]** Blur overlay on free tier preview uses `blur-sm` which is inconsistent across browsers. Some Android Chrome versions render it as fully opaque.

### Sam Security — 🔴 BLOCKER

1. **[BLOCKER]** **License key transmitted in POST body.** Every request log, CDN log, WAF log, and middleware proxy that inspects request bodies captures the key. This is a credential — should be in `Authorization` header or `X-License-Key` header, not request body. Vercel Functions log request bodies at certain log levels.
2. **[HIGH]** `checkRateLimitKV` for free key issuance uses IP from `x-forwarded-for`. Attacker behind a rotating proxy bypasses the 5/day IP limit trivially. Should be defense-in-depth with a global daily cap (e.g., 100 free keys/day total).
3. **[HIGH]** No CSRF protection on `/api/issue-free-key`. Any page can POST to this endpoint and farm keys. Should check `Origin`/`Referer` header matches `speclint.ai`.
4. **[MEDIUM]** `normalizeEmail` strips `+` aliases but doesn't handle subdomain addressing (e.g., `user@subdomain.gmail.com`). Edge case but known farming vector.
5. **[MEDIUM]** Free key format `SK-FREE-{12 hex chars}` has only 48 bits of entropy. Brute-forceable in targeted attacks. Should be longer or include a checksum.
6. **[LOW]** `localStorage` stores license key in plaintext. Any XSS on the domain reads all keys. Documented risk but no CSP headers visible in the diff to mitigate.

---

## 🦊 Alexander (Governor) — 🟡 SHOULD-FIX

**Architecture coherence:**
The sprint delivered 6 major features across 2 endpoints with significant prompt and schema overlap but no shared abstractions. `/api/refine` and `/api/rewrite` are diverging into separate products that happen to share a URL prefix. The `auto_rewrite` path in refine is a junior version of the rewrite endpoint — missing codebase_context, structured output, and agent targeting. This creates a confusing API surface: "which endpoint do I call?" should have one answer, and right now it has two incomplete ones.

**Revenue impact:**
The features themselves are strong. Surgical rewrite, codebase context, and agent targeting are genuine differentiation from ChatGPT — but only accessible via `/api/rewrite`. The single-call value prop (Jake's and Kai's #1 ask) is half-baked because `auto_rewrite` in refine can't access the premium features. This means our two highest-value personas can't use their preferred endpoint for the features they'd pay for.

**What I'd change before shipping:**
1. **Fix Sam's BLOCKER** — the GITHUB_TOKEN issue in action.yml is a day-1 breakage for every Action user
2. **Fix Sam Security's BLOCKER** — move license key to `Authorization: Bearer SK-FREE-xxx` header. This is a one-line change on both sides but critical for credential hygiene
3. **Maya's paid key entry** — if paid users can't use paid features in the homepage demo, we're leaving conversion proof on the table
4. **Merge the prompts** — `buildSystemPrompt()` from rewrite should be the shared implementation. Having two prompt paths that drift is a ticking time bomb for scoring consistency
5. **Add `codebase_context` passthrough to auto_rewrite** — without this, the single-call endpoint is a demo, not a product

**Ship/no-ship:** FIX SAM'S BLOCKER + SAM SECURITY'S BLOCKER → then ship to preview. The should-fixes are real but can be Sprint 10.1.

---

## SYNTHESIS

### 🔴 Blockers (must fix before ship) — 3

| # | Source | Finding | Effort |
|---|--------|---------|--------|
| B1 | Sam Operator | GITHUB_TOKEN in composite action broken — silent auth failures | 30min |
| B2 | Sam Security | License key in POST body = credential in logs | 1hr |
| B3 | Sam Security | No CSRF on /api/issue-free-key — any page can farm keys | 30min |

### 🟡 High-Impact Should-Fixes — ranked

| # | Source | Finding | Effort |
|---|--------|---------|--------|
| S1 | Jake + Kai | `codebase_context` not passed through `auto_rewrite` in refine | 1hr |
| S2 | Morgan | Prompt divergence between refine and rewrite (scoring will drift) | 2hr |
| S3 | Maya v2 | No paid key entry in spec tester — paid users stuck on free tier | 1hr |
| S4 | Morgan | Duplicate `RewriteMode`/`TargetAgent` types across 2 files | 30min |
| S5 | Sasha | iOS auto-zoom on textarea (font-size < 16px) | 15min |
| S6 | Sasha | iOS scroll trap on rewritten spec `<pre>` | 30min |
| S7 | Quinn | Email validation accepts bare `@` | 15min |
| S8 | Sam Operator | No `exit 1` on threshold failure — CI silently passes | 30min |
| S9 | Quinn | No accessibility on score SVG or textarea | 30min |
| S10 | Derek | Free tier changes[] = free ChatGPT recipe | Design decision |

### 📊 Verdict Tally

| Persona | Verdict | Findings |
|---------|---------|----------|
| Jake (Buyer) | 🟡 | 4 |
| Sam (Operator) | 🔴 | 5 |
| Maya v2 (Solo Dev) | 🟡 | 5 |
| Priya (Engineering PM) | 🟡 | 5 |
| Kai (Pipeline Operator) | 🟡 | 5 |
| Derek (Skeptic) | 🟡 | 5 |
| Quinn (QA) | 🟡 | 6 |
| Morgan (Code Review) | 🟡 | 6 |
| Sasha (Mobile UX) | 🟡 | 5 |
| Sam Security | 🔴 | 6 |
| **Alexander** | **🟡** | **5** |
| **TOTAL** | **2 🔴 / 9 🟡** | **57 findings** |

### Ship Recommendation

**NO SHIP until B1-B3 fixed.** Then ship to preview. S1-S6 should land before production. S7-S10 can be Sprint 10.1.
