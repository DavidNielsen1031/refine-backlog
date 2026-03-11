# Sprint 10: "Rewrite Engine"

**Product:** Speclint
**Goal:** Transform Speclint from a linter into a spec improvement engine AND pressure-test the open-core gating model. Ship 6 contextual rewrite features + web UI + GitHub Action auto-apply + 5 gating fixes from persona pressure test.
**Ladders to:** "First paying customer" — rewrite is the conversion catalyst, but only if the gating model converts without leaking value.
**Predecessor:** Sprint 9 (Closed)

---

## Teresa Gate

**Should we build this? What evidence do we have?**

- **Persona consensus (6/6):** Jake (buyer), Sam (operator), Maya (solo dev), Priya (PM), Kai (pipeline), Derek (skeptic) — all said rewrite is the #1 missing feature. Jake: "Rewrite is the product, lint is the demo."
- **Competitive moat:** ChatGPT can lint text, but can't score → rewrite → re-score → gate. The closed-loop improvement with deterministic scoring is unique.
- **API already exists:** /api/rewrite endpoint works. Website says "coming soon." We're underselling what we already have.
- **Revenue thesis:** Solo devs won't pay $29/mo for lint alone. They WILL pay for "paste spec → get fixed spec → copy → ship." The Fix It button is the conversion moment.
- **Zero risk:** No infrastructure changes, no new dependencies, no external integrations. Pure feature expansion on existing architecture.

---

## Items

### SL-070: Backend Rewrite Enhancements — 6 Features (L)
**Problem:** The rewrite API is a blunt instrument — it rewrites everything regardless of what's actually broken. No awareness of codebase, target agent, or voice preservation.
**Solution:** Add 6 contextual enhancements to /api/rewrite:
1. Codebase-context-aware rewrites (pass stack/patterns/constraints)
2. Surgical rewrite (only fix failing dimensions via breakdown param)
3. Voice preservation mode (minimal: append fixes vs full: rewrite)
4. Structured output (title/problem/ACs/constraints/verificationSteps)
5. Agent-target-aware rewrites (cursor/claude-code/codex/copilot profiles)
6. Rewrite chain (iterative lint→rewrite→re-lint, 1-3 passes, trajectory output)
**Verification:** POST /api/rewrite with each new param → verify output structure matches. POST with breakdown={has_measurable_outcome:true, has_testable_criteria:false} → verify only testable criteria added. POST with max_iterations=3 → verify trajectory array in response. TypeScript compiles with 0 errors.
**Measurable Outcome:** All 6 params accepted and processed. Existing behavior unchanged when params omitted. Build passes clean.

### SL-071: Single-Call Lint+Rewrite Combo (M)
**Problem:** Users must make 2 API calls (lint then rewrite). Pipeline operators (Kai persona) want a single endpoint. Sam wants auto-apply, not comments.
**Solution:** Add `auto_rewrite: true` param to /api/refine. When true, items scoring <70 get rewritten inline. Supports passthrough params: rewrite_mode, target_agent, max_iterations. Cross-spec context when batch rewriting. Capped at 5 rewrites per request. Non-blocking on errors.
**Verification:** POST /api/refine with auto_rewrite:true and 3 items (1 good, 2 bad) → good item gets rewrite:null, bad items get rewrite object with new_score. POST with 8 bad items → only 5 get rewritten (cap). POST with rewrite_mode:"minimal" → rewrites are append-only.
**Measurable Outcome:** Single API call returns lint scores + rewrites. No second request needed. Response time <15s for 3-item batch.

### SL-072: GitHub Action Auto-Apply Mode (M)
**Problem:** Current suggest-rewrites posts a comment with suggestions. Sam (operator) wants the issue body auto-updated, not a comment to manually apply.
**Solution:** Add `auto-apply-rewrites` input to action.yml. When true (with write-back + suggest-rewrites), edit the issue body with the rewritten spec. Preserve original in a <details> block. Post confirmation comment with score before→after.
**Verification:** Trigger action on a test issue with auto-apply-rewrites:true → issue body updated, original preserved in details block, comment posted with scores.
**Measurable Outcome:** Zero manual copy-paste needed. Issue body is the improved spec. Original always recoverable.

