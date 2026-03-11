# Speclint 10-Persona Audit Retro — 2026-03-10

*Product Hunt launch day. 10 personas. ~60 fixes. What we found, what we fixed, and what we learned.*

---

## 📋 Problems Found (by category)

### 🔴 CRITICAL (3)
| # | Problem | Persona | Root Cause |
|---|---------|---------|------------|
| 1 | SK-INTERNAL- prefix = public backdoor to team tier | Red Team + Security | Hardcoded prefix in public repo — anyone could read it |
| 2 | Plan upgrades/downgrades silently ignored in KV | Treasurer | Webhook handler only updated status, never plan |
| 3 | .env.local credentials (false alarm — not committed) | Security | Properly gitignored, but scared us |

### 🔴 HIGH — Security (8)
| # | Problem | Persona |
|---|---------|---------|
| 4 | x-forwarded-for rate limit bypass (first value is user-controlled) | Cost + Red Team + Security |
| 5 | Checkout open redirect via Origin header | Security |
| 6 | Math.random() for paid license keys (not CSPRNG) | Security |
| 7 | /api/traces cross-tenant — any Pro key sees all data | Red Team + Security |
| 8 | _rewrite_adapter injectable from external callers | Security |
| 9 | Uncapped input fields (context, persona, codebase_context) | Cost |
| 10 | Prompt injection monitor-only, not blocking | Red Team + Security |
| 11 | Email enumeration — no rate limit on key recovery | Security |

### 🔴 HIGH — Revenue (3)
| # | Problem | Persona |
|---|---------|---------|
| 12 | Fast-path key creation skips license email | Treasurer |
| 13 | KV failure = unlimited LLM consumption (fail-open) | Treasurer |
| 14 | past_due = immediate access revocation (should be grace) | Treasurer |

### 🟡 MEDIUM — Security/Infra (11)
| # | Problem | Persona |
|---|---------|---------|
| 15 | Timing attack on admin key (string !== not constant-time) | Security |
| 16 | Dashboard "All Data" cross-tenant metrics | Security |
| 17 | IP fallback to shared 'unknown' bucket | Security |
| 18 | PII in telemetry (raw IPs stored 90 days) | Security |
| 19 | License key logged unmasked in webhooks | Security |
| 20 | No security headers (CSP, X-Frame-Options, nosniff) | Security + Availability |
| 21 | CORS preflight broken on all API endpoints | Availability |
| 22 | 500 on wrong Content-Type (unhandled) | Availability |
| 23 | No rate limit response headers | Availability |
| 24 | debug:ping no TTL in Redis | Cost |
| 25 | No Stripe idempotency keys on checkout | Treasurer |

### 🟡 MEDIUM — Repo Hygiene (8)
| # | Problem | Persona |
|---|---------|---------|
| 26 | Old "Refine Backlog" files committed since MVP | Tickets |
| 27 | 87MB .axon/ cache in git | Tickets |
| 28 | 5 Dependabot security vulnerabilities | Tickets + Updates |
| 29 | Repo still Private (meant to be public MIT) | Tickets |
| 30 | Stale "app" Vercel project causing duplicate deploys | Updates |
| 31 | 4 ghost GitHub environments | Updates |
| 32 | package.json: name="app", version 0.1.0 | Updates |
| 33 | Key recovery returns unmasked key + plan tier | Red Team + Treasurer |

### 🟡 MEDIUM — Copy/Content (12)
| # | Problem | Persona |
|---|---------|---------|
| 34 | Pricing inconsistency (3 different structures in README/site/MCP) | Research |
| 35 | REFINE_LICENSE_KEY stale env var in MCP README | Research |
| 36 | All 5 blog posts dated same day | Research |
| 37 | 10 component files with -new suffix | Tickets |
| 38 | 5 unused shadcn components | Tickets |
| 39 | llms.txt: stale refine-backlog-cli reference | Research |
| 40 | Terms describes old RefineBacklog product | Health |
| 41 | Success page hardcoded "Welcome to Speclint Pro" | Health |
| 42 | Get-key: "Retrieve" implies existing key | Health |
| 43 | "5 lints/day" vs "3 requests/day" inconsistency | Health + Treasurer |
| 44 | Dashboard listed as "coming soon" but actually exists | Health |
| 45 | /docs/enforce missing from sitemap | Updates |

### 🟡 MEDIUM — UX/Conversion (6)
| # | Problem | Persona |
|---|---------|---------|
| 46 | 3 CTAs in hero dilute attention | Health |
| 47 | No "who is this for" above the fold | Health |
| 48 | No pre-filled example in spec tester | Health |
| 49 | High-score message feels like an error | Health |
| 50 | No annual pricing option shown | Health |
| 51 | No conversion funnel telemetry | Treasurer |

### 🟢 LOW (5)
| # | Problem | Persona |
|---|---------|---------|
| 52 | Disposable domain list small (20 domains) | Treasurer |
| 53 | recharts in prod deps (acceptable — dashboard is prod) | Cost |
| 54 | Blog: no meta descriptions, bylines, sharing, internal links | Health |
| 55 | Sequential Redis ops (no pipelining) | Cost |
| 56 | auto_rewrite up to 17 Claude calls per request | Cost |

