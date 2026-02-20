# Refine Backlog

AI-powered backlog refinement. Paste messy backlog items, get structured user stories with problem statements, acceptance criteria, size estimates, and priority — ready for your sprint.

## What it does

Takes rough backlog items like:
- "users keep saying login is broken"
- "dashboard loads slow"
- "need dark mode"

And returns structured user stories with:
- Clear title and problem statement
- Acceptance criteria
- Priority and size estimate
- Tags and assumptions

## MCP Server

Use directly in Claude Desktop or any MCP-compatible client:

```bash
npx refine-backlog-mcp
```

Or install via npm:

```bash
npm install -g refine-backlog-mcp
```

## GitHub Action

Refine your backlog automatically in CI. Trigger on issue open, manual dispatch, or any GitHub event.

```yaml
- uses: DavidNielsen1031/refine-backlog-action@v1
  with:
    items: ${{ github.event.issue.title }}
    write-back: "true"
    gherkin: "true"
    key: ${{ secrets.REFINE_BACKLOG_KEY }}
```

→ [Full GitHub Action docs](../action/README.md)

## API

Direct REST API for scripts, automations, and pipelines:

```bash
curl -X POST https://refinebacklog.com/api/refine \
  -H "Content-Type: application/json" \
  -d '{"items": ["users keep saying login is broken", "dashboard loads slow"]}'
```

Full OpenAPI spec: [refinebacklog.com/openapi.yaml](https://refinebacklog.com/openapi.yaml)

Agent capabilities: [refinebacklog.com/llms.txt](https://refinebacklog.com/llms.txt)

## Pricing

- **Free:** 5 items/request, 3 requests/day — no signup required
- **Pro ($9/mo):** 25 items/request, unlimited requests
- **Team ($29/mo):** 50 items/request, unlimited requests

Pass your license key via `x-license-key` header or the MCP server config.

## Links

- [Website](https://refinebacklog.com)
- [Pricing](https://refinebacklog.com/pricing)
- [npm package](https://www.npmjs.com/package/refine-backlog-mcp)