### SL-073: Web UI Interactive Spec Tester + Fix It Button (L)
**Problem:** Website positions rewrite as "coming soon" but the API works. No interactive demo. Derek (skeptic) converts when he pastes HIS spec and sees before/after.
**Solution:** Build SpecTesterSection component: paste spec → lint → see score/breakdown → "Fix it ✨" button → see rewrite with before/after score animation. Free tier: 100-char preview + blurred + upgrade CTA. Update remediation section: "coming soon" → "live now" with scroll-to CTA.
**Verification:** Visit speclint.ai → scroll to tester → paste a vague spec → see red score → click Fix It → see improved spec with green score. Free tier users see blurred preview + pricing CTA. Mobile responsive.
**Measurable Outcome:** Interactive demo live on homepage. "Coming soon" language removed. Users can try rewrite without signing up.

### SL-074: Gating Model — Changes List Verbosity Restriction (S) — P0
**Problem:** The free tier changes list describes specific content changes (e.g., "Changed X to Y"), enabling users to reconstruct the full rewrite for free via any LLM. This is the model's most dangerous value leak.
**Solution:** Update the rewrite system prompt to return category-level change descriptions only ("Improved acceptance criteria specificity") not content-level ("Changed 'user clicks button' to 'user submits form via POST /api/submit'"). Add a post-processing step that validates changes list items don't contain quoted original/rewritten text.
**Verification:** POST /api/rewrite with a spec → changes list items describe intent, not content. No quoted strings from the original or rewritten spec appear in changes items. Manual review of 5 sample rewrites confirms category-level descriptions.
**Measurable Outcome:** Changes list provides value signal without leaking rewrite content. Cannot reconstruct full rewrite from changes + original spec.

### SL-075: Gating Model — Account-Gated Rewrite Limits (M) — P0
**Problem:** Free tier rewrite limits (1/day) are enforced via rate-limit middleware that may be bypassable via cookie clearing, incognito windows, or API key rotation. No account verification required.
**Solution:** Require email-verified account creation before first rewrite (free or paid). Tie rewrite daily limits to account ID server-side, not session/cookie/IP. Frame account creation as a feature ("Save your lint history") not a wall. Web UI shows "Create free account to unlock Fix It" before first rewrite attempt.
**Verification:** Clear cookies → attempt rewrite → prompted for account. Different browser → same account → limit shared. No rewrite possible without authenticated account.
**Measurable Outcome:** Rewrite limits are hard-enforced per account. Cookie clearing does not reset limits.

### SL-076: Gating Model — Usage Guardrails on "Unlimited" (S) — P0
**Problem:** "Unlimited rewrites" at $29/mo Solo is financially unsustainable. One pipeline user doing 500 rewrites/day costs ~$150/mo in LLM calls. No circuit breaker exists.
**Solution:** Add soft daily caps: Solo 500 rewrites/day, Team 1000 rewrites/day. Email notification at 80% of cap. Throttle (not hard-block) above cap. Add fair-use policy page. Add monthly token spend tracking per license key in KV.
**Verification:** Simulate 500 rewrite calls on Solo → 400th triggers email notification → 501st returns throttled response with retry-after header. Team cap at 1000 verified similarly.
**Measurable Outcome:** No single customer can generate unbounded LLM costs. Fair-use policy documented.

