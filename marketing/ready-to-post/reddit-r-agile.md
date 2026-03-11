# Reddit: r/agile

**Title:** Spec quality scoring for teams using AI coding agents

**Body:**

Product managers and delivery coaches: if your team is using AI coding agents (Cursor, Copilot, Claude Code, Codex), you've probably noticed that the quality of what comes out is directly tied to the quality of what goes in.

Vague user stories produce vague code. Every time.

I built Speclint to catch this before sprint planning. Paste a user story or spec, get scored 0-100 on five dimensions:

1. **Measurable outcomes** - does it define what success looks like?
2. **Testable criteria** - can you write a test against this?
3. **Constraints** - performance, security, accessibility boundaries?
4. **Vague verb detection** - "handle," "manage," "improve" with no specifics
5. **Verification steps** - how do you confirm it's done?

The scoring is deterministic (not AI-generated) so your team gets consistent results. If a story scores below 70, the AI rewrite engine restructures it with the missing pieces.

Free to lint. Open source (MIT). Works as a web app, CLI, MCP server, or GitHub Action.

https://speclint.ai

I'm a product coach and built this from real pain. Would love to hear how other teams handle spec quality, especially with AI agents in the mix.
