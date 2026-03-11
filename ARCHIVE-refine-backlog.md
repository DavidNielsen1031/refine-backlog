> ⚠️ **ARCHIVED** during Phase 1A normalization (March 2, 2026). Canonical backlog: `products/speclint/BACKLOG.md`

# Refine Backlog — Backlog

## Now
- [x] **RB-048** — Homepage CTA above the fold → /pricing ✅ 2026-02-25
  - Problem: Analytics (Feb 24) show 79 homepage visitors → only 2 hit /pricing = 97% drop-off.
  - Done: Hero primary CTA changed from scrollToRefiner() to Link href="/pricing" ("Start Refining Free"). Secondary CTA (See It In Action) unchanged. Commit 8f7ee39. Staged for push.
- [ ] **RB-016** — Monitor Product Hunt launch + respond to all comments
  - Problem: PH ranks by engagement. Every unanswered comment is a missed upvote.
  - Value: HIGH | Effort: S
  - Status: LAUNCH LIVE Feb 18, 2026
- [ ] **RB-017** — Conduct 2-3 more validation interviews (target: 10 total)
  - Problem: 1/10 interviews done. Need more signal before building features.
  - Value: HIGH | Effort: M
  - Source: CO-001 market validation gate

## Next
- [ ] **RB-049** — Submit Refine Backlog to AI tool directories (training data SEO)
  - Problem: Claude defaults to tools it's seen in training data. shadcn/ui is at 90.1% default pick because it's everywhere. We need to be in the directories that AI crawlers index.
  - Targets: Futurepedia, There's An AI For That (theresanaiforthat.com), AI Tool Hunt, TopAI.tools, AI Finder, ProductHunt AI category, Glama (claimed ✅), OpenTools.ai, Toolify.ai
  - Also: Submit openapi.yaml to APIs.guru and public API directories
  - Goal: When someone asks Claude "how do I refine my backlog?", Refine Backlog is the default reach
  - Value: HIGH | Effort: S (2-3 hours of form submissions)
  - Reference: @shadcn thread — https://x.com/shadcn/status/2027062972753866796

## Next (Post-Validation Feature Requests from Gordon Interview)
- [ ] **RB-018** — Definition of Done (DOD) generation
  - Problem: Teams need DOD aligned to acceptance criteria. Gordon's #1 request.
  - Use story tags (security, performance) as guardrails to auto-generate DOD.
  - Value: HIGH | Effort: M
- [ ] **RB-019** — Epic-level refinement
  - Problem: No way to organize stories under epics or prioritize by epic order.
  - Value: MEDIUM | Effort: L
- [ ] **RB-020** — MoSCoW prioritization method
  - Problem: Only one prioritization approach (HIGH/MED/LOW). MoSCoW is widely used.
  - Value: MEDIUM | Effort: S
- [ ] **RB-021** — Definition of Ready (DOR) checklist
  - Problem: Teams need entry criteria before stories enter sprint. Front-load requirements.
  - Value: MEDIUM | Effort: S
- [ ] **RB-022** — AI/GenAI development niche positioning
  - Problem: Competitive differentiator. "If you pitch this as your AI agile developer, you hit a niche" — Gordon
  - Value: HIGH | Effort: M
- [ ] **RB-023** — Prompt export for coding agents (Rovo, Cursor, etc.)
  - Problem: Output could be copy-paste prompts for AI dev tools. "You become the prompt maker."
  - Value: MEDIUM | Effort: M
- [ ] **RB-024** — Coaching insights from anonymized usage data
  - Problem: Premium feature opportunity. Mine trends from user inputs for thought leadership.
  - Value: LOW | Effort: L
- [ ] **RB-025** — Planning Poker integration
  - Problem: Natural complement to refinement. Teams estimate during or after refining.
  - Value: MEDIUM | Effort: L
- [ ] **RB-026** — Scrum.org best practices integration
  - Problem: Bake authoritative refinement practices into the engine for better output quality.
  - Value: MEDIUM | Effort: M

## Next (Agent-Native Discovery Sprint — shipped 2026-02-18, value capture remaining)
- [x] **RB-030** — Verify live agent-discovery URLs post-Vercel deploy ✅ 2026-02-18
  - All confirmed 200: refinebacklog.com/llms.txt, /openapi.yaml, /mcp/README.md
  - Also confirmed: MCP server running on MacBook Claude Desktop

