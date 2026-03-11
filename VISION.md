# Speclint — Vision

## The Problem

AI coding agents are being deployed into pipelines fed by garbage specs.

The industry is focused on making agents smarter. Nobody is fixing the input.  
Garbage in = garbage out — but the garbage is invisible until a PR gets rejected 4 hours later.

## The Vision

Speclint becomes the **standard preflight check** for every AI coding pipeline.

Like ESLint for code, Speclint for specs.  
Like a build gate in CI, Speclint fires BEFORE an agent starts work.

In 2 years: when a team spins up a new repo with GitHub Actions, "Add Speclint" is as automatic as adding a linter.

## Why Now

- 84% of devs are using AI coding tools (2025)
- Agentic coding pipelines are becoming standard infrastructure
- The spec-quality problem gets WORSE as agents get faster (bad specs → rejected work in minutes, not days)
- No direct competitor owns this space yet

## Strategic Bets

1. **GitHub Action is the land-and-expand** — zero-friction, shows up in the repo, becomes infrastructure
2. **Completeness score is the hook** — a number gives teams something to optimize, discuss, enforce
3. **Codebase context is the moat** — nobody else is injecting "your actual stack" into acceptance criteria
4. **Agent-native from day 1** — llms.txt + OpenAPI + MCP = agents discover and use us without human help

---

*March 1, 2026*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
