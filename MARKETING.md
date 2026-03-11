# Marketing — Speclint

## Identity
- **Name:** Speclint
- **Tagline:** Clean spec in. Clean code out.
- **URL:** https://speclint.ai
- **X Account:** @speclint
- **X Credentials:** ~/.config/env/speclint-x.env

## Positioning
- **One-liner:** Score your specs on 5 dimensions before AI agents build from them.
- **Problem:** AI coding agents fail on vague specs. "Build a dashboard" → garbage. Teams waste tokens and hours debugging spec-quality issues.
- **Solution:** Deterministic regex-based scoring (0-100) across 5 dimensions catches vague verbs, missing acceptance criteria, untestable requirements, and missing constraints. AI-powered rewrites transform failing specs into agent-ready instructions.
- **Differentiator:** Deterministic scoring (not AI-generated scores). Open source (MIT). Available as CLI, MCP Server, GitHub Action, and REST API — fits any workflow.

## Audience
- **Primary:** Software engineers, tech leads, product managers using AI coding agents (Cursor, Copilot, Claude Code, Codex)
- **Communities:** r/programming, r/agile, r/SideProject, r/devtools, Dev.to, Hacker News, Indie Hackers, MCP Discord servers

## Pricing
- **Model:** Freemium (diagnosis free, treatment paid)
- **Tiers:**
  - Free: 5 lints/day, 1 rewrite preview/day (category-level changes + score + 250-char preview)
  - Lite: $9/mo (unlimited lints, 20 rewrites/day)
  - Solo: $29/mo (unlimited everything, priority processing)
  - Team: $79/mo (team features, API access)

## Assets
- **Profile pic:** products/speclint/ph-assets/2026-03-10-01-32-x-pfp-v2.png
- **Banner:** products/speclint/ph-assets/2026-03-10-01-32-x-banner-v2.png
- **Screenshots:** products/speclint/ph-assets/
- **Demo video:** *(30-sec Loom needed — paste spec → see score)*

## Distribution Channels
- [x] X/Twitter — @speclint (credentials saved, OAuth1 needs reauth)
- [ ] Product Hunt — images ready, submission pending
- [x] Hacker News — Show HN posted Mar 6 (minimal traction)
- [ ] Dev.to — article drafted, needs publish
- [ ] Reddit — r/programming, r/agile, r/SideProject
- [ ] Toolify — $99 paid, submission in progress
- [x] TopAI — $47 paid, submitted Mar 10
- [ ] There's An AI For That — free, not submitted
- [ ] Glama MCP — free, not submitted
- [ ] Ben's Bites — free, not submitted
- [ ] OpenTools — free, blocked
- [ ] AI Scout — free, blocked

## Launch Copy

### Tweet (launch)
> 🚀 we just launched on @ProductHunt!
>
> speclint scores your specs on 5 dimensions and rewrites them so AI agents can actually ship from them.
>
> free to lint. open source.
>
> speclint.ai
>
> #buildinpublic #devtools #ai

### Tweet Thread
> 1/ the problem: AI coding agents fail on vague specs.
>
> "build a dashboard" → garbage.
> "build a dashboard with 3 KPI cards, date range filter, CSV export, loads <2s" → ships.
>
> speclint catches the gap before your agent wastes tokens.

> 2/ how it works:
> - paste any user story or spec
> - get scored 0-100 across 5 dimensions
> - measurable outcomes, testable criteria, constraints, vague verbs, verification steps
> - deterministic regex scoring, not AI vibes

> 3/ if your score is below 70, the AI rewrite engine transforms it into an agent-ready spec that actually ships.
>
> diagnosis is free. rewrite is the product.

> 4/ available everywhere:
> - npx speclint lint (CLI)
> - MCP Server (3 tools for Claude, Cursor, etc.)
> - GitHub Action (CI/CD gate)
> - REST API
>
> MIT open source: github.com/DavidNielsen1031/speclint

> 5/ try it free → speclint.ai
>
> ⭐ star the repo if it's useful
> 🔁 RT to help other devs ship better specs

### Reddit Title + Body
> **Title:** Show r/programming: Speclint – score your specs before AI agents build from them (open source)
>
> **Body:**
> I built Speclint because I kept seeing AI coding agents (Cursor, Copilot, Claude Code) produce garbage from vague specs.
>
> The fix isn't better AI — it's better specs.
>
> Speclint scores your user stories and specs 0-100 across 5 dimensions: measurable outcomes, testable criteria, constraints, vague verb detection, and verification steps. It's deterministic regex scoring (no AI randomness in the diagnosis).
>
> If your score is below 70, the AI rewrite engine transforms it into an agent-ready spec.
>
> Available as CLI (`npx speclint lint`), MCP Server, GitHub Action, and REST API. MIT open source.
>
> Try it: https://speclint.ai
> Repo: https://github.com/DavidNielsen1031/speclint
>
> Would love feedback from anyone using AI coding agents in their workflow.

### Directory Description (200 chars)
> AI spec linter that scores user stories 0-100 across 5 dimensions. Deterministic scoring + AI rewrites. CLI, MCP Server, GitHub Action. Open source MIT.

### Directory Description (500 chars)
> Speclint scores your specs on 5 dimensions before AI agents build from them. Deterministic regex-based scoring (0-100) catches vague verbs, missing acceptance criteria, untestable requirements, and missing constraints. AI-powered rewrites transform failing specs into agent-ready instructions that actually ship. Available as CLI (npx speclint lint), MCP Server (3 tools), GitHub Action (CI/CD quality gate), and REST API. Open source MIT. Free tier: 5 lints/day. Pro plans from $9/mo.