- [ ] **RB-031** — Submit to llmstxt.org registry
  - Problem: Free discoverability for AI agents. Takes 5 minutes. Early listing = real visibility.
  - Action: submit at llmstxt.org with refinebacklog.com/llms.txt
  - Value: HIGH | Effort: XS

- [ ] **RB-032** — Submit MCP server to agent registries (Glama, MCP.so, Smithery)
  - Problem: These are the App Stores for MCP tools. Early listings get organic traffic now.
  - Action: submit refine-backlog-mcp to all 3. Package name + description + GitHub link.
  - Value: HIGH | Effort: S

- [x] **RB-033** — Add "For AI Agents" section to landing page ✅ 2026-02-21
  - Problem: Zero agent-native signals on the marketing site. Technical users don't know this exists.
  - Done: `AgentNativeSection` component built — 3-card layout (llms.txt, OpenAPI, MCP). Positioned between Integrations and Pricing. LIVE at refinebacklog.com ✅ (verified 2026-02-23).

- [x] **RB-034** — Reframe Pro/Team pitch around API-direct use, not Claude Desktop ✅ 2026-02-21
  - Problem: Paywall test showed Claude will refine manually when API hits rate limit. The real paying customer is someone piping items through scripts/integrations, not casual Claude Desktop users.
  - Done: Pro → "For developers using the API" + "License key for scripts & pipelines". Team → "For engineering orgs automating at scale" + "5 license keys for team automation". FAQ Pro vs Team rewritten. LIVE at refinebacklog.com ✅ (verified 2026-02-23).

- [ ] **RB-035** — Post agent-native sprint on X
  - Problem: Zero marketing for today's work. The "How to Sell to Agents" crowd will appreciate a solo founder shipping MCP + llms.txt in one session.
  - Content: screenshot of Claude Desktop calling refine_backlog + the upgrade prompt firing. Short thread.
  - Value: HIGH | Effort: S

- [x] **RB-036** — Track agent vs. human traffic in telemetry ✅ 2026-02-19
  - Problem: No visibility into how much MCP/API traffic vs. browser traffic. Can't optimize what you can't measure.
  - Action: detect user-agent or x-client header in /api/groom. Log source: "mcp" | "browser" | "api-direct"
  - Value: MEDIUM | Effort: S
  - Done: detectSource() in telemetry.ts; Redis keys telemetry:source:{source}:{day}; bySource in getDailySummary()

- [x] **RB-037** — Add llms.txt link to site footer ✅ 2026-02-19
  - Problem: Emerging standard — should be discoverable alongside privacy policy and terms.
  - Value: LOW | Effort: XS
  - Done: Added "For AI Agents (llms.txt)" + "API Spec (OpenAPI)" links in footer Product column

- [x] **RB-038** — Rename /api/groom → /api/refine (with redirect) ✅ 2026-02-19
  - Problem: Internal endpoint name predates product rebrand. Incoherent for developers.
  - Action: add /api/refine route, keep /api/groom as a redirect. Update llms.txt + openapi.yaml.
  - Value: LOW | Effort: S
  - Done: /api/refine/route.ts re-exports from groom (single source of truth). llms.txt + openapi.yaml updated to /api/refine as canonical.

- [x] **RB-039** — npm token renewal reminder (expires May 19, 2026) ✅ 2026-02-20
  - Cron job created (ID: 53d2c8b1) — fires May 12, 2026 9 AM CT (1 week before expiry)
  - systemEvent → main session. Token: NPM_TOKEN_REFINE_BACKLOG in global.env
  - Value: MEDIUM | Effort: XS

- [x] **RB-040** ✅ 2026-02-20 — Gate MCP server to paid users via REFINE_BACKLOG_KEY env var
  - MCP v1.0.6 published. Reads key from env, passes as x-license-key header. Upgrade prompt shows exact Claude Desktop config snippet.

- [x] **RB-042** — Resend: email license key on purchase ✅ 2026-02-22
  - `sendLicenseEmail()` in webhook fires on `checkout.session.completed`
  - HTML email: license key prominently displayed, curl example, MCP config snippet
  - From: `hello@perpetualagility.com` via Resend (domain verified, DKIM+SPF+MX all green)
  - Non-blocking: email failure never affects webhook 200 response to Stripe
  - Env vars live in Vercel: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
  - DNS added to GoDaddy via API, verified in Resend in <5 minutes