### SL-077: Free Tier Preview — Section-Based Instead of Character-Truncated (S)
**Problem:** 250-char preview feels calculated and arbitrary. Not enough to demonstrate quality difference vs ChatGPT (Derek's objection).
**Solution:** Replace `slice(0, 250)` with section-based preview: show the first complete section of the rewrite (problem statement or first acceptance criterion). Cap at ~500 chars but cut at a natural boundary. Remove any user-facing mention of character counts.
**Verification:** POST /api/rewrite (free) → preview contains a complete thought/section, not a mid-sentence cutoff. Preview feels like "a taste" not "a calculated restriction."
**Measurable Outcome:** Free preview demonstrates real rewrite quality. Derek can see structural choices, not just first 2 sentences.

### SL-078: Lite Tier ($9/mo) — Solo Dev Conversion Path (M)
**Problem:** 30-40% of early adopters (Maya segment) have $0-15/mo tool budgets. $29 is 2× their threshold. No conversion path exists for this segment.
**Solution:** Add Lite tier: $9/mo, 10 rewrites/day, full rewrite text, no codebase_context, no structured output, no agent-target profiles, 1-item batch. Create Stripe price. Update pricing page, rate-limit logic, and API tier resolution.
**Verification:** Lite license key → 10 rewrites/day with full text → 11th throttled. No codebase_context or structured output in response. Pricing page shows 4 tiers.
**Measurable Outcome:** Maya-segment users have a $9 impulse-buy conversion path. Solo tier preserved for power users needing codebase_context + structured output.

### SL-015: Submit to 5 AI tool directories (David — carry-forward)
**Problem:** Speclint isn't listed anywhere. Zero organic discovery.
**Solution:** David submits to: Futurepedia, TAAFT, OpenTools, AI Tool Guru, ToolPilot.
**Verification:** Confirmation emails or listing pages.
**Measurable Outcome:** Listed on ≥3 directories within 2 weeks.

### SL-016: Submit speclint-mcp to 3 agent registries (David — carry-forward)
**Problem:** MCP server not listed in any agent registry.
**Solution:** David submits to: Glama, MCP.so, Smithery.
**Verification:** Listing pages live.
**Measurable Outcome:** MCP listed on ≥2 registries.

---

## Execution Plan

Code for SL-070, SL-071, SL-072, SL-073 is already built by 3 parallel agents in git worktrees:
- `/tmp/speclint-rewrite` → branch `feature/rewrite-enhancements` (SL-070)
- `/tmp/speclint-combo` → branch `feature/lint-rewrite-combo` (SL-071 + SL-072)
- `/tmp/speclint-ui` → branch `feature/rewrite-ui` (SL-073)

Sprint process: merge to sprint branch → build → preview deploy → persona review → demo → ship.

---

## Sprint Checklist

- [x] Sprint 9 closed with retro
- [x] Sprint Starter read
- [x] Lessons.md read
- [x] Teresa gate passed
- [x] Specs written (4 sections each)
- [ ] Speclint pre-flight on specs
- [x] Co-planned with David (persona analysis session → "implement them all")
- [x] Sprint branch created (sprint/speclint/s10)
- [x] Code merged from worktrees (3 feature branches)
- [x] Build passes (0 new errors)
- [x] Preview deploy (Vercel auth-gated, verified locally)
- [x] Persona review — Sprint 10 features (8 personas, blockers fixed)
- [x] Persona review — Gating model pressure test (10 personas, P0s identified)
- [x] Before/after screenshots
- [x] Demo posted (SL-070 through SL-073)
- [x] **SL-074: Changes list verbosity restriction (P0)** ✅ 955b737
- [x] **SL-075: Account-gated rewrite limits (P0)** ✅ b4dccd3 + 2e56d44
- [x] **SL-076: Usage guardrails on unlimited (P0)** ✅ 955b737
- [x] **SL-077: Section-based preview (P1)** ✅ 955b737
- [x] **SL-078: Lite tier $9/mo (P1)** ✅ 8626ca4 + 2e56d44
- [x] Build passes with gating fixes (0 source errors)
- [ ] Updated preview deploy
- [ ] David approves ("ship it")
- [ ] Production deploy
- [ ] Retro
