# Why Your AI Spec Linter Needs preserve_structure

**Target Audience:** Developers and PMs using AI tools to process or reformat structured content; teams whose specs live in long documents or multi-AC tickets; anyone who's been surprised by how AI chunking destroys document context.

---

## Hook

Our best spec scored 40. Here's why. It was an 80-point spec — well-written, well-structured, testable acceptance criteria, clear outcome. Then our API chunked it. Four fragments, none with enough context to score correctly, each returning a 40. The spec didn't get worse. Our chunking strategy did.

---

## Section 1: The Spec That Broke the Scorer

Walk through the actual ticket: what it contained, why it was well-formed, and what score we expected. Then show what actually came back. Four 40s where one 80 should have been.

## Section 2: Why Chunking Kills Structured Documents

LLM context windows aren't infinite, so we chunk. But specs aren't paragraphs — they're structured documents where the header gives the ACs meaning, and the ACs validate the header. Split them and you get fragments that look incomplete because they are.

## Section 3: What preserve_structure Does

The `preserve_structure` flag tells the API to treat the spec as a single logical unit — no chunking, no fragmentation. If it's too long for one pass, it errors informatively instead of silently returning garbage scores.

## Section 4: When to Use It (And When Not To)

`preserve_structure` is the right default for any spec that has a title, context, and ACs that reference each other. It's overkill for single-sentence specs or standalone acceptance criteria you're scoring in isolation.

## Section 5: The Design Principle Behind It

Chunking is a performance optimization that breaks correctness for structured content. Whenever an AI tool processes structured data, the chunking strategy needs to understand the structure — not just the token budget.

---

## CTA

If you're using Speclint on multi-AC tickets and scores feel low, add `preserve_structure: true` to your API call. → [speclint.ai/docs](https://speclint.ai/docs)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