- [x] **RB-043** — Auto-detect repo context for GitHub Action (zero-config context injection) ✅ 2026-02-22
  - Problem: Users who install the action get generic 5.7/10 output because they don't know to set the `context:` field. Most won't. Our own DankBot output scored 4/10 (wrong icon spec, platform confusion) before we hardcoded context. Auto-detection makes every user get good output out of the box.
  - Done: Full multi-source detection JS in `action.yml` — reads AGENTS.md/CLAUDE.md/CODEX.md/GEMINI.md → package.json (name+deps) → Next.js/Vercel/Netlify signals → Prisma models → Expo/app.json → pyproject.toml/Cargo.toml/go.mod/pubspec.yaml → README.md → CODEOWNERS team size. Caps at 700 chars, sanitizes shell-unsafe chars. Explicit `context:` still overrides. Falls back gracefully. `v1` tag already updated (8ec3501).
  - Value: HIGH (product quality for all users) | Effort: S

- [x] **RB-044** — CLI auto-detection: read context from CWD ✅ 2026-02-22
  - Done: `refine-backlog-cli@1.0.2` ships with `--no-auto-context` flag to disable and `--context` to override. Auto-detection reads from CWD on every run. Confirmed via `npx refine-backlog-cli --help`.
  - Value: HIGH | Effort: S

- [x] **RB-045** — Website context textarea ✅ 2026-02-22
  - Done: Collapsible "Project context (optional)" textarea in `backlog-refiner.tsx`. Shows "✓ set" indicator when filled but collapsed. Placeholder: "e.g. iOS app, solo founder, React Native + RevenueCat". Passes `context` in API request. Committed in `6508268`.
  - Value: HIGH | Effort: S

- [x] **RB-046** — Blog post: "Why Your AI Backlog Tool Doesn't Know You're Building an iOS App" ✅ 2026-02-23
  - Done: Full post at `blog/context-aware-refinement/page.tsx`. Uses DankBot transparent icon rejection story as the hook. Before/after comparison table showing generic vs iOS-aware output. Explains all 5 detection sources. CTA: install the GitHub Action. Published date 2026-02-23. Added to blog index. Committed in `6508268`.
  - ⚠️ NOT YET LIVE — all commits (RB-033 through RB-046) are local, not yet pushed to GitHub. David needs to run `git push github main` in `products/refine-backlog/app/` to deploy everything to Vercel.
  - Value: HIGH (distribution + AI SEO) | Effort: M

- [x] **RB-041** — AI SEO: implement findings to get cited by AI search engines ✅ 2026-02-24
  - Research complete ✅ 2026-02-23 → `products/refine-backlog/docs/ai-seo-research.md`
  - **Phase 1 done (overnight 2026-02-24):** Answer capsules added to top 5 blog posts (commit `b260f7e`)
    - `hidden-cost-bad-backlog-items`, `why-sprint-planning-fails`, `definition-of-ready-checklist`, `backlog-refinement-best-practices`, `how-to-write-acceptance-criteria`
    - Blue left-border callout style, 20-25 word data-specific sentences after every H2
  - **Phase 2 remaining (Next sprint):**
    1. ~~Add FAQ schema JSON-LD to top 5 posts~~ ✅ 2026-02-25 (commit 6f9b89b — 5/5 posts done, 4 FAQs each, data-specific and content-grounded)
    2. ~~Add named author byline to all posts~~ ✅ 2026-02-27 (commit d3dd13a — all 16 posts, author schema updated to Person)
    3. ~~Add source citations to `hidden-cost-bad-backlog-items`~~ ✅ 2026-02-28 (commit 2c7ffec)
    4. ~~Rewrite `ai-powered-backlog-refinement` as comparison post (vs raw ChatGPT)~~ ✅ 2026-02-28 (commit 2c7ffec)
  - **New posts to write:** ~~(1) Refinement timing benchmarks~~ ✅ 2026-03-01 (commit 9998a71), ~~(2) 15-item DoR checklist~~ ✅ 2026-02-28 (commit 2c7ffec), ~~(3) RB vs Jira vs Linear comparison~~ ✅ 2026-02-27 (commit d3dd13a)
  - **RB-041 Phase 2 COMPLETE** — all new posts written. All commits LOCAL, need `git push github main` to deploy.
  - Source: @coreyhainesco marketing skills thread (2026-02-22 X feed)
  - Value: HIGH | Effort: M