### 🔵 Process Gaps (5)
| # | Problem | Persona |
|---|---------|---------|
| 57 | No npm audit in CI | Meta |
| 58 | No repo hygiene check in CI (stale files, large blobs) | Meta |
| 59 | No repo visibility gate in deploy.sh | Meta |
| 60 | No Vercel project ID validation | Meta |
| 61 | No Dependabot auto-merge for security patches | Meta |

---

## ✅ Improvements Made (all shipped today)

### Wave 1 — Critical + Security (4 agents)
| Commit | Agent | Fixes |
|--------|-------|-------|
| a00e90c | Manual | SK-INTERNAL backdoor patched + repo artifacts removed |
| b55599a + a4df292 | Process | 8 CI/deploy gate improvements |
| 676538a | Cleanup | 13 copy/config/cosmetic fixes |
| b303798 | Revenue | 4 subscription/billing fixes |
| (pushed) | Security v1 | 11 security vulnerability patches |

### Wave 2 — Remaining Issues (3 agents)
| Commit | Agent | Fixes |
|--------|-------|-------|
| acc3046 | UX | 7 conversion/copy improvements |
| (pushed) | Blog/Quality | 8 blog SEO + code quality fixes |
| 3270aaf | Security v2 | 8 infra/privacy improvements |

---

## 🔒 How Each Fix Is Enforced

| Category | Enforcement | Type |
|----------|-------------|------|
| npm audit | CI step — blocks PR merge | **Automated** |
| Repo hygiene (stale files, >10MB blobs) | CI step — blocks PR merge | **Automated** |
| Repo visibility | deploy.sh Gate 0 — blocks prod deploy | **Automated** |
| Vercel project ID | deploy.sh Gate 1 — blocks prod deploy | **Automated** |
| Dependabot patches | Weekly auto-PRs + CI | **Automated** |
| PR hygiene checklist | PR template — manual checkbox | **Manual** |
| Security headers | next.config.ts — deployed with every build | **Automated** |
| Input validation (caps, content-type) | Runtime code — returns 400/429 | **Automated** |
| Rate limit headers | Runtime code — every API response | **Automated** |
| CORS | Runtime code — OPTIONS handler + response headers | **Automated** |
| PII hashing | Runtime code — SHA-256 before storage | **Automated** |
| Cross-tenant isolation | Runtime code — internal key check | **Automated** |
| Injection blocking | Runtime code — returns 400 | **Automated** |
| In-memory rate backstop | Runtime code — 500 req/IP/day ceiling | **Automated** |
| Stripe idempotency | Runtime code — hash-based key per checkout | **Automated** |
| Webhook plan sync | Runtime code — reads price ID on update | **Automated** |
| Past_due grace period | Runtime code — included in active statuses | **Automated** |
| Blog SEO metadata | generateMetadata() — automatic from frontmatter | **Automated** |
| Copy consistency | One-time fix — needs manual review on changes | **Manual** |
| Component naming | One-time fix — no enforcement | **Manual** |

---

## 💡 Ideas to Make Things More Deterministic

### 1. **Pre-launch checklist in sprint-gate.sh** (NEW)
The `launch-check` command was added today, but it should be a REQUIRED gate before any product's FIRST production deploy. Add a new state: `LAUNCH_READY` between `DEMO_APPROVED` and `PRODUCTION` for sprint #1 of any product.

Checks: repo public, npm audit clean, no stale artifacts, pricing page matches code, terms/privacy updated, sitemap complete, security headers present, all env vars set.

### 2. **"Copy Audit" persona as mandatory gate** (NEW)
Noa (the copywriter) found 9 factual lies on the live site in Sprint 10. Today's Health persona found more. Neither code review nor security review catches copy-code drift.

**Proposal:** Add a `copy-audit` persona to the mandatory persona review step. It compares:
- Pricing page vs rate-limit.ts constants
- Feature lists vs actual code paths
- Terms/privacy vs actual data handling
- README vs actual CLI/API behavior

This can be automated with a script that extracts pricing/limits from code and compares to marketing copy.

### 3. **Automated pricing consistency check** (NEW)
Create `scripts/pricing-audit.sh` that:
- Extracts tier names and limits from rate-limit.ts
- Extracts pricing from site.ts/pricing page
- Extracts pricing from README and MCP README
- Diffs them and fails if they don't match

Run in CI. Never ship inconsistent pricing again.

### 4. **Security scan as sprint gate** (NEW)
Today's security review found issues that had existed since Sprint 1. A 10-persona audit is expensive (~$2-3 in tokens, 30+ minutes).

**Proposal:** Add a lightweight security checklist to sprint-gate.sh `advance` from `BUILD_COMPLETE`:
- No hardcoded secrets (grep for known patterns)
- No Math.random() in security-sensitive paths
- Content-Type guards on all POST routes
- All user input has max-length validation
- Rate limiting on all public endpoints

