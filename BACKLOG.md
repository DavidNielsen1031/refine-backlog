# Speclint — Backlog

*Successor to Refine Backlog. Pivot decision: March 1, 2026.*  
*Codebase: `products/refine-backlog/app/`*

## Research: Autoresearch for Prompt Optimization
- **Concept:** Use Karpathy's autoresearch pattern to autonomously improve Speclint's refinement prompts overnight
- **How:** Agent iterates on refinement prompts, each run scored against a spec quality benchmark. Commits better prompts to a branch. Wake up to measurably better output.
- **Long-term:** Fine-tune a small local model on spec refinement data to reduce API costs at scale
- **Source:** https://x.com/hooeem/status/2030720614752039185
- **Priority:** After pricing is validated and usage scales (Sprint 10+)

---

## Product Objectives (Problem-Oriented)

> Framing: SVPG-style outcome objectives. Features ladder up to these. Measure results, not output.

| Objective | Key Results | Status |
|-----------|------------|--------|
| **Developers trust Speclint enough to integrate it into CI** | KR1: 3 external GitHub repos install the Action · KR2: <5% of users disable after first week · KR3: 1 unsolicited testimonial | 🔴 Not started |
| **Teams can see that spec quality is improving over time** | KR1: Dashboard shows score trends · KR2: 30% of returning users check the dashboard · KR3: At least 1 team uses digest for standup | 🟡 Sprint 8 |
| **Solo devs find Speclint without us telling them** | KR1: 50 organic visitors/week from search + directories · KR2: Show HN gets 10+ upvotes · KR3: 1 inbound from AI directory listing | 🔴 Sprint 9 |
| **Pricing validated: devs will pay $29/mo** | KR1: 3 pricing conversations with real devs · KR2: At least 1 says "I'd pay that" unprompted · KR3: 1 paid conversion within 60 days of launch | 🔴 Not started |

---

## Now (Sprint 8 — "Proof of Work & Feedback Loops")

**Ladders to:** "Teams can see that spec quality is improving over time"

**Goal:** Make Speclint's value visible and undeniable. Every interaction provides clear feedback that demonstrates Speclint is actively improving spec quality.

**Theme:** *Don't just work, prove you're working.*

