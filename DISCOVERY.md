# DISCOVERY.md — Speclint

## Active Discovery (Sprint 9 Candidates)

| Item | Value Risk | Usability Risk | Feasibility Risk | Viability Risk | Status |
|------|-----------|---------------|-----------------|---------------|--------|
| Show HN launch (SL-018) | 🟡 Will HN care? | ✅ It's a post | ✅ Draft ready | 🟡 Conversion? | Ready |
| AI directory submissions (SL-015) | 🟡 Discovery channel? | ✅ Form fills | ✅ Known process | ✅ Free | Ready |
| Agent registry submissions (SL-016) | ✅ MCP users want this | ✅ Standard listing | ✅ Built | ✅ Free | Ready |
| Pricing validation (SL-020) | 🔴 Will devs pay $29? | ✅ N/A | ✅ N/A | 🔴 Core question | Needs Work |

## Research Queue

| Item | Question to Answer | Method | Priority |
|------|-------------------|--------|----------|
| Pricing sensitivity | Will solo devs pay $29/mo for spec linting? | Interview 3 devs (SL-020) | 🔴 |
| Competing tools | Has anyone built an OSS spec linter since our launch? | Web research | 🟡 |
| Agent ecosystem fit | Which agent platforms reference spec quality? | Ecosystem scan | 🟡 |

## Assumptions to Test

| Assumption | Evidence For | Evidence Against | Status |
|-----------|-------------|-----------------|--------|
| Devs want spec quality enforcement | ~17 organic Azure IPs pre-rebrand | No paying customers yet | Open |
| GitHub Action is the right delivery mechanism | Standard CI/CD, low friction | Some teams use Linear/Jira not GH | Open |
| $29/mo is right for Solo tier | Comparable to other dev tools | Competing with free OSS risk | Open |
| LLM power users are NOT our buyer | They bypass paywalls natively (LOCKED) | — | Validated |
| CI/automated contexts ARE our buyer | No human to manually refine | — | Validated |

## Insights Log

| Date | Insight | Source | Impact |
|------|---------|--------|--------|
| 2026-03-01 | Jake (buyer persona) said we were building wrong product → pivot to Speclint | Discord interview | Full pivot |
| 2026-03-01 | "I get it immediately" on Speclint name | Jake persona | Confirmed naming |
| 2026-03-02 | Superpowers (obra) targets executor, we target spec input | Competitive analysis | Different buyer, not competing |
| 2026-03-02 | Em dashes = #1 AI tell in copy | human-copy audit | Rewrote all copy |

*Last updated: 2026-03-04*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
