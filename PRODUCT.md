# Speclint — Product Definition

**URL:** https://speclint.ai  
**Tagline:** Lint your tickets before agents touch them.  
**Decision date:** March 1, 2026 (pivot from Refine Backlog)

---

## What It Is

Speclint is the preprocessing layer for AI-driven development pipelines.

Before a coding agent (Cursor, Codex, Claude Code, Devin) touches a ticket, Speclint validates the spec:
- Is the problem statement clear?
- Are there testable acceptance criteria?
- Is the scope bounded?
- Are constraints and DoD defined?

Vague spec → agent fills gaps with hallucination → wasted hours → rejected PRs.  
Speclint catches that BEFORE it happens.

---

## Target User — Jake (AI-Savvy Dev Firm Owner)

Runs a 1-5 person dev firm using AI coding agents heavily.  
Stack: GitHub Issues → agents → CI/CD. No PM, no Scrum Master.  
Pays for tooling that saves agent hours or prevents bad PRs.  
**Metric they care about:** "Does this prevent one bad agent sprint per month?"

Full persona: `roles/rb-buyer-persona.md` (Jake — rebrand in progress)

---

## Core Product = `/api/refine` endpoint

The API is the product. Everything else is a delivery mechanism.

**Delivery mechanisms (in priority order):**
1. **GitHub Action** — fires on `issue.opened`, auto-refines before agent picks it up
2. **API** — orchestrators call this before assigning tickets to agents
3. **CLI** — for power users and local pipelines
4. **MCP server** — for Claude Desktop / agent-native workflows

---

## Pricing (LOCKED — updated March 1, 2026)

| Tier | Price | Value Layer | Includes |
|------|-------|-------------|----------|
| Free | $0 | **Structure** | 5 specs/day, completeness_score (5 dimensions), no API key |
| Solo | $29/mo | **+ Fit** | Unlimited API, `codebase_context`, inline `persona` scoring, AI-assisted rewrite, 25 items/request |
| Team | $79/mo | **+ Scale** | Stored personas (save/name/share), persona analytics, 50 items/request, team dashboard, SLA, audit log |

**Tier progression:** Structure → Fit → Scale.
- Free: "Is this spec structurally complete?"
- Solo: "Is it complete for THIS codebase and THIS user?" (pass context + persona inline)
- Team: "Can my whole team write specs this good?" (stored personas, analytics, shared standards)

---

## Key Differentiators

- **Spec completeness score** — numeric gate (0-100) to hold or release tickets
- **Codebase context injection** — ACs reference actual tech stack
- **Agent-native output** — structured JSON parseable by agents without extraction
- **GitHub Action** — zero-friction integration into existing workflow
- **Preflight framing** — required infrastructure, not optional productivity tool

---

## Tech Stack (inherited from Refine Backlog)

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Hosting:** Vercel (project rename pending)
- **Payments:** Stripe (Perpetual Agility LLC) — prices need update
- **AI Backend:** Claude (via Anthropic API)
- **Agent-native:** llms.txt, openapi.yaml, MCP server

---

## What We Are NOT

- Not "AI-powered backlog refinement for agile teams"
- Not a Scrum Master tool
- Not a web UI dashboard product
- Not targeting Jira-heavy enterprise teams

---

## Codebase Location

`products/refine-backlog/app/` — rebrand in progress  
GitHub: repo rename pending (currently `refine-backlog` under DavidNielsen1031)

---

---

## Internal Origin Story — "Our Process IS the Product"

*Adopted March 1, 2026. Source: Nate B Jones P1-P6 framework.*

Speclint didn't start as a product idea. It started as a problem we kept hitting: sub-agents would build the wrong thing because the spec was vague. We fixed that internally with `SPEC_TEMPLATE.md` (a 4-section spec framework) and a mandatory pre-flight checklist. Then we realized: **every team using AI coding agents has this exact problem.**

### The P1-P6 → Speclint Feature Map

Our internal improvements (from Nate B Jones' "4 Prompting Skills" + "5 Levels of AI Coding") map directly to Speclint's product surface:

| P-item | Internal Fix | Speclint Feature | Status |
|--------|-------------|------------------|--------|
| **P1 🔴 Spec Template** | `SPEC_TEMPLATE.md` — 4-section framework (Context & Intent, Constraints, Success Criteria, Verification) | **completeness_score** — scores every issue against the same 4 dimensions. The template IS the rubric. | ✅ Live |
| **P2 🔴 Eval Requirements** | Sub-agents must include runnable verification steps, not self-reported "it works" | **Verification Steps dimension** in scoring rubric — issues without testable ACs score low on `has_testable_criteria` | ✅ Live |
| **P3 🟡 Decision Boundaries** | Intent engineering in AGENTS.md — "Klarna test" for every sub-agent task | **Constraints dimension** in scoring rubric — `has_constraints` checks for guardrails/anti-patterns. The "Klarna test" is baked into the score. | ✅ Live |
| **P4 🟡 Intelligence Budget** | Track whether sub-agent runs deliver value (tokens = purchased intelligence) | **completeness_score as ROI gate** — don't waste agent tokens on specs that score <70. The score IS the budget signal. | Conceptual |
| **P5 🟢 Multi-Agent Patterns** | `MULTI_AGENT_PATTERNS.md` — coordinator/specialist architecture | **GitHub Action as coordinator** — Speclint is the preflight coordinator that gates which specs reach specialist agents | ✅ Live |
| **P6 🟢 Prompting Skills Audit** | Identified eval-writing as our weakest skill; SPEC_TEMPLATE.md addresses it | **Product positioning** — "Spec quality is the bottleneck, not the model" (Dan Shapiro Level 4 insight). Speclint is how you level up from Level 3 → Level 4. | Messaging |

### The Core Insight

> *"The distance between Level 3 and Level 4 is the quality of the spec, not the quality of the model."*
> — derived from Nate B Jones / Dan Shapiro

Level 3 = reviewing agent code like a manager. Level 4 = writing specs so good you walk away and check if tests pass. **Speclint is the Level 4 tool.** It validates that a spec is Level-4-ready before any agent touches it.

### SPEC_TEMPLATE.md ↔ Speclint Scoring Rubric

| SPEC_TEMPLATE Section | Speclint Scoring Dimension | Points |
|----------------------|---------------------------|--------|
| 1. Context & Intent | `has_measurable_outcome` — problem field contains observable outcome | 25 |
| 2. Constraints & What NOT To Do | `has_constraints` — tags, assumptions, or explicit boundaries present | 20 |
| 3. Success Criteria | `has_testable_criteria` — ≥2 ACs with action verbs | 25 |
| 4. Verification Steps | `has_definition_of_done` — AC mentions specific state, value, or threshold | 10 |
| (Title quality) | `no_vague_verbs` — title isn't "improve X" with no specificity | 20 |

**The template we use internally to write good specs is the same rubric Speclint uses to score customer specs.** We're not selling theory — we're selling our own battle-tested process.

---

*Created March 1, 2026 — pivot from Refine Backlog based on Jake (rb-buyer) interview feedback*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