| Item | Description | Speclint Score | Owner |
|------|-------------|---------------|-------|
| **SL-051** | Restore Git push notifications to Discord (#speclint-notifications) | 85 ✅ | Agent |
| **SL-052** | GitHub Action: post rewrite suggestions as diff comment on issues | 85 ✅ | Agent |
| **SL-053** | Dashboard: add activity feed (last 20 lint events with scores) | 85 ✅ | Agent |
| **SL-054** | Daily linting digest to Discord (8am CST, 5 metrics) | 85 ✅ | Agent |
| **SL-055** | Enforce Speclint on all Alexander backlog items (AGENTS.md mandate) | 75 ✅ | Alex |

**Human tasks (do first):**
- [ ] David: Review blog posts at speclint.ai/blog (approved but not read yet)
- [ ] David: Skim Show HN draft at `products/speclint/distribution/show-hn-draft.md`

---

## Next (Sprint 9 — Distribution)

- [ ] **SL-018** — Show HN post (approved, ready to publish)
- [ ] **SL-015** — Submit to AI tool directories (Futurepedia, TAAFT, OpenTools)
- [ ] **SL-016** — Submit speclint-mcp to agent registries (Glama, MCP.so, Smithery)
- [ ] **SL-020** — Validate pricing with 3 devs before hard launch
- [ ] **SL-048** — Homepage CTA above fold → /pricing
- [ ] **SL-041** — AI SEO: optimize blog for AI search engine citations
- [ ] **SL-031** — Submit to llmstxt.org registry
- [ ] **SL-022** — AI/GenAI development niche positioning

## Next+1 (Sprint 10 — Eval Foundation)

**Goal:** Make Speclint's scoring trustworthy by validating it against human judgment.  
**Skills reference:** `tools/evals-skills` (Hamel Husain)  
**Audit:** `products/speclint/evals/EVAL_AUDIT.md`

- [ ] **SL-060** — Store full traces (input spec + LLM output + scores) to JSONL/Upstash
- [ ] **SL-061** — Error analysis: categorize failure modes from 100 real traces
- [ ] **SL-062** — Human labeling: 100 specs with binary Pass/Fail "agent-ready" labels
- [ ] **SL-063** — Validate `scoring.ts` rubric: measure TPR/TNR against human labels
- [ ] **SL-064** — Write LLM judge prompts for top failure modes (AC specificity, problem quality)
- [ ] **SL-065** — Validate judges: calibrate against human labels (target TPR/TNR >90%)
- [ ] **SL-066** — Sprint review eval gate: mandatory eval re-run on any prompt/scoring change

## Later

- [ ] **SL-021** — Audit log for Team tier (who ran what, when, score history)
- [ ] **SL-023** — Webhook support — fire Speclint result to Slack/Discord/Linear
- [ ] **SL-024** — Linear + Jira native integrations (write spec back to issue)
- [ ] **SL-025** — Speclint for PRs — lint PR description before review request
- [ ] **SL-012** — Codebase context injection (pass tech stack for stack-aware ACs)
- [ ] **SL-050** — Phase 0 market context enrichment before discovery questions

---

## Completed — Sprint 7 "Dashboard + Distribution Prep" (March 1-2, 2026)

- [x] SL-039 — Dashboard MVP (4 charts, auth, global toggle, empty states) ✅
- [x] SL-039b — Dashboard UX fixes (NaN, empty states, "try it now") ✅
- [x] SL-044 — Telemetry instrumentation (licenseKey, per-license indexes) ✅
- [x] SL-045 — Testability scoring (15pt verification dimension) ✅
- [x] SL-046 — Planning structure enforcement (complexity warnings) ✅
- [x] SL-047 — Show HN draft + 10 directory submissions doc ✅
- [x] SL-049 — /docs/enforce page ✅
- [x] SL-027b — Rewrite suggestions in GitHub Action ✅
- [x] Site-wide nav bar, ROI pricing line, healthcheck fixes ✅
- [x] Security audit, deps updated, Dependabot enabled ✅
- [x] GitHub issues cleaned (RB-* → SL-*, test issues closed) ✅

## Completed — Sprint 6 "Harden & Publish" (March 1, 2026)

- [x] SL-042, SL-040, SL-041, CODE-001/002/003, STALE-001/003, SEC-005 ✅
- [x] SL-035 (5 blog posts), SL-043 (dashboard spike) ✅
- [x] CRED-001/002/003 (all secrets rotated), Maya+Sam personas ✅

## Completed — Sprint 5 "Make It Real" (March 1, 2026)

- [x] SL-026 through SL-038, full security audit ✅

## Completed — Earlier Sprints (Feb-Mar 2026)

- [x] SL-001 through SL-010 (rebrand), SL-019 (Stripe), SL-030 (website rebuild) ✅
- [x] GitHub Action, npm CLI, free key issuance, conversion funnel ✅

---

## Dogfooding Backlog (from Sprint OS usage)

*Items sourced from our own usage of Speclint across LocalBeacon/DankBot/VitalLens sprints.*

| # | Item | Source | Priority |
|---|------|--------|----------|
| ~~DOG-001~~ | ~~**Fix API key tier recognition** — `SK-INTERNAL-*` key treated as free tier (3/day limit). Should be team tier.~~ | LocalBeacon S11 | ✅ Fixed 2026-03-08 (commit 54632c4) |
| ~~DOG-002~~ | ~~**OSS CLI section detection** — `### Verification` / `### Measurable Outcome` headers not recognized by regex parser. All specs score 60 instead of ~85.~~ | LocalBeacon S11 | ✅ Fixed 2026-03-08 (commit 54632c4) |
| ~~DOG-003~~ | ~~**Add `has_review_gate` check**~~ — spec should mention review/approval process | LocalBeacon S11 PF-2 | ✅ 2026-03-09 (commit a317b58) |
| ~~DOG-004~~ | ~~**Parse prose for measurable outcomes**~~ — not just structured headers | LocalBeacon S10 false positive | ✅ 2026-03-09 (commit a317b58) |
| ~~DOG-005~~ | ~~**Complexity warning for XL specs**~~ (>2000 chars) recommending decomposition | LocalBeacon S10 trend | ✅ 2026-03-09 (commit a317b58) |
| ~~DOG-006~~ | ~~**Add `GET /api/key-info` endpoint**~~ — verify key tier without burning a scoring request | LocalBeacon S11 infra issue | ✅ Already shipped at `/api/key-info/route.ts` |

---

*Started March 1, 2026 · Last updated March 7, 2026*

---
*See also: [[MEMORY|Alexander's Memory]] · [[TOOLS|Infrastructure]] · [[SOUL|Soul]]*

## Sprint 10 Retro Action Items (Mar 9, 2026)

- **SL-079:** Rename npm CLI from `refine-backlog-cli` → `speclint` — 🔴 HIGH
- **SL-080:** Fix GitHub dependabot vulnerabilities (3 high, 2 moderate) — 🔴 HIGH
- **SL-081:** Update README for rewrite features, Lite tier, 4-tier pricing — 🟡 MEDIUM
- **SL-082:** Shareable result URL (lint_id exists, needs render page) — 🟡 MEDIUM
- **SL-083:** Expose codebase_context in homepage spec tester (paid users) — 🟡 MEDIUM
- **SL-084:** Before/after social proof metric on homepage — 🟡 MEDIUM
- **SL-085:** Investigate Vercel preview deploy SSO issue — 🟡 MEDIUM
- **SL-086:** Docs page (single /docs route, not full docs site) — 🟢 BACKLOGGED (trigger: first paying customer)
