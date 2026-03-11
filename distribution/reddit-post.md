# r/programming post

**Title:** We open-sourced Speclint — a spec linter for AI coding agents (TypeScript, MIT)

**Body:**

We just open-sourced Speclint, a linter that scores your GitHub issues/specs before AI coding agents (Claude Code, Codex, Cursor) build from them.

The premise: the model isn't the bottleneck — the spec is. "Make the dashboard faster" produces garbage regardless of which agent you use. Speclint scores specs on 6 dimensions and tells you exactly what's missing before any agent touches it.

**Try it:**
```
npx @speclint/cli lint "Improve dashboard performance"
```

**GitHub:** https://github.com/speclint-ai/speclint
**npm:** @speclint/core + @speclint/cli
**License:** MIT

Looking for feedback on the scoring dimensions and whether you'd add this to CI.

---

# r/artificial post

**Title:** Open-sourced a spec linter that reduces AI coding agent rework by catching vague specs

**Body:** (same as above)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