### 5. **Webhook integration test** (NEW)
The plan upgrade bug was invisible because there are no integration tests for the Stripe webhook flow. Add test cases:
- Subscription created → key issued + email sent
- Subscription updated (plan change) → KV updated
- Subscription past_due → still active
- Subscription deleted → key revoked

### 6. **"Public repo readiness" gate in CI** (NEW)
For any repo marked as open-source, CI should verify:
- No .env files tracked
- No internal docs (architecture, entitlements) committed
- No hardcoded API keys or secret prefixes
- LICENSE file present
- README has accurate installation/usage instructions

### 7. **Cross-tenant test** (NEW)
Add a test that creates two different license keys and verifies one can't access the other's data via /api/traces or dashboard.

---

## 📝 Sprint OS Updates Needed

### SPRINT_STARTER.md Changes

**Step 3 (Execution) — add:**
```
- [ ] Run `scripts/pricing-audit.sh` if any pricing/tier changes were made
- [ ] Verify all POST endpoints have Content-Type guards
- [ ] Verify all user input fields have max-length validation
```

**Step 5 (Persona Review) — add:**
```
- [ ] Run **copy audit persona** (Noa) — compares marketing copy against actual code behavior
```

**New Step 5.5 (Security Scan) — add between Step 5 and Step 6:**
```
## Step 5.5: Security Scan
- [ ] Run `scripts/security-scan.sh` — checks for hardcoded secrets, unvalidated input, missing rate limits
- [ ] For open-source products: run `scripts/public-repo-audit.sh` — no internal docs, no .env, no secret prefixes
- [ ] If any API changes: verify cross-tenant isolation (can key A see key B's data?)
```

**Step 8 (Production Deploy) — add to deploy.sh gates:**
```
- [ ] For first deploy of any product: `sprint-gate.sh <product> launch-check` must pass
```

**New Rule #7:**
```
7. **For open-source products: verify repo is Public before every production deploy.** deploy.sh enforces this.
```

### LESSONS.md — New Entries

```
## Sprint 10 Persona Audit (Speclint) — March 10, 2026

- **10-persona audit found 61 issues on launch day** — including a critical backdoor (SK-INTERNAL), 
  3 revenue leaks, 8 high-severity security vulns, and 12 copy inconsistencies. The regular 3-pass 
  persona review during Sprint 10 caught code quality but missed repo hygiene, security posture, 
  revenue infrastructure, and copy-code drift. Lesson: different persona TYPES catch different 
  failure modes. Security, Cost, Treasurer, and Health personas found zero overlap with the 
  standard customer/quality personas.

- **Copy-code drift is a distinct failure mode** — "5 lints/day" on pricing vs "3 requests/day" 
  in code. "Coming soon" on features that are live. Wrong dimension names in UI. Terms describing 
  the old product. No code review or security scan catches this. Requires a dedicated copy audit.

- **Sprint gates are presence-based (check file exists) but not absence-based (check bad file 
  doesn't exist)** — .axon/ (87MB), REFINEMENT_LOG.md, old docs, private visibility — all 
  survived because no gate says "this must NOT be here." Fix: CI hygiene step with denylist.

- **Repo hygiene is invisible until someone looks** — Nobody noticed Private visibility, stale 
  Vercel project, ghost environments, or 87MB cache until the audit. These aren't code quality 
  issues — they're project hygiene. Different category, different check.

- **Revenue infrastructure needs its own review** — Treasurer found plan upgrade bug, fast-path 
  email skip, KV fail-open, and past_due revocation. These are business logic bugs that only 
  surface when you think about the money flow, not the code flow.

- **10-persona review is expensive but justified for launches** — Use for: first production deploy, 
  major feature launches, open-sourcing. Don't use for: patch-mode fixes, minor sprints. The 
  regular 3-pass persona review is sufficient for normal sprints.
```

### META-RETRO.md — Candidate Pattern

```
## Candidate: Launch Readiness Gate (from Sprint 10 audit, 2026-03-10)

**Pattern:** Before any product's first production deploy OR major launch event (PH, Show HN, 
open-source), run expanded review: standard personas + Security + Cost + Treasurer + Meta.

**Evidence:** 61 issues found on Speclint launch day. Standard sprint personas caught 0 of the 
security, revenue, or repo hygiene issues.

**Promotion criteria:** If next 2 product launches use this and find >5 issues each → promote 
to SPRINT_STARTER.md as mandatory launch gate.

**Status:** CANDIDATE (observed 1x)
```

---

## 🔧 Not Fixed (Deferred — Low ROI Today)

| Item | Why Deferred |
|------|-------------|
| Redis pipelining (23 sequential ops) | Optimization, not broken. Revisit if hitting Upstash limits |
| auto_rewrite up to 17 Claude calls | By design — iterative improvement. Add cost tracking first |
| Conversion funnel telemetry | Needs PostHog/Plausible integration — separate sprint |
| Lite tier repositioning | Business decision, not a bug |
| Full CSP header | Complex to get right with Next.js inline scripts — separate task |

---

*Generated from 10-persona audit: Cost, Research, Red Team, Tickets, Security, Availability, Meta, Health, Treasurer, Updates.*
*Total: ~60 fixes shipped across 7 agents, 8+ commits, all on launch day.*
