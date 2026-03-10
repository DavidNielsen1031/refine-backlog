# Speclint

Score your specs before AI coding agents build from them. Fix the ones that fail.

**Clean spec in. Clean code out.**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![npm: speclint](https://img.shields.io/npm/v/speclint.svg)](https://www.npmjs.com/package/speclint)
[![npm: speclint-mcp](https://img.shields.io/npm/v/speclint-mcp.svg)](https://www.npmjs.com/package/speclint-mcp)

## What it does

Speclint scores specs 0–100 across 5 dimensions, then rewrites the ones that fail — so your AI coding agents build the right thing the first time.

**Scoring dimensions:**
- **Measurable outcome** (20 pts) — does it define what success looks like?
- **Testable criteria** (25 pts) — can you verify it's done?
- **Constraints** (20 pts) — are boundaries defined?
- **No vague verbs** (20 pts) — no "improve", "enhance", "optimize"
- **Verification steps** (15 pts) — how do you check it works?

**Agent-ready threshold:** score ≥ 70. Below that, the spec gets flagged or rewritten before any agent touches it.

## Quick start

### CLI

```bash
npx speclint lint "Add user authentication to the dashboard"
```

### MCP Server (Claude Desktop, Cursor, etc.)

```json
{
  "mcpServers": {
    "speclint": {
      "command": "npx",
      "args": ["-y", "speclint-mcp"],
      "env": { "SPECLINT_KEY": "your-key-here" }
    }
  }
}
```

Three tools: `speclint` (lint/score), `rewrite_spec` (fix failing specs), `plan_sprint` (execution queue).

### GitHub Action

```yaml
- uses: DavidNielsen1031/speclint@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    write-back: "true"
    suggest-rewrites: "true"
    min-score: "70"
```

Scores issues on open, writes back a breakdown comment, and optionally rewrites specs that score below threshold.

### API

```bash
# Lint
curl -X POST https://speclint.ai/api/lint \
  -H "Content-Type: application/json" \
  -d '{"items": ["Add user authentication to the dashboard"]}'

# Rewrite (requires license key)
curl -X POST https://speclint.ai/api/rewrite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"spec": "Add auth", "gaps": ["has_measurable_outcome", "has_testable_criteria"]}'
```

## Why not just use ChatGPT?

ChatGPT gives you freeform suggestions. Speclint gives you:
- **Deterministic scoring** — same spec, same score, every time (regex-based, not LLM opinion)
- **Structured output** — machine-readable breakdown per dimension
- **Quality gate** — `agent_ready: true/false` as a CI check
- **Re-scoring** — rewrites are automatically re-scored to prove improvement
- **Pipeline integration** — GitHub Action, MCP, CLI, REST API

## Pricing

- **Free:** 5 lints/day, 1 rewrite preview/day — no signup
- **Lite ($9/mo):** 10 full rewrites/day
- **Solo ($29/mo):** Unlimited lints + rewrites, codebase context, structured output, agent profiles
- **Team ($79/mo):** Everything + rewrite chains (3 passes), cross-spec context, batch 50, SLA

## Links

- [speclint.ai](https://speclint.ai)
- [GitHub](https://github.com/DavidNielsen1031/speclint)
- [npm: speclint](https://www.npmjs.com/package/speclint) (CLI)
- [npm: speclint-mcp](https://www.npmjs.com/package/speclint-mcp) (MCP server)
- [API docs: llms.txt](https://speclint.ai/llms.txt)
- [OpenAPI spec](https://speclint.ai/openapi.yaml)

## License

MIT — use it, fork it, build on it.
