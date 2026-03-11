# Speclint Open-Source Plan

**Date:** March 6, 2026
**Decision:** Open-source Speclint core (scoring engine + CLI + GitHub Action)
**Model:** Open-core — OSS foundation + paid cloud/team features
**License:** MIT (already set in package.json)

---

## What Goes Open Source

### Repository: `speclint/speclint` (new GitHub org)

| Component | Current Location | OSS? | Notes |
|---|---|---|---|
| Scoring engine (`scoring.ts`) | `src/lib/scoring.ts` | ✅ YES | 94 lines, core logic |
| CLI (`speclint lint`) | `products/speclint-action/` npm package | ✅ YES | Already MIT on npm |
| GitHub Action (`action.yml`) | `products/speclint-action/` | ✅ YES | The distribution mechanism |
| API route (`/api/lint`) | `src/app/api/` | ✅ YES | Reference implementation |
| Scoring schemas | `src/lib/schemas.ts` | ✅ YES | TypeScript types |
| Landing page | `src/app/page.tsx` + components | ❌ NO | Stays in private repo |
| Dashboard | `src/app/dashboard/` | ❌ NO | Paid feature |
| Team analytics | (planned) | ❌ NO | Paid feature |
| Codebase-aware scoring | (planned) | ❌ NO | Paid feature |
| Stripe/billing integration | `src/app/api/checkout/` | ❌ NO | Paid infrastructure |
| Telemetry | `src/lib/telemetry.ts` | ❌ NO | Internal analytics |
| Rate limiting | `src/lib/rate-limit.ts` | ❌ NO | Cloud infra |

---

## Open-Core Boundary

### Free (OSS + hosted)
- Self-host scoring engine locally (run your own)
- Use hosted API: 5 lints/day, all 5 dimensions
- CLI: `npx speclint lint --issue 142`
- GitHub Action: auto-lint on `issues.opened` / `issues.edited`
- JSON response with score, breakdown, missing items

### Solo ($29/mo) — Cloud only
- Unlimited hosted API lints
- 25 issues per request (batch)
- `codebase_context` scoring (codebase-aware ACs)
- `agent_ready` label automation
- Priority support

### Team ($79/mo) — Cloud only
- Everything in Solo
- 50 issues per request
- Dependency mapping
- Team analytics dashboard
- SLA + dedicated support

**Principle:** The scoring logic is always free. The scale, intelligence, and team features are paid.

---

## Migration Steps

### Phase 1: Prepare OSS Repo (Day 1)

1. **Create GitHub org:** `speclint` (or use existing `DavidNielsen1031` if org unavailable)
2. **Create public repo:** `speclint/speclint`
3. **Extract OSS components:**
   - `src/` — scoring.ts, schemas.ts, CLI entry point
   - `action.yml` + Action wrapper
   - `README.md` — comprehensive, with badges, examples, architecture
   - `LICENSE` — MIT
   - `CONTRIBUTING.md` — how to contribute
   - `CODE_OF_CONDUCT.md`
   - `.github/workflows/` — CI (tests, lint, publish to npm)
4. **Keep private repo** (`DavidNielsen1031/speclint`) for:
   - Landing page, dashboard, billing, cloud API infra
   - Vercel deployment config
   - Internal docs, sprint logs, business strategy

### Phase 2: Polish & Launch (Day 2-3)

5. **README must be exceptional:**
   - Problem statement (bad specs → bad agent output)
   - 30-second quickstart (`npx speclint lint "your spec here"`)
   - Scoring rubric (5 dimensions, visual)
   - GitHub Action setup (copy-paste YAML)
   - Self-host vs cloud comparison
   - "We use Speclint to build Speclint" dogfooding section
   - Architecture diagram (simple)
6. **npm package** points to OSS repo (update `repository` field)
7. **GitHub Action** marketplace listing updated
8. **Tests:** Port/write unit tests for scoring engine (high coverage = trust signal)

### Phase 3: Launch Campaign (Day 3-4)

9. **Show HN:** "Speclint — open-source spec linter for AI coding agents"
   - OSS framing gets 3-5x more HN engagement
   - Link to GitHub, not marketing site
   - "We scored 0/100 on our own specs" story hook
10. **X announcement:** Thread from @wooshi1031 (READ-ONLY — David posts manually)
11. **Apply for programs:**
    - OpenAI Codex for Open Source
    - GitHub Sponsors
    - Anthropic / Claude partnerships (we run on Claude)
12. **Post to:**
    - r/programming, r/github, r/artificial
    - Dev.to article
    - AI agent Discord communities (Claude Code, Cursor, etc.)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Fork by well-funded competitor | First-mover + community + paid features moat |
| Support burden | CONTRIBUTING.md sets expectations, issue templates, community-first |
| Revenue impact | Core was already easy to replicate; OSS accelerates adoption→conversion |
| Loss of proprietary advantage | Scoring is commodity; codebase-aware, team analytics, scale = paid |

---

## Success Metrics (30 days post-launch)

- [ ] 200+ GitHub stars
- [ ] 50+ forks
- [ ] 5+ community PRs
- [ ] 3+ external blog mentions
- [ ] 10+ self-hosted installations (measure via opt-in telemetry)
- [ ] First paid conversion from OSS user

---

## Key Decisions Needed

1. **GitHub org name:** `speclint` (preferred) or keep under `DavidNielsen1031`?
2. **Monorepo or separate repos?** Recommend: single `speclint/speclint` repo with `/packages/cli`, `/packages/action`, `/packages/core`
3. **When to launch?** Recommend: within 1 week (strike while OSS momentum is hot)
4. **X posting:** David posts manually (Alexander is read-only). Draft thread ready for approval.

---

*"Be the open-source spec linter before someone else builds it."*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
