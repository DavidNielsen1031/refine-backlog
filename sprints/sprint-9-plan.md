# Sprint 9: "Fix & Distribute"

**Product:** Speclint
**Goal:** Fix dogfooding bugs that block our own usage, then execute first real distribution push
**Ladders to:** "Developers trust Speclint enough to integrate it into CI" + "Solo devs find Speclint without us telling them"
**Predecessor:** Sprint 8 (Closed)

---

## Teresa Gate

**Should we build this? What evidence do we have?**

- **DOG-001/DOG-002** — We can't use our own product reliably. Internal key hits free tier limits, CLI section detection is broken. If we can't dogfood, we can't sell. Evidence: 3 failed lint attempts during LocalBeacon S11.
- **Distribution items** — Show HN got 1 upvote. We have 0 paying customers. The product is invisible. Evidence: 2 GitHub stars, 0 forks, 0 watchers, 1 HN comment.
- **DOG-006 (key-info endpoint)** — We burn a lint call just to check if a key works. API cost waste. Evidence: healthcheck uses a full lint call 3x/day.

---

## Items

### DOG-001: Fix SK-INTERNAL key tier recognition (S)
**Problem:** The internal key `SK-INTERNAL-8157AD2B79F752B4004593BE` exists in Redis as `team` tier but sometimes resolves as free tier, hitting the 3/day rate limit.
**Solution:** Debug the rate-limit middleware tier resolution path. Check if the key lookup in `rate-limit.ts` correctly queries Redis and passes tier through. Add logging to trace tier resolution. Fix the root cause.
**Verification:** Run `curl` with the internal key 5 times in a row — all should succeed without 429. Check the tier field in the response.
**Measurable Outcome:** Internal key never hits free tier limits. Healthcheck API calls succeed at team tier 100% of the time.

### DOG-002: Fix OSS CLI section detection (S)
**Problem:** `### Verification` and `### Measurable Outcome` markdown headers in specs are not recognized by the scoring regex. Specs with proper sections score 60 instead of ~85.
**Solution:** Update regex patterns in `src/lib/scoring.ts` to detect markdown-formatted section headers (### Problem, ### Verification, etc.) in addition to inline text patterns.
**Verification:** Lint a spec with `### Verification\nVerify the button appears` — should score 15pts for `has_verification_steps`. Lint a spec without any verification language — should score 0pts.
**Measurable Outcome:** Specs with explicit markdown verification sections score ≥80 instead of 60.

### DOG-006: Add GET /api/key-info endpoint (S)
**Problem:** No way to verify a key's tier without burning a scoring request. Healthcheck wastes a full lint call 3x/day.
**Solution:** Create `src/app/api/key-info/route.ts` — accepts `x-license-key` header, looks up key in Redis, returns `{ tier, status, remaining_today }`. No Claude API call, no rate limit decrement.
**Verification:** `curl -H "x-license-key: SK-INTERNAL-..." https://speclint.ai/api/key-info` returns tier=team. Invalid key returns 401.
**Measurable Outcome:** Healthcheck can verify key tier without using a lint quota.

### SL-056: Commit + deploy uncommitted changes (S)
**Problem:** 6 files with changes sitting in working directory since overnight work. Includes kv.ts additions, test updates, refine route changes.
**Solution:** Review diffs, test, commit, push, deploy.
**Verification:** `git status --short` shows clean. `npx vitest run` passes. `npx vercel --prod` succeeds.
**Measurable Outcome:** All code changes are committed and deployed. Zero uncommitted files.

### SL-048: Homepage CTA above fold → /pricing (M)
**Problem:** Homepage hero doesn't direct users to pricing. GitHub issue #18.
**Solution:** Add a secondary CTA button in the hero section linking to /pricing. "See Pricing" or "Get Started" alongside the existing primary CTA.
**Verification:** Visit speclint.ai — pricing CTA visible without scrolling. Click leads to /pricing page.
**Measurable Outcome:** /pricing is reachable in 1 click from hero section.

### SL-015: Submit to 5 AI tool directories (David)
**Problem:** Speclint isn't listed anywhere. Zero organic discovery.
**Solution:** David submits to: Futurepedia, TAAFT, OpenTools, AI Tool Guru, ToolPilot. Submission details in `products/speclint/distribution/directory-submissions.md`.
**Verification:** Confirmation emails or listing pages for each directory.
**Measurable Outcome:** Listed on ≥3 directories within 2 weeks.

### SL-016: Submit speclint-mcp to 3 agent registries (David)
**Problem:** MCP server not listed in any agent registry.
**Solution:** David submits to: Glama, MCP.so, Smithery.
**Verification:** Listing pages live.
**Measurable Outcome:** Listed on ≥2 registries within 2 weeks.

### SL-031: Submit to llmstxt.org (S)
**Problem:** GitHub issue #5. llmstxt.org is a registry of sites with /llms.txt. We have the file but aren't listed.
**Solution:** Submit PR or form to llmstxt.org with our /llms.txt URL.
**Verification:** speclint.ai appears on llmstxt.org.
**Measurable Outcome:** Listed on llmstxt.org.

---

## Assignment

| Item | Size | Owner | ETA |
|------|------|-------|-----|
| DOG-001 | S | Agent | 10m |
| DOG-002 | S | Agent | 10m |
| DOG-006 | S | Agent | 10m |
| SL-056 | S | Agent | 5m |
| SL-048 | M | Agent | 15m |
| SL-015 | - | David | async |
| SL-016 | - | David | async |
| SL-031 | S | Agent | 5m |

**Human tasks (do while agents work):**
- [ ] David: Submit to 5 AI directories (SL-015)
- [ ] David: Submit MCP to 3 registries (SL-016)

**Agent execution order:** SL-056 (commit first) → DOG-001 + DOG-002 + DOG-006 (parallel) → SL-048 → SL-031

---

## Speclint Pre-Flight

*Scores to be filled after linting each spec through the API.*

| Item | Score | Agent Ready |
|------|-------|-------------|
| DOG-001 | TBD | TBD |
| DOG-002 | TBD | TBD |
| DOG-006 | TBD | TBD |
| SL-056 | TBD | TBD |
| SL-048 | TBD | TBD |
| SL-031 | TBD | TBD |

---

## ⚠️ Incident Log

**INCIDENT-S9-001: Sprint Start Process Violation (March 7, 2026)**
- **What happened:** Alexander proposed "kicking off" Sprint 9 with a table of items and no proper specs, no SPRINT_STARTER.md read, no Teresa gate, no Sprint 8 closure, no Speclint pre-flight.
- **Root cause:** Continuation bias from Sprint 8's fast execution (28 min). Sprint Starter checklist was not loaded.
- **Impact:** Trust violation. David had to catch and correct.
- **Fix required:** Deterministic enforcement — `scripts/sprint-gate.sh` must block sprint start if SPRINT_STARTER.md steps are not completed. Cannot rely on Alexander's memory.
- **Retro action:** Design and implement a pre-sprint gate check that verifies: (1) previous sprint closed, (2) specs written with 4 sections, (3) Teresa gate documented, (4) Speclint pre-flight scores logged.

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
