# Speclint Eval Seed Dataset — SL-062

**Purpose:** 20 labelled sample specs to bootstrap human eval for rubric validation.  
**Created:** 2026-03-07 (Alexander, overnight work)  
**Task:** SL-062 — Human labeling: 100 specs with binary Pass/Fail "agent-ready" labels

---

## How to use this file

Each spec below has:
- **Spec:** the raw input text
- **Alexander's label:** Pass/Fail + reasoning
- **Scoring engine score:** run `npx @speclint/cli lint "<spec>"` to generate

David (or a hired labeler) should review each one independently and mark their own Pass/Fail.
Disagreements between Alexander's label and the scoring engine are the most valuable signal.

---

## Specs 1-10: Expected FAIL (agent-NOT-ready)

These are intentionally vague, untestable, or incomplete.

### Spec 1
**Text:** `Improve dashboard performance`  
**Alexander's label:** FAIL  
**Why:** No measurable target, no acceptance criteria, no definition of "improve." An agent would optimize any metric arbitrarily.

### Spec 2
**Text:** `Fix the login bug`  
**Alexander's label:** FAIL  
**Why:** "Bug" is unspecified. No reproduction steps, no expected behavior, no success state.

### Spec 3
**Text:** `Make the onboarding flow better`  
**Alexander's label:** FAIL  
**Why:** "Better" is unmeasurable. No baseline, no metric, no ACs.

### Spec 4
**Text:** `Update the user profile page`  
**Alexander's label:** FAIL  
**Why:** "Update" is a vague verb with no scope. What changes? Why? How is success measured?

### Spec 5
**Text:** `Add dark mode support`  
**Alexander's label:** FAIL  
**Why:** Technically specific intent, but missing: which components, system preference detection, persistence, visual parity requirements. Agent would ship a partial implementation.

### Spec 6
**Text:** `Enhance API security`  
**Alexander's label:** FAIL  
**Why:** "Enhance" is a vague verb. Which API endpoints? Which threat vectors? What's the measurable improvement?

### Spec 7
**Text:** `Improve search results relevance`  
**Alexander's label:** FAIL  
**Why:** "Relevance" is subjective. No metric (NDCG, click-through rate, P@K), no baseline, no target.

### Spec 8
**Text:** `Fix slow page loads`  
**Alexander's label:** FAIL  
**Why:** Which pages? What's slow? What's the target? No Lighthouse score, no budget, no measurement method.

### Spec 9
**Text:** `Add notifications`  
**Alexander's label:** FAIL  
**Why:** Notification type unspecified (push, email, in-app, SMS). No trigger conditions, no content spec, no delivery requirements.

### Spec 10
**Text:** `Refactor the codebase`  
**Alexander's label:** FAIL  
**Why:** Scope undefined. Refactor to what end? No measurable outcome, no constraints, no definition of done.

---

## Specs 11-20: Expected PASS (agent-ready)

These specs are specific, measurable, and testable.

### Spec 11
**Text:** `Reduce dashboard P95 load time from 3.2s to under 800ms, measured via Lighthouse performance score ≥ 85. No regressions on existing Playwright tests. Only the /dashboard route is in scope.`  
**Alexander's label:** PASS  
**Why:** Specific metric, measurable baseline, measurable target, tool specified, scope bounded, regression guard.

### Spec 12
**Text:** `Fix authentication token expiry bug: when a user's session token expires mid-session, the app currently throws a 500 error instead of redirecting to /login. Expected: expired token returns HTTP 401, client redirects to /login preserving the current URL as a ?redirect param. Test: simulate token expiry in Playwright, confirm redirect and URL preservation.`  
**Alexander's label:** PASS  
**Why:** Specific bug, specific expected behavior, HTTP status defined, redirect behavior specified, test method given.

### Spec 13
**Text:** `Redesign onboarding step 2 (role selection) to increase completion rate from 61% to ≥75%. A/B test against control (n=200 per variant, 2-week run). Measure via PostHog funnel. Only modify the RoleSelectionStep component. No changes to step 1 or step 3.`  
**Alexander's label:** PASS  
**Why:** Baseline and target quantified, test methodology specified, measurement tool named, scope limited to one component.

### Spec 14
**Text:** `Add system-level dark mode support to the user profile page: detect prefers-color-scheme, persist preference in localStorage under key 'theme', apply to ProfileCard, ProfileStats, and EditProfileForm components. Text contrast must meet WCAG 2.1 AA (4.5:1 ratio). Verify with: toggle system dark mode, confirm persistence after page reload, run axe-core accessibility check with 0 violations.`  
**Alexander's label:** PASS  
**Why:** Components listed explicitly, storage key named, accessibility standard referenced, verification steps given.

