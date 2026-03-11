# Sprint Retrospective Template

*Auto-triggered by Alexander when sprint goal is met.*

## Data Sources

### API Telemetry (from Redis via /api/telemetry)
- **Calls/day:** `telemetry:calls:daily:{date}`
- **Tokens:** `telemetry:tokens:daily:{date}:input/output`
- **Cost:** `telemetry:cost:daily:{date}`
- **Items refined:** `telemetry:items:daily:{date}`
- **By source:** `telemetry:source:{browser|mcp|api-direct}:{date}`
- **Monthly:** `telemetry:calls:monthly:{month}`, `telemetry:cost:monthly:{month}`

### Sub-Agent Telemetry (from session metadata)
- Run count, model used, runtime, outcome (shipped/partial/failed/wasted)
- Spec template adherence (was SPEC_TEMPLATE.md used? Y/N)
- Token spend per run (from sub-agent completion message)

### Deploy Telemetry (from git + Vercel)
- Commits in sprint: `git log --oneline --since={sprint_start}`
- Deploy count: manual tracking (Vercel CLI doesn't expose history easily)
- Deploy failures: manual tracking

### Backlog Telemetry (from BACKLOG.md + SPRINT_LOG.md)
- Items planned vs completed vs carried over
- Cycle time per item (start → done)
- Unplanned work ratio (items not in original sprint plan)

---

## Retro Format (posted to #speclint)

```
## 🔍 Sprint {N} Retro — "{Name}"

**Duration:** {start} → {end} ({hours}h)
**Goal:** {goal}
**Result:** ✅ Met / ❌ Missed / 🟡 Partial

### 📊 Velocity
- Items planned: {N} | Completed: {N} | Carried over: {N}
- Unplanned work: {N} items ({%} of total)

### 🤖 Sub-Agent Efficiency
- Runs: {N} | Success: {N} | Failed: {N} | Wasted: {N}
- Total runtime: {X}min | Avg per run: {X}min
- Spec template used: {N}/{total} runs ({%})
- Models: {breakdown}

### 🚀 Deploy Health
- Deploys: {N} | Failures: {N} | Rollbacks: {N}
- Time from commit → prod: avg {X}min

### 📈 API Usage (sprint period)
- Total calls: {N} | Items linted: {N}
- By source: browser {N} | API {N} | MCP {N} | GitHub Action {N}
- Cost: ${X}

### 🐕 Dogfooding — "Is our product adding value to us?"
- Speclint API calls on our own tickets: {N}
- Own tickets that scored < 80: {N} (list IDs)
- Own tickets re-linted after edit: {N}
- Spec template adherence: {N}/{total} sub-agent specs used SPEC_TEMPLATE.md

**Per-ticket lint results:**
| Ticket | Initial Score | Gaps Found | Edited? | Final Score | Sub-Agent Outcome |
|--------|--------------|------------|---------|-------------|-------------------|
| SL-XXX | {score} | {gaps} | Y/N | {score} | shipped/partial/failed |

**Value assessment:**
- Did linting catch a gap that would have caused a sub-agent failure? {Y/N, details}
- Did the spec improve after linting? {Y/N, delta}
- Would the sub-agent have built the wrong thing without the lint? {Y/N, reasoning}
- **Honest verdict:** Is Speclint making our own work better, or is it ceremony? {answer}

### 🏗️ Agent Team Governance
- Sub-agents spawned with full 4-section spec: {N}/{total} ({%})
- Sub-agents that followed harness (build→verify→fix loop): {N}/{total}
- Sub-agents that ran verification steps before completing: {N}/{total}
- Wasted runs (failed same task 2+ times): {N}
- Model selection correct (Ollama for scripts, Sonnet for impl, Opus for complex): {Y/N, note exceptions}
- Harness loop closures (mistakes logged → AGENTS.md updated): {N}

### 💡 One Improvement for Next Sprint
{specific, actionable improvement based on data}

### ⚡ What Went Well
{1-2 bullet points}

### 🔧 What Needs Work
{1-2 bullet points}
```

---

## Dogfooding Mandate (LOCKED — March 1, 2026)

**Every Speclint backlog item (SL-*) MUST be linted through our own API before a sub-agent is spawned.**

Process:
1. Write the spec using SPEC_TEMPLATE.md (4 sections)
2. Call `POST https://speclint.ai/api/lint` with the spec as the issue body
3. If `completeness_score < 80` → fix the spec first, don't spawn
4. If `agent_ready: true` → spawn the sub-agent with the spec
5. Log the lint score in the sprint log entry for that item

This ensures we're using our own product AND improving spec quality simultaneously.

## Auto-Trigger Rules

Alexander checks these conditions after completing any Speclint backlog item:

1. **All items in the sprint's "Now" section are ✅** → trigger retro
2. **Sprint goal explicitly declared met by David** → trigger retro
3. **Sprint time-box expired** (if set) → trigger retro even if items remain

When triggered:
1. Gather telemetry from all sources
2. Fill retro template
3. Post to #speclint channel
4. Update SPRINT_LOG.md with retro section
5. Ask David: "Ready to define the next sprint goal?"

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
