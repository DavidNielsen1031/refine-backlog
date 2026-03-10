# Speclint

AI-powered spec quality tool. Paste a backlog item, get a score + structured rewrite — ready for autonomous agents and CI pipelines.

## What it does

Takes rough backlog items like:
- "users keep saying login is broken"
- "dashboard loads slow"
- "need dark mode"

And returns:
- A **quality score** (0–100) with dimension breakdown
- A **structured rewrite** with clear title, problem statement, acceptance criteria, size estimate, and constraints — ready for Cursor, Claude Code, or Codex
- **Change log** — exactly what was improved and why

> "Garbage spec in. Garbage code out. Fix the input."

## Interactive Spec Tester

Paste a spec at [speclint.ai](https://speclint.ai) → see your score → click **Fix it** → copy the rewrite. No signup required for free tier.

## MCP Server

Use directly in Claude Desktop or any MCP-compatible client:

```bash
npx speclint-mcp
```

Or install via npm:

```bash
npm install -g speclint-mcp
```

## GitHub Action

Lint and auto-fix specs in CI. Triggers on issue open, manual dispatch, or any GitHub event.

```yaml
- uses: DavidNielsen1031/speclint-action@v1
  with:
    items: ${{ github.event.issue.title }}
    write-back: "true"
    suggest-rewrites: "true"
    auto-apply: "true"      # rewrites edit issue body directly
    gherkin: "true"
    key: ${{ secrets.SPECLINT_KEY }}
```

→ [GitHub Marketplace](https://github.com/marketplace/actions/speclint) · [Full docs + examples](https://github.com/DavidNielsen1031/speclint-action#readme)

## API

### Lint a spec

```bash
curl -X POST https://speclint.ai/api/refine \
  -H "Content-Type: application/json" \
  -H "x-license-key: YOUR_KEY" \
  -d '{"items": ["users keep saying login is broken"]}'
```

### Lint + rewrite in one call

```bash
curl -X POST https://speclint.ai/api/refine \
  -H "Content-Type: application/json" \
  -H "x-license-key: YOUR_KEY" \
  -d '{"items": ["slow dashboard"], "auto_rewrite": true}'
```

### Rewrite a scored spec

```bash
curl -X POST https://speclint.ai/api/rewrite \
  -H "Content-Type: application/json" \
  -H "x-license-key: YOUR_KEY" \
  -d '{"spec": "...", "gaps": ["Missing AC", "No size"], "score": 45}'
```

Returns `{ rewritten, changes, new_score }`.

Full OpenAPI spec: [speclint.ai/openapi.yaml](https://speclint.ai/openapi.yaml)

Agent capabilities: [speclint.ai/llms.txt](https://speclint.ai/llms.txt)

## Pricing

| Tier | Price | Items/req | Requests/day | Rewrites | Codebase context |
|------|-------|-----------|--------------|----------|-----------------|
| **Free** | Free | 5 | 3 | Preview only | — |
| **Lite** | $9/mo | 25 | Unlimited | ✅ Full | — |
| **Solo** | $29/mo | 25 | Unlimited | ✅ Full | ✅ |
| **Team** | $79/mo | 50 | Unlimited | ✅ Full | ✅ |

Pass your license key via `x-license-key` header or the MCP server config.

[Get a key → speclint.ai/pricing](https://speclint.ai/pricing)

## Links

- [Website](https://speclint.ai)
- [Pricing](https://speclint.ai/pricing)
- [Dashboard](https://speclint.ai/dashboard)
- [npm package](https://www.npmjs.com/package/speclint-mcp)
- [GitHub Action](https://github.com/marketplace/actions/speclint)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
