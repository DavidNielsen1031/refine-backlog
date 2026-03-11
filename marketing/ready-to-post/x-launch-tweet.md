# X Launch Tweet (single)

we just open sourced speclint.

it scores your specs on 5 dimensions before AI agents build from them. deterministic. no AI vibes in the scoring.

if the spec is bad, it rewrites it.

free to lint. MIT licensed.

speclint.ai

# X Thread (5 tweets)

## Tweet 1
the problem with AI coding agents isn't the AI.

it's the spec.

"build a dashboard" → garbage.
"build a dashboard with 3 KPI cards, date range filter, CSV export, loads in under 2s" → ships.

we built a linter that catches the gap before your agent wastes tokens.

## Tweet 2
speclint scores specs on 5 things:
- measurable outcomes
- testable criteria
- constraints
- vague verb usage
- verification steps

each gets 0-100. the scoring is regex-based. same spec, same score, every time. no model temperature.

## Tweet 3
if your score is below 70, the rewrite engine restructures the spec with everything that was missing.

it doesn't guess what you meant. it forces you to be explicit about the parts you skipped.

diagnosis is free. rewrite is the product.

## Tweet 4
works everywhere:
- web app (speclint.ai)
- CLI (npx speclint lint)
- MCP server (Claude, Cursor, etc.)
- GitHub Action (gate PRs on spec quality)
- REST API

MIT open source.

## Tweet 5
if you're using AI coding agents and keep getting output that's technically right but functionally wrong, try linting the spec first.

speclint.ai
github.com/DavidNielsen1031/speclint

⭐ if it's useful
