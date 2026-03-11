# Reference: "Your LLM Doesn't Write Correct Code. It Writes Plausible Code."

**Author:** Hōrōshi (KatanaQuant) — @KatanaLarp
**Date:** March 6, 2026
**URL:** https://x.com/KatanaLarp/status/2029928471632224486
**Substack:** https://blog.katanaquant.com/p/your-llm-doesnt-write-correct-code
**Engagement:** 3,368 likes, 402 RTs, 95 comments

## Why This Matters for Speclint

This article is the most thorough articulation of the problem Speclint solves. The author's conclusion:

> "LLMs work best when the user defines their acceptance criteria before the first line of code is generated."

That is Speclint's entire thesis in one sentence.

## Key Stats to Cite

- **20,171x slower** — LLM-generated SQLite rewrite on basic primary key lookup vs real SQLite
- **82,000 lines of Rust** to solve what a 1-line cron job handles
- **576,000 lines** of LLM-generated code, 3.7x more than SQLite, yet missing a critical 4-line check
- **METR study:** Experienced developers using AI were **19% slower** but believed they were 20% faster
- **Google DORA 2024:** Every 25% increase in AI adoption → 7.2% decrease in delivery stability
- **GitClear:** Copy-pasted code exceeded refactored code for the first time ever (2024)
- **Mercury benchmark (NeurIPS 2024):** LLMs achieve ~65% correctness but under 50% when efficiency is also required
- **BrokenMath (NeurIPS 2025):** Even GPT-5 produced sycophantic false proofs 29% of the time

## Key Quotes for Marketing

> "The code is not yours until you understand it well enough to break it."

> "LLMs optimize for plausibility over correctness."

> "576,000 lines and no benchmark. That is not 'correctness first, optimization later.' That is no correctness at all."

> "If you prompted the code and cannot explain why it chose a full table scan over a B-tree search, you do not have a tool."

> "The vibes are not enough. Define what correct means. Then measure."

## How to Use in Speclint Content

1. **Blog post:** "Why Spec Quality Matters More Than Model Quality" — cite the SQLite case study
2. **Show HN comments:** When someone says "just use a better model" — link this article
3. **Landing page:** The METR stat (19% slower + thought they were faster) is perfect for the hero section
4. **README:** The "define acceptance criteria before code" quote belongs in the OSS README
5. **LinkedIn/X posts:** "An LLM-generated database was 20,171x slower than SQLite. It compiled. It passed tests. The problem wasn't the model — it was the spec."

## Related Research (from article)

- Sharma et al. "Towards Understanding Sycophancy in Language Models" — ICLR 2024
- Mercury benchmark — NeurIPS 2024
- METR RCT — July 2025 (updated Feb 2026)
- GitClear AI Code Quality 2025
- Google DORA 2024

---
*Saved March 7, 2026 — for Speclint content strategy*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
