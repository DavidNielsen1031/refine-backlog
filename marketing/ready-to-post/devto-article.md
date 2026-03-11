# Dev.to Article

**Title:** I stopped blaming AI agents for bad code. The specs were the problem.

**Tags:** ai, devtools, opensource, productivity

**Body (markdown):**

Three months ago I was ready to cancel my Cursor subscription. Every feature it built was technically correct and functionally useless. It did exactly what I asked for. The problem was what I asked for.

"Build a user dashboard" gave me a dashboard. With no filters. No date ranges. No export. No loading states. Because I never specified any of that.

So I started paying attention to the specs. And a pattern emerged fast: the stories that produced good AI-generated code all had the same qualities. They were specific about outcomes. They defined how to test them. They included constraints. They avoided weasel verbs like "handle" and "manage."

I wanted a way to check for those qualities automatically. Something deterministic, not another AI layer adding randomness.

## What I built

Speclint scores any spec or user story on five dimensions:

- **Measurable outcomes** (20 pts) - what does done look like in numbers?
- **Testable criteria** (20 pts) - can QA write a test from this?
- **Constraints** (20 pts) - performance budgets, security, accessibility
- **Vague verbs** (20 pts) - flags "handle," "manage," "process," "ensure" when used without specifics
- **Verification** (20 pts) - how do you confirm it shipped correctly?

The scoring is regex-based. Same spec, same score, every time. No model temperature affecting your results.

If a spec scores below 70, there's an AI-powered rewrite that fills in the gaps. It doesn't guess what you meant. It restructures the spec to force you to be explicit about the parts you left out.

## How to use it

**Web:** Drop a spec into [speclint.ai](https://speclint.ai) and get your score.

**CLI:**
```bash
npx speclint lint "As a user, I want to manage my settings"
```

**MCP Server:** Three tools that plug into Claude, Cursor, or any MCP-compatible editor. Your AI agent can lint its own specs before building.

**GitHub Action:** Gate PRs on spec quality. Set a minimum score threshold in CI.

## Pricing

Diagnosis is free. Always. Lint as many specs as you want.

The rewrite engine is the paid part. $9/month for individuals, $29/month for unlimited, $79/month for teams.

## The repo

MIT licensed. The whole scoring engine is open source.

[github.com/DavidNielsen1031/speclint](https://github.com/DavidNielsen1031/speclint)

Stars appreciated. Issues and PRs even more so.

## What I learned

The biggest insight wasn't technical. It's that most teams skip spec quality because there's no fast feedback loop. Code has linters, tests, CI. Specs have... a Jira ticket and a prayer.

Speclint is trying to close that gap. If you're using AI agents in your workflow, I'd genuinely like to hear what your spec process looks like.
