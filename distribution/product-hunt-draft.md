# Speclint — Product Hunt Launch Draft

*Updated 2026-03-09 for current product state*

## Tagline (60 char max)
Score and fix your specs before AI agents build from them.

## Short Description (240 char)
Speclint scores your natural-language specs across 5 dimensions, then rewrites the ones that fail — so AI coding agents build the right thing the first time. Open source (MIT). CLI, GitHub Action, MCP server, API. Free tier, no signup.

## Full Description

AI coding agents build exactly what the spec says. Not what you meant.

One vague spec → 4 hours of agent rework → $200 in wasted compute. Multiply that across a team and you're burning thousands a month on specs that should've been caught before any code was written.

**Speclint catches them.**

Drop in a spec like "Improve dashboard performance" and Speclint scores it 0–100 across five dimensions: measurable outcome, testable criteria, constraints, vague verbs, and verification steps. Score below 70? It rewrites the spec to fix the gaps — surgically, only touching failing dimensions.

**Four ways to use it:**
- **CLI:** `npx speclint lint "your spec"`
- **GitHub Action:** scores issues on open, writes back a breakdown, optionally rewrites
- **MCP Server:** inline in Claude Desktop or Cursor
- **REST API:** for pipelines and automation

**Open source.** The scoring engine is MIT-licensed. Run it locally for free, forever. The hosted API adds codebase-aware rewrites, batch processing, and agent-specific output.

**Pricing:** Free (5 lints/day), Lite ($9/mo), Solo ($29/mo), Team ($79/mo).

We dogfood this daily — every spec in our own sprints runs through Speclint before any agent touches it.

Built by a solo founder (Agile delivery coach, 10+ years) who got tired of watching agents confidently build the wrong thing.

## First Comment (Maker Comment)

Hey PH 👋

I built Speclint because I kept watching AI coding agents confidently build the wrong thing — and it was never the agent's fault. The specs were bad.

"Add user authentication" scores 15/100 on Speclint. No measurable outcome, no testable criteria, no constraints. An agent will build *something* from that spec, but it probably won't be what you wanted.

The insight: spec quality is measurable, and most of the fixes are mechanical. You don't need a senior engineer to add "with email/password and Google OAuth, verified by successful login/logout cycle" — you just need a tool that notices it's missing.

The scoring is deterministic (regex-based, not LLM opinion) so the same spec always gets the same score. The rewrite uses Claude Haiku to fix only the failing dimensions. Your voice stays intact.

I shipped the scoring engine as MIT open source. If you want to run `npx speclint lint` locally and never pay me a dime, that works. The hosted API adds context-aware rewrites and pipeline features.

Honest feedback welcome — especially if you try it and it scores YOUR spec low. That's the point.

## Topics/Tags
- Developer Tools
- AI
- Open Source
- GitHub
- Productivity

## Gallery Images Needed
1. Hero — "Clean spec in. Clean code out. FIX THE SPEC." headline with score gauge
2. Before/after — spec scoring 15 → rewritten to 92
3. GitHub Action — issue comment with score breakdown
4. MCP — Claude Desktop using speclint tool
5. Pricing — 4-tier cards

## Launch Checklist
- [ ] David logs into producthunt.com (dnielsen1031 or create new)
- [ ] Upload gallery images (screenshots from speclint.ai)
- [ ] Schedule launch (Tuesday or Wednesday, 12:01 AM PT)
- [ ] Prep upvote asks (X post, Discord communities, HN comment)
- [ ] Set canonical URL to speclint.ai
- [ ] Add makers: David Nielsen

---
*Source: [[products/speclint/BACKLOG|Speclint Backlog]]*
