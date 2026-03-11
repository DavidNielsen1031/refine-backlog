# Codex for Open Source — Application for Speclint

## Project Information

**Project name:** Speclint
**GitHub URL:** https://github.com/speclint-ai/speclint
**Website:** https://speclint.ai
**License:** MIT
**Language:** TypeScript
**npm packages:** @speclint/core, @speclint/cli

## What does your project do?

Speclint is an open-source linter for natural-language specifications that are fed to AI coding agents (Claude Code, Codex, Cursor, GitHub Copilot Workspace). It scores specs across 6 dimensions — measurable outcomes, testable criteria, constraints, vague verbs, definition of done, and verification steps — and returns a 0-100 completeness score with actionable feedback on what's missing.

The problem it solves: AI coding agents build exactly what the spec says, not what the developer meant. Vague specs like "improve dashboard performance" produce unpredictable results regardless of model quality. Speclint makes spec quality measurable and enforceable, reducing agent rework from hours to minutes.

## How would Codex help your project?

1. **Code review on PRs:** Community contributions to the scoring engine need careful review — false positives and scoring regressions directly impact developer trust. Codex could review PRs for logic correctness and test coverage.

2. **Understanding the codebase:** As the project grows (codebase-aware scoring, multi-language support, IDE plugins), new contributors need to understand the scoring pipeline and schema validation. Codex can help onboard contributors faster.

3. **Security scanning:** Speclint processes user-provided natural language input via API. Ensuring there are no injection vectors, prompt injection risks, or dependency vulnerabilities is critical for a tool that integrates into CI pipelines.

4. **Test generation:** The scoring engine has 35 tests today. As we add dimensions and edge cases, maintaining comprehensive test coverage is essential. Codex can help generate edge case tests for scoring logic.

## Project impact

- Published on npm (speclint v1.1.0, @speclint/core v1.0.0, @speclint/cli v1.0.0)
- GitHub Action on the marketplace (speclint-ai/speclint-action)
- Real external usage: Azure-based IPs hitting the API organically
- Addresses a gap in the AI coding agent ecosystem: spec quality before code generation
- Complements Codex directly — better specs → better Codex output

## Maintainer information

**Primary maintainer:** David Nielsen (davidnielsen1031@gmail.com)
**Organization:** Perpetual Agility LLC
**npm username:** davidnielsen1031
**GitHub org:** speclint-ai

## Additional context

Speclint is particularly relevant to the Codex ecosystem because it sits upstream of all AI coding agents. Better specs don't just help Speclint users — they make every Codex session more productive. We'd love to explore deeper integration with the Codex workflow.

---

*Application prepared March 6, 2026*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
