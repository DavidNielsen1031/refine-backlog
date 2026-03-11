# Speclint + Claude Code Integration Guide

Use Speclint as a spec quality gate for Claude Code, Codex, OpenCode, or any coding agent that reads `AGENTS.md` / `CLAUDE.md`.

## Quick Setup (30 seconds)

Add this to your project's `AGENTS.md` or `CLAUDE.md`:

```markdown
## Spec Quality Gate
Before implementing any task or issue, refine it through Speclint:
  npx speclint "the task description"
Only proceed if the completeness score is ≥ 70 (agent-ready).
Use the refined acceptance criteria and verification steps as your implementation checklist.
```

That's it. Claude Code will now refine every spec before writing code.

## What happens

When Claude Code reads a task like "Fix the login bug", it will:

1. Run `npx speclint "Fix the login bug"`
2. Get back a structured spec with:
   - Clear problem statement with measurable outcome
   - 2-4 testable acceptance criteria (action-verb format)
   - 2-3 concrete verification steps ("Run npm test...", "curl /api/login returns 200...")
   - Size estimate, priority, tags, assumptions
3. Only proceed if score ≥ 70
4. Use the acceptance criteria as an implementation checklist
5. Use the verification steps to self-check before marking done

## Auto-Context Detection

When run from a project directory, Speclint automatically reads:
- `AGENTS.md` / `CLAUDE.md` — agent instructions and project rules
- `README.md` — project description and stack
- `package.json` — dependencies and scripts
- `prisma/schema.prisma` — database models

This means refined specs reference YOUR stack, not generic advice. A spec for a Next.js + Prisma project gets different acceptance criteria than one for a Python CLI.

Override with `--context "We use FastAPI + SQLAlchemy"` or disable with `--no-auto-context`.

## MCP Server (Deeper Integration)

For Claude Desktop or Claude Code with MCP support:

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

This gives Claude a `refine_spec` tool it can call natively — no shell needed.

## Advanced Patterns

### Gate GitHub issues before implementation

```markdown
## Issue Implementation Rule
When assigned a GitHub issue:
1. Run: npx speclint "$(gh issue view $ISSUE --json title,body -q '.title + ". " + .body')"
2. If score < 70, comment on the issue asking for clarification instead of implementing.
3. If score ≥ 70, implement using the refined acceptance criteria.
```

### Batch refine a backlog

```bash
# One item per line
npx speclint --file backlog.txt --format json

# With Gherkin-format acceptance criteria
npx speclint --file backlog.txt --gherkin
```

### Pro/Team tier (unlimited requests)

```bash
npx speclint "task" --key sk-your-key-here
```

Or set in your environment:
```bash
export SPECLINT_KEY=sk-your-key-here
```

## How It Works (And What It Doesn't Know)

Speclint doesn't know your codebase. It infers the most likely acceptance criteria based on patterns from millions of specs, bug tickets, and user stories. "Fix login bug" gets ACs about error handling, valid/invalid credentials, and session persistence because those are what login bugs almost always involve.

Think of it as a **first draft from a senior PM** who knows the pattern but hasn't talked to your users yet.

Two things make it better than generic guessing:

1. **Auto-context detection** — when run from your project directory, Speclint reads your README, package.json, AGENTS.md, and Prisma schema. So "fix login bug" in a Next.js + Supabase project gets different ACs than in a Django project.

2. **The assumptions field** — Speclint explicitly flags what it's guessing. "Assumes OAuth, not email/password" or "Assumes existing error handling middleware." These are signals to check before your agent starts coding.

**The value isn't perfect accuracy — it's completeness.** An agent with 4 ACs where 1 needs tweaking will outperform an agent with 0 ACs guessing at everything. You review the spec in 10 seconds; the agent executes it in 10 minutes. That tradeoff is worth it.

## Why This Matters

Coding agents execute specs literally. Ambiguous specs waste tokens and produce wrong code.

**Without Speclint:** "Add dark mode" → agent guesses scope, misses system preference detection, no verification, ships untested.

**With Speclint:** "Add dark mode" → agent gets 4 acceptance criteria, 3 verification steps, knows to handle `prefers-color-scheme`, tests with specific commands.

One `npx speclint` call (~2 seconds) saves 5-10 minutes of agent thrashing.

## Pricing

- **Free:** 5 items/request, 3 requests/day — no signup, no API key
- **Pro ($9/mo):** 25 items/request, unlimited
- **Team ($29/mo):** 50 items/request, unlimited

Free tier is plenty for individual Claude Code users refining specs one at a time.

---

Questions? [hello@speclint.ai](mailto:hello@speclint.ai) · [speclint.ai](https://speclint.ai) · [GitHub](https://github.com/DavidNielsen1031/speclint)