### Spec 15
**Text:** `Implement rate limiting on POST /api/refine: max 5 requests per IP per day for unauthenticated users. Return HTTP 429 with JSON body { error: "Daily limit reached", upgrade: "https://speclint.ai/pricing" } when limit exceeded. Use Redis INCR with 24h TTL. Unit test: mock Redis, assert 429 on 6th request from same IP.`  
**Alexander's label:** PASS  
**Why:** Limit specified, HTTP status and response body defined, implementation approach given, unit test specified.

### Spec 16
**Text:** `Add push notifications for plant watering reminders in DankBot: trigger 24h before the plant's next_water_date (stored in Supabase plants table). Use Expo push notification service. Notification title: "Time to water {plant_name}" body: "Your {strain_name} is due for water tomorrow." Only send if the user has enabled notifications in their profile. Acceptance: create plant with next_water_date = tomorrow, confirm notification appears on device within 5 minutes of the scheduler run.`  
**Alexander's label:** PASS  
**Why:** Trigger condition specified, data source named, notification content defined, opt-in condition stated, acceptance test described.

### Spec 17
**Text:** `Implement full-text search on the /issues endpoint: accept ?q= query param, search issue title and body fields, return results ranked by BM25 relevance score (descending). Max 50 results. Response time under 200ms at P95 for indexes up to 10K issues. Use PostgreSQL full-text search (tsvector). Write integration test against seeded test database.`  
**Alexander's label:** PASS  
**Why:** Algorithm specified (BM25, tsvector), latency budget stated, scale boundary given, integration test required.

### Spec 18
**Text:** `Add CSV export to the dashboard analytics view: export button downloads a CSV file containing all rows currently visible in the table (respects active filters). CSV columns: date, event_type, count, unique_users, avg_score. File named speclint-analytics-YYYY-MM-DD.csv. Verify: apply a date filter, click export, open CSV, confirm only filtered rows appear and filename matches today's date.`  
**Alexander's label:** PASS  
**Why:** Data source specified (respects filters), columns listed, filename format defined, verification steps given.

### Spec 19
**Text:** `Implement Stripe webhook handler for customer.subscription.deleted events at POST /api/webhooks/stripe: validate Stripe signature using STRIPE_WEBHOOK_SECRET env var, find the customer in Upstash by customerId, set their plan to 'free' tier, invalidate their license key. Return 200 on success, 400 on invalid signature. Test with Stripe CLI: stripe trigger customer.subscription.deleted, confirm plan downgrade in KV.`  
**Alexander's label:** PASS  
**Why:** Webhook event named, validation method specified, state changes defined, success/error codes specified, test command provided.

### Spec 20
**Text:** `Fix WCAG 2.1 AA color contrast failure on the primary CTA button (#1A73E8 on #FFFFFF background, current ratio 3.8:1, target ≥4.5:1). Update button background to #1557C0. Change only the primary variant in Button.tsx. Verify with axe-core: 0 contrast violations on /pricing page. No visual regressions on other button variants.`  
**Alexander's label:** PASS  
**Why:** Current and target contrast ratios given, specific colors named, file scoped, verification tool specified, regression guard stated.

---

## Scoring Engine Baseline

Run to generate machine scores for each spec:

```bash
cd products/refine-backlog/app

# Batch check all FAIL specs (1-10)
for spec in \
  "Improve dashboard performance" \
  "Fix the login bug" \
  "Make the onboarding flow better" \
  "Update the user profile page" \
  "Add dark mode support" \
  "Enhance API security" \
  "Improve search results relevance" \
  "Fix slow page loads" \
  "Add notifications" \
  "Refactor the codebase"; do
  echo "---"
  echo "SPEC: $spec"
  npx @speclint/cli lint "$spec" 2>/dev/null | grep -E "score|agent_ready"
done
```

Expected: all 10 score <70, agent_ready: false.

---

## Next Steps

1. David (or hired labeler) independently labels each spec Pass/Fail without seeing Alexander's labels
2. Run scoring engine on all 20, record machine scores and agent_ready booleans
3. Compare: where do human and machine disagree?
4. Disagreements = rubric calibration opportunities
5. Scale to 100 specs for statistical validity (SL-062 full task)

**Hypothesis to test:** The scoring rubric is too generous on specs 11-20 (might score some <70 despite being agent-ready) and too lenient on specs 1-10 (might score some >70 despite being vague).

---

*Created by Alexander 2026-03-07 03:02 AM CST as overnight autonomous work. Part of SL-062 eval foundation.*

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
