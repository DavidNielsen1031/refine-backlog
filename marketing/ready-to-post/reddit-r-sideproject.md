# Reddit: r/SideProject

**Title:** Built a spec linter for AI coding agents. Free to use, open source.

**Body:**

I'm a product coach by day. I kept running into the same problem: people would feed vague requirements into Cursor or Copilot and then blame the AI when the output was wrong.

The AI wasn't the problem. The spec was.

Speclint checks your specs the same way ESLint checks your code. Five scoring dimensions, 0 to 100. Deterministic. No randomness. It flags the specific issues: vague verbs, missing acceptance criteria, no success metrics, untestable statements.

If the spec scores low, there's a rewrite engine that fixes it. The scoring is free. The rewrite is the paid feature ($9/mo for individuals).

Stack: Next.js on Vercel, open source under MIT.

https://speclint.ai
https://github.com/DavidNielsen1031/speclint

What I'd love feedback on: is the free tier generous enough? Right now it's 5 lints per day with a preview of what the rewrite would change.
