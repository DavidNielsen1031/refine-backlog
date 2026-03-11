# Speclint.ai — Lean Canvas

*Drafted: March 3, 2026 | SVPG Product Masterclass exercise*

---

## Problem (Top 3)
1. **AI coding agents fail on vague specs.** Teams hand tickets to Codex, Claude Code, Copilot — and get garbage back. The bottleneck isn't the agent, it's the input. MercadoLibre discovered this scaling SDD to 20,000 developers.
2. **No quality gate exists between human intent and agent execution.** CI has linters for code — but nothing lints the ticket *before* the agent touches it. Bad specs waste tokens, time, and trust in AI tooling.
3. **Engineering managers can't measure spec quality.** They know "some tickets work great with agents and some don't" but have no data, no scores, no dashboards to identify the pattern or coach their teams.

## Solution (Top 3 Features)
1. **Spec Linting API** — POST a ticket, get a completeness score (0-100), agent_ready boolean, and specific fix suggestions. One API call, <2 seconds.
2. **GitHub Action** — Lint every issue on open/edit. Auto-comment with score + suggestions. CI-gated: block agent work on specs below threshold.
3. **Team Dashboard** — Track spec quality over time, identify who writes agent-ready specs and who doesn't, measure improvement.

## Unique Value Proposition
**"Lint your tickets before agents touch them."**

Code has ESLint. Specs have Speclint. The missing quality gate between human thinking and AI execution.

## Unfair Advantage
- First product in the "spec quality" category — no direct competitor
- Real organic usage (~17 Azure IPs pre-launch)
- Dogfooding: we use Speclint on every sub-agent task we spawn (internal key, visible proof)
- API-first architecture = embeddable everywhere (CI, IDE, Slack, agents)
- Deep understanding of what makes agents succeed or fail (built from running 100s of agent tasks)

## Customer Segments
- **Primary:** Engineering managers at AI-forward teams (50-500 devs) adopting coding agents
- **Secondary:** Solo developers / indie hackers using Codex, Claude Code, Cursor agents
- **Tertiary:** Platform teams building internal agent workflows (MercadoLibre-style SDD rollouts)

## Key Metrics
- Monthly Recurring Revenue (MRR)
- API calls/month (usage = value signal)
- GitHub Action installs
- Specs linted → agent_ready rate (are teams improving?)
- Free → Solo → Team conversion rate
- Churn rate by tier

## Channels
- **Show HN:** Draft approved, ready to post (David's go/no-go)
- **GitHub Marketplace:** GitHub Action as discovery channel
- **AI agent directories:** Listed on agent tool registries, MCP directories
- **Content:** Blog (5 posts live, 21 more drafted), X/Twitter, LinkedIn
- **Dev communities:** r/ExperiencedDevs, AI engineering Discords, indie hacker communities
- **Word of mouth:** Developers share tools that save them time

## Cost Structure
- **Hosting:** Vercel Pro (~$20/mo), Upstash Redis free tier
- **AI API:** Anthropic (Claude for linting engine, ~$10-50/mo at scale)
- **Domain:** speclint.ai (~$15/yr)
- **Stripe fees:** 2.9% + $0.30 per transaction
- **npm hosting:** Free (CLI + MCP server published)
- **Total burn:** <$75/mo infrastructure

## Revenue Streams
- **Solo plan:** $29/mo (individual developer, unlimited lints)
- **Team plan:** $79/mo (team dashboard, CI integration, multiple repos)
- **Gross margin:** ~95%+ (SaaS, API calls are pennies)
- **LTV target:** $350+ per team (12+ month retention)
- **Revenue model:** Monthly recurring subscriptions via Stripe
- **Future:** Enterprise tier ($199+/mo) for compliance-driven orgs (SOC2, audit trails)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
