---
title: "Your AI agent doesn't have a code problem. It has a spec problem."
description: "Agents build exactly what the spec says. If the spec is vague, you get vague code — and a $200 rework bill. I built a linter that catches this before the agent starts."
tags: [ai, devtools, productivity, opensource]
canonical_url: https://speclint.ai/blog/your-agent-has-a-spec-problem
cover_image: ""
published: false
---

# Your AI agent doesn't have a code problem. It has a spec problem.

Coding agents are deterministic. Feed them garbage, get garbage back.

The part everyone glosses over: the garbage usually comes from the spec. Not the model. Not the temperature setting. The spec — that natural-language task description you typed in 90 seconds and immediately forgot about.

The agent read it literally. It built exactly what you wrote. And what you wrote wasn't what you meant.

---

## What this costs you

Here's a real pattern I kept hitting.

Spec: *"Add a user settings page with the usual fields."*

The agent ships something. It has fields — username, email, a password reset link. Ship it to code review and you realize it's missing the notification preferences, the timezone selector, the avatar upload, and any kind of save confirmation. All of those were "usual" in your head. None of them were in the spec.

Four hours of rework. Two more agent runs at ~$0.50-2.00 in API costs each. Multiply that by 10 features a week on a team of 4, and you're burning real money on a problem that happens before the agent even starts.

The compute isn't the expensive part. The wasted iteration is.

---

## What bad specs look like (and what the score tells you)

I built [Speclint](https://speclint.ai) to catch this. Run a spec through it and you get a score from 0 to 100 across five dimensions.

Here's that settings page spec going through the CLI:

```bash
$ npx speclint score "Add a user settings page with the usual fields."

Score: 28/100 — NOT agent_ready

  measurable_outcome     ✗  6/20   No concrete deliverable defined
  testable_criteria      ✗  2/20   No pass/fail conditions
  constraints            ✓  12/20  Implicit (web page context)
  no_vague_verbs         ✗  4/20   "usual" is undefined
  verification_steps     ✗  4/20   No way to confirm done

Suggestion: Run `npx speclint rewrite` to fix failing dimensions.
```

28. Not great. The rewrite fixes the four failing dimensions and leaves the passing one alone:

```bash
$ npx speclint rewrite "Add a user settings page with the usual fields."

Rewritten spec (score: 82/100 — agent_ready):

"Build a /settings page for authenticated users. Required fields: display name,
email address (read-only), avatar upload (jpg/png, max 2MB), timezone selector
(IANA format), and notification preferences (email, push — each toggleable).
Include a Save button that shows a success toast on completion and a 400 error
state if validation fails. Page must be accessible at /settings when logged in
and redirect to /login when not."
```

That's a spec an agent can actually work from. No ambiguity about what "usual" means. Clear success criteria. A testable outcome.

---

## How the scoring works

Five dimensions, each worth up to 20 points. A spec needs 70+ to be considered `agent_ready`.

**Measurable outcome** — Does the spec describe something concrete you can point to when it's done? "Add a page" fails. "Build a /settings page that renders for authenticated users" passes.

**Testable criteria** — Can a test be written against this spec without guessing? "Works correctly" fails. "Returns 400 if avatar exceeds 2MB" passes.

**Constraints** — Are the edges defined? File size limits, character limits, access rules, error states. Anything that tells the agent where to stop.

**No vague verbs** — "Handle", "manage", "deal with", "improve", "update" are signals the spec hasn't been thought through. The scorer flags them.

**Verification steps** — How do you confirm it's done? A URL, a test, a UI state. If there's no check, the agent has no way to know when to stop.

The scoring is deterministic. Regex-based pattern matching against known vague-verb lists, measurability signals, and structural indicators. It's not asking an LLM whether it likes your spec. It runs the same way every time, which means it works in a CI pipeline.

---

## Where to put it

**CLI** — For one-off checks and the rewrite:

```bash
npx speclint score "your spec here"
npx speclint rewrite "your spec here"
```

**GitHub Action** — Block PRs that contain low-scoring specs in task files:

```yaml
name: Spec Check
on: [pull_request]

jobs:
  speclint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint specs
        uses: speclint-ai/speclint-action@v1
        with:
          path: specs/
          min_score: 70
          api_key: ${{ secrets.SPECLINT_API_KEY }}
```

Any spec under 70 fails the check. The PR doesn't merge until the spec is fixed. This is the integration that actually changes team behavior — because now there's friction at the right moment.

**MCP server** — If you're running an AI coding agent that supports MCP (Cursor, Claude, etc.), add Speclint as a tool. The agent can score its own incoming specs before starting work, or call for a rewrite if the score is too low.

**REST API** — For anything custom:

```bash
curl -X POST https://api.speclint.ai/v1/score \
  -H "Authorization: Bearer $SPECLINT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"spec": "Add a user settings page with the usual fields."}'

# Response:
{
  "score": 28,
  "agent_ready": false,
  "dimensions": {
    "measurable_outcome": 6,
    "testable_criteria": 2,
    "constraints": 12,
    "no_vague_verbs": 4,
    "verification_steps": 4
  }
}
```

The API is what makes this useful in agent orchestration pipelines — score before you run, skip the rework.

---

## "Can't I just ask ChatGPT to fix my spec?"

Yes. But a few things make that different from what Speclint does.

The score is deterministic. Ask ChatGPT to evaluate two specs and you'll get a different opinion each time. Speclint scores the same spec identically on every run. That matters when you're enforcing a quality gate in CI.

The rewrite is surgical. The rewriter only touches the dimensions that failed. If your spec already has good constraints defined, those stay. ChatGPT will rewrite the whole thing in its own voice, which means you lose control of the specificity you already had.

And it integrates. CI gates, MCP tool calls, API responses — you can't put ChatGPT in a GitHub Action with a reliable pass/fail threshold. You can with Speclint.

---

## Open source + pricing

The scoring engine is MIT licensed. The regex patterns, the dimension weights, the `agent_ready` threshold — all of it is on [GitHub](https://github.com/DavidNielsen1031/speclint). You can run it locally, fork it, adjust the weights for your team's definition of a good spec.

The hosted API adds things that need server-side context: codebase-aware scoring (your spec gets scored against your actual repo), batch processing, and the AI rewrite. That's where the tiers come in.

| Tier | Price | What you get |
|------|-------|-------------|
| Free | $0/mo | 10 scores/day, CLI, open source engine |
| Lite | $9/mo | 100 scores/day, GitHub Action, rewrite |
| Solo | $29/mo | 500 scores/day, MCP server, codebase context |
| Team | $79/mo | Unlimited, team dashboard, priority API |

Most solo developers start on Free, hit the limit when they get serious about it, and move to Lite or Solo. Teams usually land on Team after the first time a vague spec makes it into a sprint.

---

## Try it

```bash
npx speclint score "your next agent task here"
```

If it scores under 70, run the rewrite. If it scores under 50, you probably knew something was off when you wrote it.

The spec is the cheapest place to catch a problem. A bad spec that gets caught by Speclint costs you 10 seconds. A bad spec that gets caught in code review costs you 4 hours.

[speclint.ai](https://speclint.ai) — free tier, no credit card.
