# SL-026 — Persona-Aware Spec Scoring

## 1. Context & Intent

**What:** Add optional persona scoring to Speclint's `/api/lint` endpoint. When a persona is provided (inline, via `.speclint.yml` config, or via stored reference), Speclint evaluates whether the spec addresses that persona's concerns — not just whether the spec is structurally complete.

**Why:** `completeness_score` answers "is this spec complete?" Persona scoring answers "is it complete for the RIGHT PERSON?" A spec can score 90/100 structurally but completely miss the user's primary concern (load time on 3G, accessibility for elderly users, sub-100ms latency for traders). Agents build exactly what you tell them — if the spec doesn't mention the user's needs, the agent won't either.

**Who benefits:**
- Solo dev (Jake) running AI agents for 3 different clients — each client has different users with different concerns
- Teams where multiple devs write specs for the same product — shared personas ensure consistency
- Any dev who's had an agent build a technically correct feature that the user hated

**Business impact:** This is the Team tier upgrade hook. Solo gets inline persona. Team gets stored/shared personas + analytics. The config file approach (`.speclint.yml`) makes persona scoring feel like infrastructure, not a feature — which is our positioning.

## 2. Constraints & What NOT To Do

- **Do NOT make persona required.** If no persona is provided, `persona_alignment` is `null` and `completeness_score` works exactly as before. Zero friction for users who don't need it.
- **Do NOT fail the entire lint if persona routing fails.** If the wrong persona is matched or no persona is found, still return `completeness_score` normally. `persona_alignment` is additive, never blocking (unless the user explicitly configures it to block).
- **Do NOT modify the existing 5 scoring dimensions.** Persona scoring is a SEPARATE score, not a modifier on `completeness_score`.
- **Do NOT hardcode personas.** The system must support: inline JSON, `.speclint.yml` config file, and stored persona references.
- **Do NOT over-engineer v1.** Ship inline persona + config file routing first. Stored personas (Team tier) can be a follow-up.
- **Protected files:** Do not modify `src/__tests__/`, `src/app/success/`, `src/app/privacy/`, `src/app/terms/`

## 3. Success Criteria

### API Changes (`/api/lint`)

- [ ] Accept optional `persona` field in request body:
  ```json
  {
    "issue": { "title": "...", "body": "...", "labels": ["frontend"] },
    "persona": {
      "role": "mobile user on rural 3G",
      "cares_about": ["load time", "offline access", "simple navigation"],
      "doesnt_care_about": ["admin features", "API docs"]
    }
  }
  ```
- [ ] Return `persona_alignment` (0-100) alongside `completeness_score`:
  ```json
  {
    "completeness_score": 85,
    "agent_ready": true,
    "persona_alignment": 42,
    "persona_applied": "end-user",
    "persona_match_reason": "inline",
    "persona_gaps": [
      "No mention of load time — persona cares about this",
      "No offline consideration — persona cares about this"
    ]
  }
  ```
- [ ] When no persona provided: `persona_alignment`, `persona_applied`, `persona_gaps` are all `null`
- [ ] `agent_ready` gates on BOTH scores when persona is present: `completeness_score >= threshold AND persona_alignment >= persona_threshold`
- [ ] Persona threshold is configurable (default: 60) separate from completeness threshold (default: 80)

### Persona Alignment Scoring Rubric

- [ ] Score across 3 dimensions (total 100):
  - **Concern coverage** (50pts): Do the ACs/body address the persona's `cares_about` items? Each unaddressed concern = penalty.
  - **Anti-concern avoidance** (25pts): Does the spec avoid spending effort on things in `doesnt_care_about`? If the spec focuses on admin features but the persona is an end-user, penalty.
  - **Role-appropriate language** (25pts): Does the spec reference the persona's context? (e.g., "on mobile" for a mobile user, "under load" for a high-traffic API consumer)

### Config File Support (`.speclint.yml`)

- [ ] When a request includes `config` field OR the GitHub Action reads `.speclint.yml` from repo root:
  ```yaml
  personas:
    end-user:
      role: "mobile user on 3G"
      cares_about: ["load time", "offline access"]
    admin:
      role: "internal ops team"
      cares_about: ["bulk actions", "audit trail"]

  routing:
    labels:
      "frontend": "end-user"
      "admin-panel": "admin"
    default: null
  ```
- [ ] Label-based routing: match issue labels against `routing.labels` map
- [ ] `default: null` means no persona if no label matches (no noise on infra issues)
- [ ] Issue body override: `<!-- speclint:persona=admin -->` overrides label routing

### Tier Gating

- [ ] Free tier: `persona` field is ignored (return `persona_alignment: null` with a message like `"persona_scoring": "upgrade to Solo for persona scoring"`)
- [ ] Solo tier: Inline persona + config file routing works
- [ ] Team tier: Same as Solo (stored personas deferred to SL-028)

### Website — New "Persona Scoring" Section

- [ ] Add a section between the pricing section and the "For AI Agents" section
- [ ] Header: "Know your user. Score your spec." or similar
- [ ] Show a before/after:
  - WITHOUT persona: spec scores 85 (structurally complete) ✅ but misses the user
  - WITH persona: spec scores 85 + persona_alignment: 42 ⚠️ "No mention of load time — your mobile users care about this"
- [ ] Explain the workflow simply (NOT technical):
  1. "Define who you're building for" — show a simple persona (3 lines: role, cares about, doesn't care about)
  2. "Add it to your repo" — show `.speclint.yml` snippet (short, 6-8 lines)
  3. "Speclint checks every spec against your users" — show the GitHub comment with persona feedback
  4. "Fix once, ship right" — the loop: edit spec → re-lint → persona alignment improves → agent builds for the right person
- [ ] Call out: "No persona configured? No problem. Speclint scores structure first. Add personas when you're ready."
- [ ] Available on Solo ($29/mo) and Team ($79/mo)

### Website — Update Pricing Section

- [ ] Solo tier: Add bullet "Persona scoring — validate specs against your users"
- [ ] Team tier: Add bullet "Stored personas — define once, share across repos" (mark as "Coming soon")
- [ ] Keep the tier progression language: Structure → Fit → Scale

## 4. Verification Steps

- [ ] `curl -s https://speclint.ai/api/lint -X POST -H "Content-Type: application/json" -H "x-license-key: $SOLO_KEY" -d '{"items":["users want csv export"], "persona":{"role":"mobile user","cares_about":["offline access"],"doesnt_care_about":["admin"]}}'` returns `persona_alignment` score + `persona_gaps`
- [ ] Same request without `persona` field returns `persona_alignment: null` (no noise)
- [ ] Same request with free tier key returns `persona_alignment: null` with upgrade message
- [ ] `npx tsc --noEmit` — no new TypeScript errors
- [ ] `grep -r "persona_alignment\|persona_gaps\|persona_applied" src/lib/` returns matches (scoring logic exists)
- [ ] `curl https://speclint.ai | grep -i "persona"` returns matches (website section exists)
- [ ] Deploy succeeds: `npx vercel --prod --yes`

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
