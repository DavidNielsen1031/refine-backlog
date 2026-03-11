# LinkedIn Post Draft

Today we open-sourced Speclint — a linter for the specs you feed to AI coding agents.

The insight that led to this: AI coding agents build exactly what you ask for. The problem is what you're asking for.

"Make the dashboard faster" → unpredictable agent output, hours of rework.
"Dashboard P95 < 800ms, measured via Lighthouse, no test regressions" → right code, first try.

Speclint scores specs on 6 dimensions and gates them before any agent touches them. The scoring engine is 94 lines of TypeScript. We're not pretending it's complex. The value is making spec quality measurable and enforceable in CI.

Open source (MIT): github.com/speclint-ai/speclint
Try it: npx @speclint/cli lint "your spec here"

If you're running AI coding agents in your workflow, I'd love your feedback on the scoring dimensions.

#OpenSource #AI #DeveloperTools #CodingAgents #GitHub

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
