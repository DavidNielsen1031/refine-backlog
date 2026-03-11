# We Use Speclint to Build Speclint

**Target Audience:** Developers and product teams building AI-assisted workflows; founders shipping developer tools; anyone who's heard "dogfood your own product" and wondered what that actually looks like in practice.

---

## Hook

What happens when your spec linter fails your own specs? That's exactly what happened in Sprint 5 when we started running every Speclint ticket through the Speclint API before writing a single line of code. Our first batch of specs averaged a 65. By the end of the sprint, we were hitting 100s first try — and our code quality followed.

---

## Section 1: What "Customer Zero" Actually Means

We don't just test Speclint — we build with it. Every Sprint 5 ticket started as a spec that had to pass our own scorer before development began. This isn't a QA step; it's the workflow.

## Section 2: Sprint 5 By the Numbers

Average spec score at sprint start: 65. Average at sprint end: 100. We'll walk through what changed — not in the tool, but in how we write specs.

## Section 3: The First Failure (And What It Taught Us)

SL-026 was our wake-up call. The spec described the feature clearly enough for a human — but the scorer flagged missing acceptance criteria structure, vague action verbs, and an untestable outcome. We rewrote it. Scored 100. The implementation was cleaner.

## Section 4: What Good Specs Actually Look Like

Concrete examples from Sprint 5: before and after. The difference isn't length — it's precision. Testable outcomes, clear action verbs, one behavior per criterion.

## Section 5: Why This Changes How You Build

When the spec is the quality gate, your team's thinking shifts upstream. Developers stop asking "what did you mean by this?" Engineers stop guessing at edge cases. The spec becomes a contract, not a suggestion.

## Section 6: Try It on Your Own Backlog

You don't have to build a product to dogfood Speclint. Pick your worst ticket, run it through the API, and see what comes back.

---

## CTA

Run your next ticket through Speclint before you write the first line of code. → [speclint.ai](https://speclint.ai)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
