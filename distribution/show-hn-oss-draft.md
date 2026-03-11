# Title
Show HN: Speclint (open source) — Lint your specs before AI agents build from them

# URL
https://github.com/speclint-ai/speclint

# Comment (paste this as the first comment)

We open-sourced Speclint today. It's a linter for the specs you feed to AI coding agents.

The premise is simple: AI agents build exactly what the spec says, not what you meant. "Make the dashboard faster" produces different code every time. "Dashboard P95 load time under 800ms, measured via Lighthouse, no regressions on existing tests" produces the right code on the first try. The model isn't the bottleneck — the spec is.

Speclint scores specs across 6 dimensions:
- **Measurable outcome** (20 pts) — does the spec define success you can observe?
- **Testable criteria** (25 pts) — are there acceptance criteria with action verbs?
- **Constraints** (20 pts) — scope limits, tech assumptions, tags?
- **No vague verbs** (20 pts) — "improve X" fails; "reduce X from Y to Z" passes
- **Definition of done** (0 pts, informational) — specific states/thresholds in ACs
- **Verification steps** (15 pts) — how will you prove it works?

**Try it now:**
```
npx @speclint/cli lint "Improve dashboard performance"
# → completeness_score: 20/100, agent_ready: false
```

Or add the GitHub Action to lint every issue automatically:
```yaml
- uses: speclint-ai/speclint-action@v1
  with:
    api-key: ${{ secrets.SPECLINT_KEY }}
```

**What's open source vs paid:**
- OSS (MIT): scoring engine, CLI, all 6 dimensions, run locally, unlimited
- Cloud free: 5 lints/day via hosted API
- Cloud paid ($29-79/mo): unlimited API, batch scoring, codebase-aware scoring, team dashboard

We built this because we run Claude Code and Cursor agents on our own projects and kept getting garbage back from vague specs. We now lint every ticket before any agent touches it. The scoring rubric is opinionated — it reflects how we think about spec quality after hundreds of agent-built features.

The whole scoring engine is 94 lines of TypeScript. We're not pretending this is rocket science. The value is making spec quality a measurable, enforceable thing in your CI pipeline.

**Stack:** TypeScript monorepo, zod for validation, vitest for tests. Cloud uses Next.js + Claude Haiku + Upstash Redis + Vercel.

Looking for feedback on: the scoring dimensions (are we missing something?), false positives you hit, and whether you'd actually add this to your CI. What makes a spec "good enough" for your agent workflow?

GitHub: https://github.com/speclint-ai/speclint
Cloud: https://speclint.ai

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
