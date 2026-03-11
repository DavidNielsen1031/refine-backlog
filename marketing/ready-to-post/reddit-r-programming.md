# Reddit: r/programming

**Title:** I built a linter for specs (not code) because AI agents kept building the wrong thing

**Body:**

Specs go in, code comes out. That's the promise of AI coding agents. The problem is nobody talks about what happens when the spec is bad.

I spent months watching Cursor and Claude Code confidently build exactly what I asked for and nothing I actually needed. "Build a dashboard" gets you a dashboard. Just not the one you wanted.

So I built Speclint. It scores specs on five dimensions before any agent touches them: measurable outcomes, testable criteria, constraints, vague verb usage, and verification steps. Each gets a 0-100 score. The scoring is deterministic (regex-based, not AI-generated) so you get the same result every time.

If the score is low, there's an AI rewrite that restructures the spec into something an agent can actually execute on. The diagnosis is free. The rewrite is the paid part.

Available as:
- CLI: `npx speclint lint`
- MCP server (works with Claude, Cursor, etc.)
- GitHub Action (gate PRs on spec quality)
- REST API

MIT licensed. https://github.com/DavidNielsen1031/speclint

Try it: https://speclint.ai

Curious if anyone else has run into the "spec quality → code quality" bottleneck with AI agents.
