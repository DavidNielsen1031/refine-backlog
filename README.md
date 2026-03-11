# Speclint

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
npx speclint-mcp
```

Or install via npm:

```bash
npm install -g speclint-mcp
```

## GitHub Action

Refine your backlog automatically in CI. Trigger on issue open, manual dispatch, or any GitHub event.

```yaml
- uses: DavidNielsen1031/speclint-action@v1
  with:
    items: ${{ github.event.issue.title }}
    write-back: "true"
    gherkin: "true"
    key: ${{ secrets.SPECLINT_KEY }}
```

→ [GitHub Marketplace](https://github.com/marketplace/actions/speclint) · [Full docs + examples](https://github.com/DavidNielsen1031/speclint-action#readme)

## Claude Code / Codex / Coding Agents

Add Speclint as a quality gate in your agent workflow. Drop this into your project's `AGENTS.md` or `CLAUDE.md`:

```markdown
## Spec Quality Gate
Before implementing any task or issue, refine it through Speclint:
  npx speclint "the task description"
Only proceed if the completeness score is ≥ 70 (agent-ready).
Use the refined acceptance criteria and verification steps as your implementation checklist.
```

The CLI auto-detects project context from your repo (README, package.json, AGENTS.md, Prisma schema) so refined specs are tailored to your stack.

### Full agent workflow

```bash
# 1. Refine before building
npx speclint "Add Stripe webhook handler for subscription events" --format json

# 2. Pipe a whole backlog file
npx speclint --file backlog.txt --gherkin

# 3. Refine a GitHub issue title before implementation
npx speclint "$(gh issue view 42 --json title -q .title)"
```

### MCP server (Claude Desktop / Claude Code)

For deeper integration, run Speclint as an MCP tool:

```json
{
  "mcpServers": {
    "speclint": {
      "command": "npx",
      "args": ["speclint-mcp"]
    }
  }
}
```

Then ask Claude: *"Refine this spec before implementing: add user export to CSV"*

### Why this matters for agents

Coding agents execute specs literally. Vague input → wasted tokens and wrong code. Speclint ensures every spec has:
- **Testable acceptance criteria** (action-verb format agents can verify)
- **Verification steps** (concrete commands: `curl`, `npm test`, "open page and check...")
- **Constraints and assumptions** (scope boundaries agents respect)
- **Size estimate** (agents can flag XL specs for decomposition)

A 30-second `npx speclint` call saves 10 minutes of agent thrashing on ambiguous requirements.

## API

Direct REST API for scripts, automations, and pipelines:

```bash
curl -X POST https://speclint.ai/api/refine \
  -H "Content-Type: application/json" \
  -d '{"items": ["users keep saying login is broken", "dashboard loads slow"]}'
```

Full OpenAPI spec: [speclint.ai/openapi.yaml](https://speclint.ai/openapi.yaml)

Agent capabilities: [speclint.ai/llms.txt](https://speclint.ai/llms.txt)

## Pricing

- **Free:** 5 items/request, 5 requests/day, 1 rewrite preview/day — no signup required
- **Lite ($9/mo):** 5 items/request, unlimited requests, 10 full rewrites/day
- **Solo ($29/mo):** 25 items/request, unlimited requests + rewrites, codebase_context, agent profiles
- **Team ($79/mo):** 50 items/request, unlimited everything, batch ops, cross-spec context, SLA

Pass your license key via `x-license-key` header or the MCP server config.

## Links

- [Website](https://speclint.ai)
- [Pricing](https://speclint.ai/pricing)
- [npm package](https://www.npmjs.com/package/speclint-mcp)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
