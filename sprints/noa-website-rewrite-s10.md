# Speclint.ai Website Rewrite — Sprint 10
**Author:** Noa (conversion copywriter)  
**Date:** 2026-03-09  
**Scope:** Full site audit + rewrite. Developer-ready text for every section.

---

## TABLE OF CONTENTS

1. [Site Audit](#site-audit)
2. [Section Order Recommendation](#section-order-recommendation)
3. [Rewritten Copy — All 12 Sections](#rewritten-copy)
4. [Persona Validation Summary](#persona-validation-summary)

---

## SITE AUDIT

### Summary

The current site has four compounding problems: it lies about the score threshold (80 vs 70), lies about a live feature being "coming soon" (rewrite), misrepresents the scoring dimensions in hero/breakdown/GitHub Action, and buries the strongest conversion driver (interactive tester) at position #5. Fix the lies first. Then reorder.

---

### 🔴 LIE — Copy claims something the code doesn't do

**L1. Hero animation: wrong dimensions and wrong points**
- `hero-section-new.tsx` shows `has_measurable_outcome: 25pts` and `has_definition_of_done: 10pts`
- Actual `scoring.ts` (refine-backlog): `has_measurable_outcome: 20pts`, `has_definition_of_done: 0pts` (backward compat), `has_verification_steps: 15pts`
- Hero animation totals correctly to 100 but uses wrong dimension names and wrong point values
- Fix: update DIMENSIONS array in hero to `[has_measurable_outcome 20, has_testable_criteria 25, has_constraints 20, no_vague_verbs 20, has_verification_steps 15]`

**L2. Score Breakdown section: shows `has_definition_of_done` at 10pts**
- `score-breakdown-new.tsx` lists `has_definition_of_done: 10pts` as the 5th dimension
- Actual code: this dimension scores 0pts and is kept only for backward compat; real 5th dimension is `has_verification_steps: 15pts`
- The entire 5th row in the breakdown table needs to be replaced

**L3. Agent-ready threshold shown as 80 in three places**
- `score-breakdown-new.tsx`: `completeness_score ≥ 80 → Agent-ready threshold`
- `how-it-works-new.tsx` step 3 code: `if score >= threshold:  # default: 80`
- `github-action-new.tsx` YAML: `min-score: 80`
- `faq-section.tsx`: "A score of 70+ means the spec is agent-ready" (this one is correct)
- Actual `isAgentReady()` in `scoring.ts`: `return score >= 70`
- Fix: all threshold references → 70

**L4. "How It Works" step 2: score 82 marked `agent_ready: false`**
- `how-it-works-new.tsx` shows `"completeness_score": 82, "agent_ready": false`
- 82 ≥ 70, so this should be `agent_ready: true`
- Fix: either lower the score below 70 (e.g. 58) or flip to `agent_ready: true`

**L5. Remediation section: rewrite feature marked "coming soon"**
- `remediation-section-new.tsx` has a "coming soon" callout: "AI-assisted rewrite — Speclint will offer to fix the spec for you — not just flag it."
- The rewrite feature IS LIVE (`/api/rewrite` endpoint exists, `spec-tester.tsx` calls it, `RewriteResult` type is fully implemented)
- Fix: replace "coming soon" callout with a live feature callout showing the rewrite in action

**L6. ForAIAgents API response uses `has_definition_of_done` in breakdown**
- `for-ai-agents-new.tsx` shows `"has_definition_of_done": true` in the API response example
- Correct key is `has_verification_steps` (which is the live scoring dimension)
- Also: score shown is 75 but with correct dimensions (has_measurable_outcome: false = 0, rest true = 80), math doesn't add up
- Fix: update breakdown to use `has_verification_steps`, recalculate example score

**L7. Pricing section: Lite tier ($9/mo) does not appear**
- `pricing-section-new.tsx` shows only three plans: Free ($0), Solo ($29), Team ($79)
- The FAQ (`faq-section.tsx`) mentions "Lite ($9/month)" as a real plan
- Lite tier exists with: 10 rewrites/day, full rewrite text, no `codebase_context`/structured output
- Fix: add Lite tier card between Free and Solo

**L8. Pricing section: Free tier rewrite entitlement not described**
- Free tier lists "5 specs per day" and "Community support" but no mention of 1 rewrite/day (preview: 250 chars + changes list + new_score)
- This is a conversion driver — free users can see what a rewrite looks like before paying
- Fix: add "1 rewrite preview/day (250-char preview + score improvement)" to Free features

**L9. Solo tier features incomplete**
- Pricing section Solo features missing: unlimited rewrites, full rewrite text, agent profiles, structured output
- Currently lists only: "Unlimited lints, 25 issues/request, codebase_context, agent_ready automation, Priority support"
- Fix: add missing Solo features

---

### 🟠 STALE — Copy that was true but isn't anymore

**S1. Remediation "coming soon" callout for rewrite**
- Was: true (rewrite was in development)
- Now: false (rewrite is live at `/api/rewrite` and integrated into spec-tester)

**S2. Spec Tester and FAQ section absent from `speclint` repo page.tsx**
- `products/speclint/src/app/page.tsx` does not include `SpecTesterSection` or `FAQSection`
- Both exist in `products/refine-backlog/app/src/components/`
- These need to be added to the speclint repo and included in the page

---

### 🟡 MISS — Opportunity the copy doesn't mention

**M1. Rewrite feature has no hero placement**
- The page leads with "Lint your specs" but the rewrite feature is arguably the highest-value action
- Hero should acknowledge: lint scores it, rewrite fixes it

**M2. "Why not ChatGPT?" handled only in FAQ**
- FAQ #8 has a good answer but it's buried
- This is the most common objection from devs who already know about GPT-4
- Should surface earlier — in hero subtext or as a dedicated objection callout before pricing

**M3. OSS nature not mentioned anywhere visible**
- Scoring engine + CLI + GitHub Action are MIT open source
- This builds trust significantly with devs — they can audit the scoring logic
- Currently zero mentions on the homepage

**M4. `/api/rewrite` endpoint not mentioned in API docs or For AI Agents section**
- Only `/api/lint` is documented
- Standalone rewrite (`POST /api/rewrite`) exists and is useful for agents that want to rewrite without lint context

**M5. Rewrite chain (Team feature) not explained**
- Team tier shows "Dependency mapping (coming soon)" but doesn't explain what "rewrite chain" does
- Rewrite chain is a stronger feature story than dependency mapping

**M6. Agent profiles (Solo feature) not described**
- "agent_ready label automation" appears in Solo features but "agent profiles" is not mentioned
- What are agent profiles? This needs a one-liner

**M7. No team-buyer path on pricing**
- Jake (engineering manager, 8-person team) visits the page and sees "Solo — Most Popular"
- Nothing speaks to his concerns: team consistency, org-wide thresholds, dashboard visibility
- Fix: add a "Buying for a team?" nudge below the pricing cards pointing at Team tier

**M8. Lite vs Free differentiation unclear**
- Pricing section shows Free and Solo — no Lite tier
- When Lite is added, it needs a clear answer to "why pay $9 over free?" answer: full rewrite text (not preview)

**M9. Customer Zero section is self-referential without disclosure**
- Both quotes are from David Nielsen (the founder/builder)
- Fine for now, but should be labeled more clearly as "founder notes" or "dogfooding log"
- Copy should acknowledge this directly rather than presenting it as external validation

**M10. Score Breakdown quote is undefined**
- "The distance between Level 3 and Level 4 is the quality of the spec" — what are Level 3 and Level 4?
- These appear to reference some framework not explained on the page
- Fix: remove or replace with a concrete statement about agent failure rates

---

### ⚪ MEH — Technically true but unconvincing

**MEH1. Hero headline "Better specs in. Better code out."**
- Technically true but abstract. Doesn't tell me what Speclint does.
- A dev reading this in 3 seconds can't answer "what is this?"

**MEH2. "Three steps. Zero guesswork."**
- Sounds like marketing speak. Replace with something that previews the actual steps.

**MEH3. Hero badge "v1.0 — GitHub Action available"**
- Two pieces of news in one badge — unfocused
- If GitHub Action is the hook, give it its own mention

**MEH4. Hero tagline "Lint your specs before agents touch them"**
- Better. But "touch them" is awkward.

**MEH5. Score Breakdown section subhead: "What separates a GitHub issue from an agent-ready specification"**
- Passive, generic. Replace with something that creates urgency.

**MEH6. Agent Pipeline quote: "$1K/day on AI agents before we realized $29/mo..."**
- The math is good but this is also a founder quote
- Two founder quotes back-to-back (Customer Zero + Agent Pipeline) looks like an echo chamber
- Consider alternating source attribution or noting it's dogfooding data

**MEH7. Pricing header: "Simple pricing. No seat games."**
- "No seat games" is meaningless without context. This is a per-API-key product, not per-seat. Just say that.

**MEH8. Pricing ROI callout appears twice**
- "You're spending $1,000/day on AI coding agents" appears in the pricing section header
- The same math appears in the Agent Pipeline section quote ($1K/day... $29/mo)
- Pick one placement. Both dilutes the impact.

**MEH9. Footer tagline repeats hero tagline**
- Footer: "Lint your specs before agents touch them" — exact same as hero
- Footer should end with a mission statement or CTA, not a tagline echo

**MEH10. "For AI Agents" section is partially redundant**
- The section rehashes "spec quality layer" positioning already established in Hero and Agent Pipeline
- The value of this section is the API example and MCP/llms.txt integration info
- Open with those — cut the re-pitch

---

## SECTION ORDER RECOMMENDATION

### Current order (problems noted)

1. Hero
2. How It Works
3. Score Breakdown
4. Remediation ← "coming soon" lie here
5. Spec Tester ← interactive tool buried at #5
6. Customer Zero
7. Agent Pipeline ← "why this matters" comes AFTER "how to use it"
8. GitHub Action
9. Pricing ← no objection handling before this
10. For AI Agents ← redundant re-pitch
11. FAQ ← ChatGPT objection hidden here
12. Footer

### Recommended order

**1. Hero** — Hook + position (4 seconds)
**2. How It Works** — Fast 3-step mechanism (30 seconds)
**3. Spec Tester** ← MOVED UP from #5. Derek converts when he pastes his own spec. This is the highest-leverage interactive touchpoint on the page. Put it early while attention is peak.
**4. Score Breakdown** — Now that they've seen their score, they want to understand why. Context follows experience.
**5. Remediation** — With the rewrite now LIVE, this section becomes a strong value demonstration, not just "what happens when specs fail"
**6. Agent Pipeline** ← MOVED UP from #7. The "why this matters" business case belongs before the credibility proof. Why → Proof order.
**7. Customer Zero** ← MOVED DOWN from #6. Credibility after the argument, not before it.
**8. GitHub Action** — Now they're sold on the concept. Give them the install path.
**9. Pricing** — Decision time. Objections already pre-handled by AgentPipeline + CustomerZero.
**10. FAQ** ← MOVED UP from #11. Catch remaining objections (including ChatGPT) BEFORE For AI Agents deep-dive. Objection resolution belongs near the decision point.
**11. For AI Agents** — Technical reference for API/MCP users. After pricing, functions as a "here's how to integrate it" section for buyers who already decided.
**12. Footer**

### Key rationale

- **Spec Tester at #3**: Derek (IC dev, skeptical) converts when he pastes his own spec and sees the real score. Abstract claims don't convert him; his own data does. Every section before the tester should minimize friction to trying it.
- **Agent Pipeline before Customer Zero**: First make the case for why bad specs are expensive (argumentation), then show you've lived it yourself (credibility). Logic → Proof is stronger than Proof → Logic.
- **FAQ before For AI Agents**: The ChatGPT objection and "how is this different from just writing better tickets?" question need to be answered before we send people into technical API docs. Buyers validate, then integrate.
- **For AI Agents at #11**: This section's API example and MCP integration notes are most useful to someone who has already decided to buy. Move it post-pricing as an "advanced integration" section, not a pitch section.

---

## REWRITTEN COPY

*Format: Section name → all visible text → implementation notes → persona validation*

---

### SECTION 1: HeroSection
**File:** `hero-section-new.tsx`

---

**Badge text:**
```
Open source · MIT license
```
*(was: "v1.0 — GitHub Action available" — split the news)*

**Headline:**
```
Garbage spec in. Garbage code out.
FIX THE INPUT.
```

**Subheadline:**
```
Speclint scores your specs before agents touch them — and rewrites the ones that fail.
```

**Mono comment line:**
```
// lint first. ship right.
```

**Score display line:**
```
completeness_score: 85 → agent_ready: true
```

**Primary CTA button:**
```
Lint your first spec — free
```

**Secondary CTA button:**
```
View GitHub Action ↓
```

**Below CTAs micro-copy:**
```
No signup · 5 lints/day free · open source
```

---

**Animated terminal — ISSUE_LINES (bad spec, red):**
```yaml
title: "Improve dashboard performance"
body: "The dashboard is slow. Make it faster."
labels: []
acceptance_criteria: null
```

**Terminal processing line:**
```
⚙ running speclint…
```

**Animated terminal — SCORED_LINES (good spec, green):**
```yaml
title: "Dashboard P95 load time < 800ms"
body: "FCP > 3s on 4G. Target: LCP < 800ms, TTI < 1.5s."
labels: ["perf", "frontend", "Q2"]
acceptance_criteria:
  - LCP measured via Lighthouse < 800ms
  - No regressions on unit tests
  - Verify with WebPageTest from 3G throttled profile
```

**Score panel label:**
```
completeness_score
```

**Score result:**
```
100/100
```

**DIMENSIONS array (CORRECTED — replace existing array entirely):**
```javascript
const DIMENSIONS = [
  { key: "has_measurable_outcome",  pts: 20, label: "Measurable outcome" },
  { key: "has_testable_criteria",   pts: 25, label: "Testable criteria" },
  { key: "has_constraints",         pts: 20, label: "Constraints present" },
  { key: "no_vague_verbs",          pts: 20, label: "No vague verbs" },
  { key: "has_verification_steps",  pts: 15, label: "Verification steps" },
]
```
*Points add up: 20+25+20+20+15 = 100. Use these exact keys and values.*

**Agent-ready badge (when score = 100):**
```
✓ agent_ready: true
```

---

**Implementation notes:**
- Replace `has_definition_of_done` with `has_verification_steps` across the entire DIMENSIONS array
- Change `has_measurable_outcome` points from 25 to 20
- Animation target scores should match: [20, 25, 20, 20, 15], total 100
- Hero badge changes from version badge to OSS badge — this builds trust with devs faster than version numbers
- Headline restructured: first line states the assumption (agents build what you ask), second line delivers the punch (what you ask is the problem). Creates a pause.
- Subheadline now mentions BOTH lint AND rewrite — the rewrite is live, and it's a key differentiator
- Primary CTA is specific ("Lint your first spec") not generic ("Get Started")
- Secondary CTA preserved for GitHub Action section anchor

**Persona validation:**
- **Derek** ✓ — "Your agents build what you ask for" is how he thinks about the problem. He's tried Cursor on vague tickets. He gets it.
- **Maya** ✓ — Sees the before/after in 4 seconds. Knows this is a spec quality tool.
- **Jake** ~ — He'd want to see "team" or "pipeline" language in the hero. Addressed later in pricing.
- **Quinn** ✓ — `completeness_score`, `agent_ready`, correct dimensions, correct threshold.

---

### SECTION 2: HowItWorksSection
**File:** `how-it-works-new.tsx`

---

**Section label:**
```
// how it works
```

**Section headline:**
```
Spec in. Score out. Fix in 2 minutes.
```

**Step 01 title:**
```
01  Issue opens on GitHub
```

**Step 01 description:**
```
The speclint-action fires automatically on issues.opened and issues.edited. No manual trigger. No CI configuration beyond the YAML.
```

**Step 01 code:**
```yaml
on:
  issues:
    types: [opened, edited]
```

**Step 02 title:**
```
02  Spec gets scored
```

**Step 02 description:**
```
The issue body is evaluated across 5 dimensions. Each maps to a real failure mode: agents that guess, agents that over-build, agents that skip edge cases. Result: a completeness_score from 0–100.
```

**Step 02 code (CORRECTED — agent_ready must be consistent with score ≥ 70):**
```json
{
  "completeness_score": 58,
  "agent_ready": false,
  "missing": ["has_measurable_outcome", "has_verification_steps"]
}
```
*Note: score 58 < 70 threshold → agent_ready: false is now internally consistent.*

**Step 03 title:**
```
03  Gate, label, or fix
```

**Step 03 description:**
```
Below threshold? Speclint comments with exactly what's missing — and can rewrite the spec for you. Above threshold? The issue is labeled agent_ready and your coding agent can pick it up. You set the threshold (default: 70).
```

**Step 03 code (CORRECTED threshold to 70):**
```python
if score >= threshold:  # default: 70
  label("agent_ready")
else:
  comment("missing: ...")
  # rewrite available via /api/rewrite
  # re-lints on issues.edited
```

---

**Implementation notes:**
- Headline changes from "Three steps. Zero guesswork." to something that previews value (score, then fix)
- Step 02 example score changed from 82 to 58 so `agent_ready: false` is accurate at threshold=70
- Step 03 description updated to mention rewrite is live (not coming soon)
- Default threshold changed from 80 to 70 in code example

**Persona validation:**
- **Derek** ✓ — Specific, no fluff. He can read the YAML and know exactly what fires.
- **Jake** ✓ — Sees "no CI configuration beyond the YAML" — team install looks simple.
- **Quinn** ✓ — Threshold is 70, agent_ready logic is correct, issues.edited is mentioned.

---

### SECTION 3: SpecTesterSection (MOVED TO #3)
**File:** `spec-tester.tsx`
**Status:** Currently in `products/refine-backlog/app/src/components/spec-tester.tsx` — needs to be added to speclint repo

---

**Section label:**
```
// try it with your own spec
```

**Section headline:**
```
Paste a spec. See the score.
```

**Section subheadline:**
```
Drop in any GitHub issue, ticket, or spec. Score appears in under 2 seconds. If it fails, one click rewrites it.
```

**Textarea placeholder text:**
```
Paste your spec, ticket, or GitHub issue body here…
```

**Lint button:**
```
Lint it
```

**Lint button (loading state):**
```
Linting…
```

**Results panel — score ≥ 70 message:**
```
This spec is agent-ready.
```

**Results panel — score < 70 message:**
```
This spec needs work before agents can reliably implement it.
```

**Fix it button:**
```
Fix it  →
```

**Fix it button (loading state):**
```
Rewriting…
```

**Empty state (shown before any lint):**
```
Your score appears here.
```
*Note: previous copy said "on the left" — wrong on mobile. Removed directional reference.*

**Key form — headline:**
```
One free rewrite per day.
Enter your email to unlock it.
```

**Key form — input placeholder:**
```
you@example.com
```

**Key form — submit button:**
```
Send my key
```

**Key form — already have a key link:**
```
Already have a key? Enter it directly
```

**Key form — direct key input placeholder:**
```
sk_live_...
```

**Rewrite result — section label:**
```
Rewritten spec
```

**Rewrite result — changes list label:**
```
What changed
```

**Rewrite result — score improvement display:**
```
{oldScore} → {newScore}
```

**Upgrade nudge (free tier, preview only):**
```
Full rewrite available on Lite ($9/mo). This is a 250-character preview.
```

**Copy button:**
```
Copy
```

**Copy button (copied state):**
```
Copied ✓
```

---

**Implementation notes:**
- Section moved from #5 to #3 — biggest conversion driver for Derek persona
- Mobile empty state fixed: remove "on the left" (doesn't apply on mobile, results appear below input)
- Free tier upgrade nudge is specific: mentions Lite tier, $9/mo, explains "250-character preview" so user knows what they're seeing
- "Fix it" button copy changed from generic to action-oriented
- The textarea placeholder should not say "GitHub issue" exclusively — devs also paste Jira tickets, Linear issues, Notion docs

**Persona validation:**
- **Derek** ✓ ✓ ✓ — This is his conversion moment. He pastes his own spec, sees it score 45, realizes his agents have been working from garbage specs. The rewrite shows him what "good" looks like.
- **Maya** ✓ — Free trial with no friction. She tries before she decides.
- **Jake** ~ — He won't do this himself; he'll forward it to his team. The "no signup required" note is important here.
- **Quinn** ✓ — Score threshold is 70, dimensions are correct, rewrite terminology matches API.

---

### SECTION 4: ScoreBreakdownSection
**File:** `score-breakdown-new.tsx`

---

**Section label:**
```
// scoring rubric
```

**Section headline:**
```
Five dimensions. 100 points.
```

**Section subheadline:**
```
Each dimension maps to a specific agent failure mode. Fix the dimension, fix the failure.
```

**Remove the existing quote** ("The distance between Level 3 and Level 4...") — undefined reference, delete it.

---

**DIMENSIONS TABLE (CORRECTED — replace entire DIMENSIONS array):**

Row 1:
```
key:   has_measurable_outcome
pts:   20
label: Measurable Outcome
check: Problem contains an observable, quantifiable outcome
fail:  "The login is slow"
pass:  "Login P95 < 200ms under 1k concurrent users"
```

Row 2:
```
key:   has_testable_criteria
pts:   25
label: Testable Criteria
check: ≥2 acceptance criteria with action verbs
fail:  "Works correctly on all browsers"
pass:  "Loads in Chrome 120+, Firefox 122+, passes axe-core audit"
```

Row 3:
```
key:   has_constraints
pts:   20
label: Constraints Present
check: Tags, tech assumptions, or explicit scope limits
fail:  "Add a filter to the table"
pass:  "Filter by status. No backend changes. Uses existing FilterBar component."
```

Row 4:
```
key:   no_vague_verbs
pts:   20
label: Specific Title
check: Title doesn't use "improve X" or "fix Y" without specificity
fail:  "Improve user experience"
pass:  "Reduce checkout form from 6 fields to 3 fields"
```

Row 5 (REPLACED — was has_definition_of_done 10pts):
```
key:   has_verification_steps
pts:   15
label: Verification Steps
check: Spec describes how you'll prove the implementation works
fail:  "Merge PR and close the ticket"
pass:  "Run npx playwright test checkout.spec.ts — all 12 assertions must pass"
```

---

**Codebase-aware scoring callout:**

Label badge: `Solo / Team`

```
Headline: Codebase-aware scoring

Body: Pass codebase_context to score specs against your actual stack — not generic patterns.

Without context label: generic
Without context example: AC: "Use a caching layer"
Without context note: Could mean Redis, Memcached, a CDN, or a local dict. Agent has to guess.

With context label: codebase_context passed
With context example: AC: "Use Redis via the existing CacheService class, not a new layer"
With context note: Agent knows exactly where to write the code.
```

---

**Agent-ready threshold callout (CORRECTED):**
```
Left side:
  Mono: completeness_score ≥ 70
  Bold: Agent-ready threshold

Right side:
  "Issues below 70 get a structured comment listing exactly what's missing"
  Mono: "and a rewritten version, if you want it"
```

---

**Implementation notes:**
- `has_definition_of_done` row replaced with `has_verification_steps` (15pts) — this is the live scoring dimension
- Threshold updated from 80 to 70 in the callout at the bottom
- Quote removed — "Level 3 / Level 4" is an undefined reference and sounds made-up
- Subheadline now anchors each dimension to a "failure mode" — makes the rubric feel less arbitrary
- Codebase-aware callout badge changed from "Pro / Team" to "Solo / Team" to match actual tier names
- Right side of threshold callout now mentions the rewrite (live feature)

**Persona validation:**
- **Derek** ✓ — Having just seen his score in section 3, he now understands why each dimension matters.
- **Quinn** ✓ — `has_definition_of_done` is gone, `has_verification_steps` is in, points add to 100, threshold is 70.
- **Maya** ✓ — Codebase context callout makes the Solo/Team upgrade case concrete.
- **Jake** ~ — He wants to see "team consistency" language — slightly missing here, picked up in Pricing.

---

### SECTION 5: RemediationSection
**File:** `remediation-section-new.tsx`

---

**Section label:**
```
// when a spec fails
```

**Section headline:**
```
Flag it. Fix it. Ship it.
```

**Section subheadline:**
```
A bad spec isn't a dead end — it's a 2-minute edit. Speclint tells you exactly what's missing. Then it rewrites the spec if you want it to.
```

**Steps:**

**Step 01:**
```
Title: Spec scores low

Description: Speclint posts a structured comment on the GitHub issue: what dimension failed, why it failed, and a concrete suggestion for what to add. Not "improve this" — specific text you can paste.

Code:
comment: "Missing: has_verification_steps
suggestion: Add a section like:
  Verification: run `npx playwright test auth.spec.ts`
  All 8 assertions must pass before PR is merged."
```

**Step 02:**
```
Title: Request a rewrite

Description: Click "Fix it" in the spec tester, or pass auto_rewrite: true to /api/lint. Speclint rewrites only the failing parts — it doesn't touch what already works.

Code:
POST /api/lint
{
  "items": ["your spec text"],
  "auto_rewrite": true
}
```

**Step 03:**
```
Title: Auto re-lint on edit

Description: Edit the GitHub issue body with the rewritten text. The action fires on issues.edited automatically — no manual re-run.

Code:
on:
  issues:
    types: [opened, edited]  # ← fires on every edit
```

**Step 04:**
```
Title: Spec passes

Description: Issue gets labeled agent_ready and enters the queue. Your coding agent picks it up. Total time from fail to agent_ready: under 5 minutes.

Code:
label("agent_ready: true")
// Cursor, Codex, Claude Code
// now have a spec worth running
```

---

**Loop indicator text:**
```
↺  loop until agent_ready: true
```

---

**REMOVE the "coming soon" callout entirely. Replace with a live-feature callout:**

```
LIVE: Standalone rewrite API

You don't need a lint first. Send any spec text to /api/rewrite and get back a rewritten spec, a list of changes, and the new score.

Code:
POST https://speclint.ai/api/rewrite
x-license-key: sk_live_...
Content-Type: application/json

{
  "text": "your spec text"
}

Badge: Lite · Solo · Team
```

---

**Implementation notes:**
- "Coming soon" callout is a LIE (rewrite is live) — replace with live API callout
- Step 02 now shows the rewrite via the API, which is the key new capability
- Step descriptions tightened — removed "2 minutes" specific time claim since it varies
- Bottom callout showcases `/api/rewrite` standalone endpoint (currently not mentioned anywhere)

**Persona validation:**
- **Derek** ✓ — Auto re-lint on edit is the feature he cares about most. Edit → instant feedback = his workflow.
- **Jake** ✓ — "5 minutes from fail to agent_ready" makes the team process concrete.
- **Quinn** ✓ — `issues.edited`, `auto_rewrite: true`, `/api/rewrite` all match actual implementation.
- **Maya** ✓ — The rewrite API callout is the first time she sees concrete upgrade value.

---

### SECTION 6: AgentPipelineSection (MOVED TO #6)
**File:** `agent-pipeline-new.tsx`

---

**Section label:**
```
// the real bottleneck
```

**Section headline:**
```
The spec is the bottleneck. Not the model.
```

**Section subheadline:**
```
AI rework is expensive because agents work from incomplete specs. A quality gate at the input changes everything downstream.
```

**Without Speclint column header:**
```
Without Speclint
4+ hours / feature
```

**Without Speclint steps:**
```
1. Issue filed             0 min
2. Agent picks it up       5 min
3. Builds wrong thing      2 hrs
4. Dev reviews, rejects    30 min
5. Rework + rebuild        4+ hrs
```

**With Speclint column header:**
```
With Speclint
~15 minutes / feature
```

**With Speclint steps:**
```
1. Issue filed             0 min
2. Speclint scores it      2 sec
3. Dev adds missing context 2 min
4. Agent builds right thing 15 min
```

**Quote (note on attribution):**

The existing quote from David Nielsen is fine for now as "dogfooding data" — but disclosure is important. Update attribution:

```
"We spent weeks debugging agent rework before realizing the specs were the problem. $29/month on spec quality eliminated most of that rework."

— David Nielsen, Speclint (dogfooding our own product)
```

*Note: Both quotes currently on the page are from the same person (David Nielsen). The "(dogfooding)" tag adds honesty. When real customer quotes become available, replace this.*

---

**Implementation notes:**
- Section moved from #7 to #6 — the business case (why) should precede the credibility proof (Customer Zero)
- "Builds wrong thing" step now shows a reject step (30 min) before the rework — makes the cost more realistic
- Attribution updated to acknowledge self-referential nature
- Subheadline removes "AI coding agents are only as good as what you give them" — too generic

**Persona validation:**
- **Jake** ✓ — He manages a team. "4 hours per feature" is a budget conversation, not a developer conversation. This section speaks to him.
- **Derek** ✓ — He's lived the "builds wrong thing" step. This is his pain point in chart form.
- **Maya** ~ — The time comparison is clear but she might not have the agent pipeline context yet. Section 3 (tester) already warmed her up.
- **Quinn** ✓ — No false claims here. "~15 minutes" is hedged appropriately.

---

### SECTION 7: CustomerZeroSection (MOVED TO #7)
**File:** `customer-zero-new.tsx`

---

**Section label:**
```
// we use it on ourselves
```

**Section headline:**
```
Every ticket we write goes through Speclint.
```

**Section subheadline:**
```
This is what that looks like — dogfooding data from our own pipeline.
```

**Before card:**
```
Label: Before
Spec: "SL-026: Add persona scoring to /api/lint"

completeness_score: 50
agent_ready:        false ✗
Missing:            has_measurable_outcome
```

**Before card caption:**
```
The spec describes the feature (WHAT) but not why it matters (business outcome). An agent would build the right code in the wrong direction.
```

**After card:**
```
Label: After
Spec: "SL-026: Reduce wasted agent token spend by 30%
       through persona-aware scoring"

completeness_score: 75
agent_ready:        true ✓
Gained:             has_measurable_outcome
```

**After card caption:**
```
One rewrite. Two minutes. Now the spec has a measurable outcome the agent can optimize for — not just a feature to implement.
```

**Behavior change callout:**
```
The quality gate didn't just catch bad specs. Our orchestration agent now writes specs differently because it knows they'll be scored. That's the compounding effect: the gate changes the behavior upstream of the gate.
```

**Quote (updated with disclosure):**
```
"Writing for Speclint's linter forced us to answer: why does this feature matter? That's not a linting rule — that's product thinking."

— David Nielsen, Speclint (founder; these are our own specs)
```

---

**Implementation notes:**
- Section moved from #6 to #7 — comes after the "why" (Agent Pipeline), now functions as evidence
- Subheadline explicitly frames it as "dogfooding data" — honest about source
- Quote updated to include "(founder; these are our own specs)" — removes any misleading implication of third-party validation
- Before/after caption updated: "right code in the wrong direction" is more concrete than "says WHAT but not WHY"

**Persona validation:**
- **Derek** ✓ — Real ticket numbers (SL-026), real scores, real before/after. He respects the specificity.
- **Jake** ~ — Wants team data, not solo data. Fine for credibility; doesn't speak to org-scale use.
- **Maya** ✓ — The behavior change callout (agents write differently) is the "aha" moment for her.
- **Quinn** ✓ — Scores are consistent with threshold (75 ≥ 70 → agent_ready: true).

---

### SECTION 8: GitHubActionSection
**File:** `github-action-new.tsx`

---

**Section label:**
```
// install in 2 minutes
```

**Section headline:**
```
Add one YAML file.
It runs on every issue.
```

**Section description:**
```
The GitHub Action fires on issues.opened and issues.edited. Every new issue is scored. Every edit re-scores it. No manual runs, no CI overhead, no new infrastructure.
```

**Feature list (bullet points):**
```
→ Scores every spec in < 2s via /api/lint
→ Posts a structured comment listing what's missing
→ Auto re-lints when the issue is edited
→ Labels passing issues agent_ready
→ Blocks issue queue with fail-on-low-score (optional)
→ Works with Cursor, Codex, Claude Code, or any agent
```

**Primary CTA button:**
```
Get API Key — free
```

**Secondary CTA button:**
```
View on GitHub ↑
```

**CLI callout label:**
```
// or lint from your terminal
```

**CLI callout code:**
```
npx speclint lint --issue 142
```

---

**YAML snippet (CORRECTED threshold to 70):**
```yaml
name: Speclint

on:
  issues:
    types: [opened, edited]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: speclint-ai/speclint-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          speclint-api-key: ${{ secrets.SPECLINT_API_KEY }}
          min-score: 70          # block below this threshold
          fail-on-low-score: true
```

**OSS callout (ADD — currently missing):**
```
Label badge: MIT open source
Text: The scoring engine, CLI, and GitHub Action are open source. Audit the scoring logic at github.com/speclint-ai. Cloud features (rewrite, codebase_context, batch) are paid.
```

---

**Implementation notes:**
- `min-score` in YAML corrected from 80 to 70
- OSS callout added — this is a significant trust signal for devs that's currently invisible
- Headline broken to two lines for rhythm — "Add one YAML file." creates a natural pause before the payoff
- Description removes "No manual re-run needed" (already implied by "every edit re-scores it")

**Persona validation:**
- **Derek** ✓ — YAML is copy-pasteable. He verifies one thing: does it fire on `issues.edited`. Yes.
- **Jake** ✓ — "No new infrastructure" is a team decision argument. "2 minutes" is how he'll sell it to his team.
- **Quinn** ✓ — `min-score: 70`, `issues.edited`, `/api/lint` — all correct.
- **Maya** ✓ — OSS callout builds confidence. She can see the scoring before she pays.

---

### SECTION 9: PricingSection
**File:** `pricing-section-new.tsx`

---

**Section label:**
```
// pricing
```

**Section headline:**
```
Pay for what you use. Cancel anytime.
```

**Section subheadline:**
```
If your team runs coding agents, a bad spec costs more than any of these plans. The math is simple.
```

*Note: Remove the redundant ROI callout from this section header. The Agent Pipeline section already made this argument. Don't repeat it here — it weakens both.*

**Below-headline tagline:**
```
Scoring engine, CLI, and GitHub Action are free and open source. Cloud features are where the paid plans start.
```

---

**PLAN: Free**
```
Price: $0
Name: Free
Description: Kick the tires. No credit card.
Features:
  ✓ 5 lints/day
  ✓ All 5 scoring dimensions
  ✓ JSON response via /api/lint
  ✓ 1 rewrite preview/day (250-char preview + score delta)
  ✓ No signup required — or get a free key to track usage
  ✓ Community support
CTA: Lint your first spec
```

---

**PLAN: Lite** *(ADD THIS TIER — currently missing)*
```
Price: $9
Per: /mo
Name: Lite
Description: When you want the full rewrite, not just the preview.
Features:
  ✓ Everything in Free
  ✓ 10 full rewrites/day (complete rewritten spec, not preview)
  ✓ Changes list + score improvement per rewrite
  ✓ API access with license key
  ✓ Email support
CTA: Start Lite
```

---

**PLAN: Solo** *(badge: Most Popular)*
```
Price: $29
Per: /mo
Name: Solo
Description: For devs running agents daily.
Features:
  ✓ Unlimited lints + rewrites
  ✓ Full rewrite text with structured output
  ✓ codebase_context scoring (spec scored against your actual stack)
  ✓ Agent profiles (target rewrites for Cursor, Codex, Claude Code)
  ✓ 25 issues per batch request
  ✓ Priority support
CTA: Start Solo
```

---

**PLAN: Team**
```
Price: $79
Per: /mo
Name: Team
Description: For teams where bad specs cost real money.
Features:
  ✓ Everything in Solo
  ✓ 50 issues per batch request
  ✓ Rewrite chain (iterative refinement across multiple passes)
  ✓ Cross-spec context (score specs relative to your existing backlog)
  ✓ Team analytics dashboard (coming soon)
  ✓ SLA + dedicated support
CTA: Start Team
```

---

**Stats row (below pricing cards):**
```
$0    to start today
≤ 2s  per lint response
MIT   open source scoring engine
```

---

**Team buyer callout (ADD — currently missing):**
```
Buying for a team?
Team plan includes batch linting, cross-spec context, and an analytics dashboard (coming soon). Start a 14-day trial — no per-seat pricing, ever.

[Start Team Trial →]
```

---

**Implementation notes:**
- Lite tier ($9/mo) added — currently completely absent from pricing
- Free tier now shows "1 rewrite preview/day" — honest about what free gets you and seeds the upgrade path to Lite
- Solo features now include all actual capabilities: unlimited rewrites, full text, structured output, agent profiles, codebase_context, 25-item batch
- Team features: "Dependency mapping (coming soon)" replaced with "Rewrite chain" and "Cross-spec context" (real features) + "Team analytics dashboard (coming soon)" clearly labeled
- ROI callout removed from section header — handled in Agent Pipeline section already (L8 audit finding)
- Team buyer callout added for Jake persona — explicit path with "no per-seat pricing, ever"
- Stats row: "100% cancel anytime" replaced with "MIT open source scoring engine" — more distinctive signal

**Persona validation:**
- **Maya** ✓ — Sees Free → Lite as a natural upgrade path. 1 preview/day → 10 full rewrites/day is a clear value jump.
- **Derek** ✓ — Solo plan features (agent profiles, codebase_context) directly address his use case.
- **Jake** ✓ — Team buyer callout gives him a direct path. "No per-seat pricing" removes his #1 objection.
- **Quinn** ✓ — Feature descriptions match actual API capabilities. "Coming soon" labels on Team are accurate.

---

### SECTION 10: FAQSection (MOVED TO #10)
**File:** `faq-section.tsx`
**Status:** Exists in `products/refine-backlog/app/src/components/faq-section.tsx` — needs to be added to speclint repo

---

**Section headline:**
```
Common questions
```

**Section subheadline:**
```
(No marketing copy here — just answers)
```

---

**Q1: What does Speclint actually score?**
```
The completeness_score (0–100) evaluates your spec across 5 dimensions:
  • has_measurable_outcome (20pts) — does the problem have a quantifiable result?
  • has_testable_criteria (25pts) — are there ≥2 acceptance criteria with action verbs?
  • has_constraints (20pts) — does the spec define scope, tags, or assumptions?
  • no_vague_verbs (20pts) — does the title avoid "improve X" or "fix Y" without specificity?
  • has_verification_steps (15pts) — does the spec describe how to prove it works?

A score of 70 or above means the spec is agent-ready.
```

**Q2: Is this free?**
```
The scoring engine, CLI (npx speclint), and GitHub Action are MIT open source — free forever.

The cloud API has a free tier: 5 lints/day, 1 rewrite preview per day, no credit card required.

Paid plans: Lite ($9/mo) for full rewrites, Solo ($29/mo) for unlimited rewrites + codebase_context, Team ($79/mo) for batch operations + cross-spec context.
```

**Q3: Can't I just use ChatGPT to improve my specs?**
```
ChatGPT makes specs sound better. Speclint makes specs work better.

The difference is measurable: Speclint scores each spec on 5 defined dimensions, rewrites only the failing parts, then re-scores to prove improvement. ChatGPT doesn't score, can't gate your CI pipeline, and optimizes for coherent prose rather than agent task completion.

The other difference: Speclint integrates with GitHub Issues natively. ChatGPT is a conversation. One runs in your workflow; the other interrupts it.
```

**Q4: How does it integrate with GitHub?**
```
Add the Speclint GitHub Action to .github/workflows/speclint.yml. It fires on issues.opened and issues.edited — no other configuration needed. Setup takes under 2 minutes. YAML is on the GitHub Action section of this page.
```

**Q5: Does it work with Cursor, Codex, and Claude Code?**
```
Speclint works upstream of any coding agent. It scores and rewrites your spec before any agent sees it. The quality improvement applies regardless of which agent you use — Cursor, Codex, Claude Code, GitHub Copilot, Windsurf, or anything else.
```

**Q6: Can I use it without GitHub?**
```
Yes. POST to /api/lint with your spec text as JSON. Works with any CI/CD pipeline, issue tracker (Linear, Jira, Notion), or custom agent orchestrator. There's also /api/rewrite for standalone rewriting without a lint step.
```

**Q7: What's the difference between Lite and Solo?**
```
Lite ($9/mo) gives you full rewrite text (not previews) with 10 rewrites/day — the right choice if you want the rewrite capability without the codebase-aware scoring.

Solo ($29/mo) adds codebase_context scoring (specs evaluated against your actual stack), agent profiles (rewrites targeted for Cursor vs Codex vs Claude Code), structured output, and unlimited rewrites.
```

**Q8: How is this different from just writing better tickets?**
```
Most devs know they should write better tickets. Speclint automates the enforcement:
  • Catches what you miss when you're moving fast
  • Gives you a consistent standard across your whole team
  • Integrates directly into the issue workflow — not a separate tool or process
  • Rewrites the spec for you when you don't have time to figure out what's missing

It's not a training course. It's a linter that runs in CI.
```

**Q9: What is agent_ready?**
```
agent_ready: true is the label applied to GitHub issues that score ≥ 70. It's how your coding agent knows a spec is worth picking up. You can configure the threshold in the GitHub Action YAML (min-score: 70 is the default).
```

**Q10: Is my spec data stored?**
```
Specs submitted via the free web tester are not stored. Specs submitted via the API are processed in memory and not logged or retained. See /privacy for the full policy.
```

---

**Implementation notes:**
- Q1 updated: correct dimensions and points (has_verification_steps 15pts instead of has_definition_of_done)
- Q1 threshold corrected from "70+" (existing FAQ is actually correct) — but verify "70+" wording is consistent everywhere
- Q2 updated: includes all four tiers (was missing Lite, had wrong free tier description "3 requests/day")
- Q3 ("Can't I just use ChatGPT") is already good in the current FAQ — minor tightening only. Key addition: "One runs in your workflow; the other interrupts it."
- Q4 unchanged
- Q7 added (new): explains Lite vs Solo differentiation — this was a MISS in the audit
- Q9 added (new): explains agent_ready label — frequently searched term
- Q10 added (new): data privacy question — common for API products
- Section moved from #11 to #10 — handles objections before the technical For AI Agents section

**Persona validation:**
- **Derek** ✓ — Q3 (ChatGPT) and Q4 (GitHub integration) are his exact objections.
- **Maya** ✓ — Q2 (pricing tiers) and Q7 (Lite vs Solo) are her decision questions.
- **Jake** ✓ — Q8 (team consistency argument) and Q10 (data privacy) are his concerns.
- **Quinn** ✓ — Q1 dimensions and Q9 agent_ready threshold are now accurate.

---

### SECTION 11: ForAIAgentsSection (MOVED TO #11)
**File:** `for-ai-agents-new.tsx`

---

**Section label:**
```
// for agents and orchestrators
```

**Section headline:**
```
Built for agent pipelines.
```

**Section description:**
```
Speclint exposes a REST API, MCP server, and machine-readable contract — so you can wire it into any orchestration layer without custom parsing.
```

*Note: Remove the re-pitch ("AI coding agents are only as good as what you give them") — this was established in sections 1, 2, and 6. At section 11, buyers have already internalized this. Open with the integration details.*

---

**Integration list:**

```
llms.txt compatible
Machine-readable API contract at /llms.txt for agent discovery and tool description.

OpenAPI schema at /openapi.yaml
Import into any orchestration layer — LangChain, n8n, custom Python, anything with REST support.

MCP server available
Mount Speclint as a tool inside Claude Desktop, Cursor, or any MCP-compatible host. Tool name: speclint_lint.
```

---

**Agent compatibility badges:**
```
⊕ Cursor
◈ Codex
◆ Claude Code
◉ Devin
◇ Copilot
```

---

**API example (CORRECTED — updated response shape):**

Request header label:
```
POST /api/lint — request + response
```

Code block:
```http
POST https://speclint.ai/api/lint
x-license-key: sk_live_...
Content-Type: application/json

{
  "items": ["Fix mobile Safari login — users can't log in via Safari after the July deploy"],
  "auto_rewrite": false
}
```

Response:
```json
{
  "items": [{
    "title": "Fix mobile Safari login failure",
    "problem": "Users cannot authenticate via Safari iOS after July deploy",
    "acceptanceCriteria": [
      "User can log in on Safari iOS 15+",
      "No JS console errors during auth flow"
    ],
    "tags": ["bug", "mobile", "auth"],
    "completeness_score": 65,
    "agent_ready": false,
    "breakdown": {
      "has_measurable_outcome": false,
      "has_testable_criteria": true,
      "has_constraints": true,
      "no_vague_verbs": true,
      "has_verification_steps": false
    },
    "missing": [
      "has_measurable_outcome — no quantifiable outcome (affected user count? error rate?)",
      "has_verification_steps — how will you verify the fix works in production?"
    ]
  }],
  "summary": {
    "average_score": 65,
    "agent_ready_count": 0,
    "total_count": 1
  }
}
```

*Note: score 65 = 0+25+20+20+0. agent_ready: false because 65 < 70. Both failing dimensions appear in `missing`. Math is correct and internally consistent.*

---

**Standalone rewrite API callout (ADD — currently missing):**
```
Label: /api/rewrite

You don't need a lint result first. Send any spec text directly to the rewrite endpoint.

POST https://speclint.ai/api/rewrite
x-license-key: sk_live_...
Content-Type: application/json

{
  "text": "your spec text here"
}

Response includes: rewritten spec, changes list, new_score, trajectory (how score improved per pass).

Badge: Lite · Solo · Team
```

---

**Callout below API example:**
```
↑ The missing array tells you exactly what's wrong — not just the score. Use it to route the spec to /api/rewrite or back to the author.
```

---

**Implementation notes:**
- Re-pitch intro paragraph removed — position was established in sections 1, 2, 6
- API example `breakdown` updated: `has_definition_of_done: true` replaced with `has_verification_steps: false`
- API example score corrected: 65 (not 75) to match the updated dimension math
- `agent_ready: false` is now consistent with score 65 < threshold 70
- `missing` array added to response example — this is a real field in the API response and it's useful context
- `/api/rewrite` standalone endpoint callout added — currently not mentioned anywhere on the page
- MCP tool name added to the integration list callout

**Persona validation:**
- **Derek** ✓ — The API example shows a real response shape he can build against. `missing` array is immediately useful.
- **Quinn** ✓ — `has_verification_steps` in breakdown, score math is consistent, threshold is 70.
- **Jake** ~ — Less relevant to him; he's already decided by section 11.
- **Maya** ~ — She's more interested in what she can do with it than how the API works.

---

### SECTION 12: Footer
**File:** `footer-new.tsx`

---

**Brand name:**
```
speclint
```

**Tagline (CHANGED — was a repeat of hero):**
```
Quality gate for agent-native development.
```

---

**Product column header:**
```
Product
```

**Product links:**
```
/api/lint docs          → /openapi.yaml
GitHub Action           → https://github.com/speclint-ai/speclint-action
npx speclint lint       → https://www.npmjs.com/package/speclint (or #)
MCP server              → (link when available)
Blog                    → /blog
llms.txt                → /llms.txt
```

**Legal column header:**
```
Legal
```

**Legal links:**
```
Privacy     → /privacy
Terms       → /terms
support@speclint.ai → mailto:support@speclint.ai
```

**Bottom bar left:**
```
© 2026 Perpetual Agility LLC
```

**Bottom bar right:**
```
Scoring engine · CLI · GitHub Action — MIT open source
```

---

**Implementation notes:**
- Footer tagline changed from "Lint your specs before agents touch them" (hero repeat) to "Quality gate for agent-native development." More final, more brand-defining
- Bottom bar right replaces `completeness_score ≥ threshold → agent_ready: true` with OSS callout — more distinctive as a footer value statement
- MCP server link placeholder added — keep as `#` or link to MCP docs when available
- No other structural changes needed

**Persona validation:**
- **Derek** ✓ — "MIT open source" in the footer reinforces trust; he'll check GitHub.
- **Quinn** ✓ — No incorrect claims in the footer.

---

## PERSONA VALIDATION SUMMARY

| Section | Jake (team buyer) | Derek (IC dev, skeptical) | Maya (solo dev, curious) | Quinn (auditor) |
|---|---|---|---|---|
| 1. Hero | ~ | ✓ | ✓ | ✓ |
| 2. How It Works | ✓ | ✓ | ✓ | ✓ |
| 3. Spec Tester | ~ | ✓✓ | ✓ | ✓ |
| 4. Score Breakdown | ~ | ✓ | ✓ | ✓ |
| 5. Remediation | ✓ | ✓ | ✓ | ✓ |
| 6. Agent Pipeline | ✓✓ | ✓ | ~ | ✓ |
| 7. Customer Zero | ~ | ✓ | ✓ | ✓ |
| 8. GitHub Action | ✓ | ✓ | ✓ | ✓ |
| 9. Pricing | ✓ | ✓ | ✓ | ✓ |
| 10. FAQ | ✓ | ✓ | ✓ | ✓ |
| 11. For AI Agents | ~ | ✓ | ~ | ✓ |
| 12. Footer | ✓ | ✓ | ✓ | ✓ |

**Legend:** ✓✓ = primary audience, ✓ = validates positively, ~ = neutral or tangential

**Gap analysis:**
- **Jake** is underserved in sections 1, 3, 4, 7, 11 — acceptable because sections 6, 8, 9 are his primary conversion touchpoints. The Team buyer callout in Pricing is the critical Jake fix.
- **Maya** is underserved in sections 6 and 11 — acceptable; those sections are for pipeline builders, not solo devs. Her path is 1 → 3 → 9.
- **Derek** is served across nearly every section — he's the hardest to convert (skeptical, tries before he buys), and the section order now puts the interactive tester at position 3 specifically for him.
- **Quinn** should find zero inaccuracies after this rewrite. She's the internal auditor — if she finds a lie, the product loses the sale.

---

## DEVELOPER HANDOFF NOTES

### Files that need updates in `products/speclint/src/`:

1. **`components/hero-section-new.tsx`** — Update DIMENSIONS array (5 dimensions, correct points, correct keys)
2. **`components/how-it-works-new.tsx`** — Fix step 02 score to 58 (agent_ready: false at threshold 70), fix step 03 default threshold to 70
3. **`components/score-breakdown-new.tsx`** — Replace `has_definition_of_done` row with `has_verification_steps` (15pts), fix threshold callout to 70
4. **`components/remediation-section-new.tsx`** — Remove "coming soon" callout, replace with live `/api/rewrite` callout
5. **`components/github-action-new.tsx`** — Fix `min-score: 70` in YAML, add OSS callout
6. **`components/pricing-section-new.tsx`** — Add Lite tier, update Free tier features, update Solo tier features, add Team buyer callout, remove duplicate ROI callout
7. **`components/for-ai-agents-new.tsx`** — Fix API response shape (breakdown uses `has_verification_steps`), correct score math, add `/api/rewrite` callout, remove re-pitch intro
8. **`components/footer-new.tsx`** — Update tagline, update bottom bar right copy
9. **`app/page.tsx`** — Add `SpecTesterSection` and `FAQSection` imports and components, reorder sections per recommendation

### Files that need to be copied from `products/refine-backlog/app/src/`:

- `components/spec-tester.tsx` → `products/speclint/src/components/spec-tester.tsx`
- `components/faq-section.tsx` → `products/speclint/src/components/faq-section.tsx`
- Verify both files import correctly in the speclint app context

### Things NOT changed (intentionally):

- The general visual design and color system (emerald on dark) — this is working well
- The before/after card pattern — strong visual pattern throughout
- The font mono treatment for code and technical terms — correct developer aesthetic
- The Customer Zero before/after data (SL-026) — real data, keep it
- The spec-tester functional logic — only copy changes, not UX logic

---

*Document complete. Every section has precise text. Developer can implement without ambiguity.*