## Lessons Learned

### ⚠️ Claude.ai MCP demo is the WRONG surface for monetization (2026-02-19)
**What happened:** Attempted to demo the product via Claude.ai connector. Free tier 429 fires → Claude "pivots to manual refinement" and does the task in-context, completely bypassing the paywall. The paywall doesn't hold when the AI model sitting on top of the tool can do the task natively.

**Root cause:** Claude is trained to be helpful. Tool failure = fallback to in-context reasoning. Our product's core task (text transformation) is something Claude can do without us.

**Implication for business model:**
- The Claude.ai/MCP surface is NOT where monetization is defensible
- The paywall holds only in programmatic/scripted contexts where Claude isn't in the loop (curl, scripts, CI/CD, automations, Jira integrations)
- Free tier rate limiting actually serves as a FILTER — removes wrong customers (Claude chat users who'll bypass), keeps right customers (developers evaluating the API for automation)

**Implication for demos and marketing:**
- NEVER demo via Claude.ai chat — Claude will bypass the paywall on camera
- ALWAYS demo via curl / script / terminal — shows the real use case, paywall holds, output is clean
- The screenshot for X posts = terminal output, not Claude.ai chat

**Implication for positioning (RB-034 confirmed):**
- Lead with "use the API in your scripts and pipelines" not "use in Claude Desktop"
- Target audience: developers building automations, not PMs clicking through Claude.ai

---

## Later
- [ ] **RB-047** — Phase 0 market context enrichment in `/api/discover` (GitHub #17)
  - Problem: Discovery questions are generated in a vacuum — based only on the user's story text. Questions are only as good as what the user already knows.
  - Solution: Accept optional `market_context` field in `/api/discover` — caller injects competitor signals, common failure modes, review patterns. We feed it into the discovery prompt so questions are grounded in market reality.
  - Phase 1 (simple): Accept `market_context` string input, inject into prompt. Zero new infra.
  - Phase 2 (full): `enrich: true` flag triggers automated research pass (web search, competitor patterns). Pro-only. Feeds back as enriched discovery questions.
  - Why defensible: live market data an LLM in the loop can't replicate in-context.
  - Inspired by: Frederik Roessell's Feature Discovery skill + Kobeissi's "static tools lose to tools owning live data" (Feb 24, 2026)
  - Value: HIGH | Effort: M (Phase 1), L (Phase 2)
- [ ] **RB-011** — Gumroad/Lemon Squeezy storefront for digital products
- [ ] **RB-012** — Automated SEO content pipeline (cron-based publishing)
- [ ] **RB-013** — Usage analytics dashboard (internal)
- [ ] **RB-015** — Document the journey (meta-content for marketing)
- [ ] **RB-008** — Create first digital product (template pack)

## Completed
- [x] **RB-001** — David approves product direction and strategy ✅ 2026-02-16
- [x] **RB-002** — Register domain (refinebacklog.com) ✅ 2026-02-16
- [x] **RB-003** — Build MVP landing page + waitlist ✅ 2026-02-16
- [x] **RB-004** — Build core product (refinement engine) ✅ 2026-02-16
- [x] **RB-005** — Stripe integration + pricing page ✅ 2026-02-16
- [x] **RB-006** — Deploy to Vercel production ✅ 2026-02-17
- [x] **RB-007** — Write SEO launch articles ✅ 2026-02-17 (2 posts published)
- [x] **RB-009** — Product Hunt launch ✅ 2026-02-17
  - Custom RB logo, screenshots, maker comment, promo code PRODUCTHUNT (50% off Pro 3mo)
- [x] **RB-010** — OG image for social sharing ✅ 2026-02-17 (PH gallery images)
- [x] **RB-014** — User Stories + Gherkin checkboxes ✅ 2026-02-17
  - User story as separate field below problem statement, Gherkin AC via Given/When/Then
- [x] **RB-027** — Usage telemetry (tokens, cost, latency per API call) ✅ 2026-02-17
- [x] **RB-028** — Stripe promo code support at checkout ✅ 2026-02-17
- [x] **RB-029** — Marketing engine (SEO research, content calendar, Reddit drafts, PH draft) ✅ 2026-02-17

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
