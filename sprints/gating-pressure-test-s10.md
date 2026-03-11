# Speclint Gating Model — Persona Pressure Test
**Sprint:** S10 | **Date:** 2026-03-09 | **Author:** Alexander (redteam subagent)

> **Mission:** Find weaknesses, leaks, and conversion killers in Speclint's open-core gating model before they cost real users.

---

## THE GATING MODEL UNDER TEST

**Product:** Speclint (speclint.ai) — spec linter + rewriter for AI coding agents
**License:** MIT open-core. Scoring engine is OSS and self-hostable.
**Principle:** "Diagnosis is free. Treatment is paid."

| Feature | Free | Solo ($29/mo) | Team ($79/mo) |
|---|---|---|---|
| Lints/day (hosted) | 5 | Unlimited | Unlimited |
| Lints (self-hosted CLI/Action) | Unlimited | Unlimited | Unlimited |
| Rewrites/day | 1 | Unlimited | Unlimited |
| Rewrite output | 250-char preview + changes list + score delta | Full text | Full text |
| codebase_context | ❌ | ✅ lint + rewrite | ✅ |
| Persona scoring | ❌ | ✅ | ✅ |
| Structured output | ❌ | ✅ | ✅ |
| Agent-target profiles | ❌ | ✅ | ✅ |
| auto_rewrite endpoint | ❌ | ✅ | ✅ |
| Batch size | 1 item | 25 items | 50 items |
| Rewrite chain (iterative) | ❌ | ❌ | ✅ (3 passes) |
| Cross-spec context | ❌ | ❌ | ✅ |
| Dashboard + analytics | ❌ | ❌ | ✅ |
| SLA + priority support | ❌ | ❌ | ✅ |

---

## PART 1: CUSTOMER PERSONAS (6)

---

## Persona 1: Jake (Engineering Lead / Buyer)

*12-person startup. Evaluates tools for the team. Budget-conscious but will pay for real ROI. Cares about adoption friction and vendor lock-in risk.*

### 1. First Impression
The "diagnosis is free, treatment is paid" framing lands well — I've seen it work in observability tools and it's a legitimate mental model. But the instant I notice the scoring engine is MIT-licensed and self-hostable, I mentally forward that fact to our DevOps engineer and ask "can we run this ourselves?" For a 12-person team, $29/mo is not real money — but the OSS escape hatch plants doubt I have to actively kill before I can justify paying.

### 2. Would I Pay?
**Maybe → Yes, but only with a fast time-to-value demo.**
$29/mo is under most "just buy it" thresholds for a startup eng lead. The ROI math writes itself: one engineer saves 30 min/week on spec rework → paid for in 2 labor hours. The problem is I don't compute ROI unless someone hands me that math. The free tier gives me enough to demo to the team, but one rewrite/day with a 250-char preview means I'm showing engineers a tease, not a result. That's a hard sell in a standup.

### 3. Gaming Opportunities
- **Seat multiplication:** Each of my 12 engineers creates their own free account → 60 lints/day, 12 rewrites/day team-wide. Enough for moderate usage without paying.
- **API key sharing:** I buy Solo ($29), share the API key in our `.env.shared` repo. Unless there's per-seat rate limiting, the whole team works under one key.
- **OSS lint + paid rewrite split:** Self-host scoring via CLI/Action for unlimited linting; only hit the paid rewrite API when needed. Delay the upgrade decision indefinitely.

### 4. Conversion Trigger
**A team spec quality dashboard.** The feature that converts me from Solo to Team without hesitation: a view showing which specs are failing, who owns them, and score trends over a sprint. That's a reporting tool — I can put a metric in front of my VP of Engineering. I'd pay $79/mo for that without a second thought.

### 5. Conversion Killer
**Sam (our DevOps guy) self-hosts the whole thing in week one.** If the scoring engine is in our Actions pipeline before I've seen enough value to make the "just pay" decision, the upgrade conversation dies permanently. The OSS option is the biggest threat to Jake's conversion — not price.

### 6. Gating Verdict: 🟡 Works but leaky

### 7. Forced Negative
The free→Solo path is optimized for an individual, not a buyer. Jake doesn't personally need 25-item batches or codebase_context — he needs **team visibility** that only exists at $79. That means his correct entry tier is Team, but the pricing page likely positions Solo as the natural upgrade from Free. He'll buy Solo, feel like something's missing, and quietly churn — not because the product is bad, but because the tier was mis-matched from day one. The pricing page needs a "Buying for a team?" path that leads directly to Team.

---

## Persona 2: Sam (Senior DevOps / Operator)

*Automates everything. CI/CD obsessed. Hates manual steps. Would rather write a bash script than click a button.*

### 1. First Impression
MIT-licensed scoring engine. `npx speclint lint`. GitHub Action. Self-hostable. *I'm already writing the pipeline.* The hosted API rate limits are irrelevant to me — I'm running the OSS CLI in our GitHub Actions workflow, which means I get unlimited lints for free. I didn't even finish reading the pricing page before I mentally moved on. The only thing left to evaluate is whether the **rewrite** quality justifies paying.

### 2. Would I Pay?
**No on Solo immediately. Maybe on Team after 60 days of proving rewrite value.**
The OSS CLI gives me everything I need for lint CI. The upgrade case for me is entirely about automated rewrite: can the GitHub Action lint an issue, auto-apply a fix, and push a comment with the diff? If yes, and if the rewrite quality is good, I'll push Jake to buy Team. But I need to prototype with Solo first, and I'd want a 14-day trial before committing $29.

### 3. Gaming Opportunities
- **The obvious one:** Self-hosted CLI = unlimited linting for free, forever. The 5 hosted lints/day cap is a non-issue — Sam never uses the hosted API for linting.
- **Rewrite DIY path:** The full 5-dimension lint breakdown is free. I pass that breakdown + original spec into the Claude/OpenAI API directly. $0.002/rewrite. Better than $29/mo for my volume.
- **Bot account rotation for rewrites:** Our CI bot could use multiple GitHub accounts or API keys to get around the 1 rewrite/day free limit. Operationally messy but technically trivial.

### 4. Conversion Trigger
**A reliable, well-documented GitHub Action with auto-apply rewrite capability.** If I can drop 15 lines of YAML into `.github/workflows/speclint.yml`, have it lint issues on open/edit, and auto-apply rewrites below score 70 with a comment diff — I'd pay Solo that day. If it handles 50-item batches reliably with good rewrite quality, I'll upgrade Jake to Team.

### 5. Conversion Killer
**Any flakiness in the GitHub Action.** One rate-limit error at 3am, one malformed rewrite applied to a production issue, and I'm ripping it out. DevOps engineers have long memories for bad tools. The product lives and dies on Action reliability.

### 6. Gating Verdict: 🔴 Broken for this persona

### 7. Forced Negative
The free tier is so permissive for Sam's core use case — unlimited self-hosted linting — that there's essentially zero conversion pressure in the first 30 days. He gets his primary workflow for free immediately. The only hook is rewrite automation, which takes weeks to evaluate. The gating model has no 3-day conversion path for Sam. He'll live happily in free-tier CI mode indefinitely unless there's an active in-product nudge toward the rewrite automation value prop.

---

## Persona 3: Maya v2 (Solo Freelance Dev)

*Daily workflow: paste spec → fix → copy → paste into Cursor. Budget: $0–15/mo. Tool-addicted but financially careful.*

### 1. First Impression
This is actually exactly what I need — I'm constantly writing specs for Cursor and Claude Code, and half the time my agent starts implementing the wrong thing because my spec was vague. Five lints/day is plenty for my workflow. But one rewrite/day with a 250-char preview is brutal. On a heavy day I'm writing 5–8 specs. The preview teases me with the first sentence of the fix but doesn't give me the actual spec. That's the worst possible paywall — visible enough to frustrate, restrictive enough to block.

### 2. Would I Pay?
**No at $29/mo. Impulse-buy at $9/mo. Serious consideration at $15/mo.**
My tool budget is real and I track it. $29/mo is 2× my mental threshold for a single-purpose linting tool. I'd drop it in a second if I needed to cut costs. At $9/mo I'd buy it the first time I hit the rewrite limit without thinking. The conversion is purely a price problem, not a value problem.

### 3. Gaming Opportunities
- **Browser session rotation:** Firefox + Chrome + Safari + private window might each get independent cookie-based daily limits. That's potentially 4× the rewrites with zero technical effort.
- **Email alias accounts:** Gmail aliases or multiple accounts → multiple free tiers. I've done this for other tools with daily limits. It takes 2 minutes.
- **Preview extraction:** The 250-char preview + changes list is often enough to reconstruct the bulk of a short spec. I can read the first sentence of each section and fill in the rest myself.
- **The score-as-prompt trick:** The full lint breakdown (free) tells me exactly what's wrong. I paste "fix these issues: [breakdown]" into Claude.ai free tier. Not as good as Speclint's trained rewrite, but workable at $0.

### 4. Conversion Trigger
**A $9/mo solo tier, or an annual plan under $80.** The conversion is a price unlock, not a feature unlock. I already want the product. Remove the price barrier and I'm in. A "Freelancer" plan framing would also resonate — it signals they understand my situation.

### 5. Conversion Killer
**The 250-char preview feeling deliberately engineered to frustrate.** I can tell the difference between a generous preview and a calculated tease. If it feels like the number was chosen by a conversion optimizer rather than someone who uses the product, I get annoyed and leave. The preview needs to feel like a respectful sample, not a drip of value designed to manufacture pain.

### 6. Gating Verdict: 🟡 Works but leaky

### 7. Forced Negative
The $29/mo price point is calibrated for a developer with a company card, not a freelancer. Maya is likely 30–40% of early adopters — the vocal, tool-loving solo dev who evangelizes products to their network. The current model has no conversion path for her, which means she finds workarounds, tells her freelancer friends about those workarounds, and Speclint becomes known as "that tool that's free if you know how." That's the worst possible word of mouth for a paid SaaS product.

---

## Persona 4: Priya (Engineering PM)

*PM at a 50-engineer company. Uses Linear/Jira. Non-technical. Writes specs that engineers complain about.*

### 1. First Impression
I found this via a tweet from an engineering manager I follow. The homepage lets me paste a spec and get results immediately — right UX, no friction. The scoring breakdown is legible to me: "acceptance criteria: 45/100" is something I can understand and act on. I want to paste in every Linear ticket I've written in the last month. The language feels approachable, not developer-bro. First impression is genuinely good.

### 2. Would I Pay?
**Yes — Solo out of pocket to prove value, then Team on the company card once I have a metric.**
$29/mo is below my "ask permission" threshold. I'll expense it and see if my engineers stop complaining. If I can show a before/after score trend at sprint review, I'll pitch Team to my director. The ROI story is easy: "spec quality went up, clarification questions from engineers went down."

### 3. Gaming Opportunities
- Priya is not a gamer. She'll use the web UI as designed, hit the daily rewrite limit, and either upgrade or stop.
- The only workaround she'd stumble into: opening Speclint in a second browser profile with a different email. She wouldn't think of it as gaming — she'd just think "oh the limit reset."

### 4. Conversion Trigger
**A shareable spec quality report.** After a month of use, if I can generate a dashboard link or PDF showing "Priya's specs: avg score 72 this month, up from 54" and share it with my engineering director — I'm paying Team before the trial ends. This is how PM tools get bought: give PMs something they can show upward.

### 5. Conversion Killer
**Technical jargon in the rewrite output.** If the "fixed" spec sounds like it was written by a developer rather than a better version of me, I'll assume this tool isn't for PMs. The rewrite needs to preserve my voice while improving the structure. "Acceptance criteria schema" or "agent-parseable constraint blocks" in the output will lose me immediately.

### 6. Gating Verdict: 🟢 Model works for this persona

### 7. Forced Negative
The codebase_context feature (Solo+) is positioned as a key differentiator but is completely inaccessible to Priya — she doesn't know her tech stack well enough to fill it in meaningfully. She'd have to ask an engineer, which adds friction and makes her feel out of her depth. If codebase_context is heavily promoted as the "why Solo is better," Priya may interpret the free-tier rewrites as fundamentally limited and leave before discovering that even without that feature, the rewrites are useful. The gating model partially mis-signals value to non-technical buyers.

---

## Persona 5: Kai (Pipeline Operator)

*Runs autonomous agent-to-agent pipelines. Specs are machine-generated and machine-consumed. Needs deterministic, structured, API-first.*

### 1. First Impression
I went straight to the API docs. Free tier: 1-item-per-request breaks pipeline throughput from the start. Five hosted lints/day would be exhausted in the first pipeline run. Unstructured rewrite output means string parsing in a pipeline — that's a reliability risk. Solo is the real baseline for me. The question isn't whether I pay; it's whether the structured output schema is stable and versioned enough to trust in production.

### 2. Would I Pay?
**Yes, Solo immediately to prototype. Team within 30 days if throughput holds.**
Structured output + 25-item batch in Solo is enough to validate. If latency is acceptable (<2s/item) and the JSON schema is semver-stable with a documented changelog, I'm in production within a week. I'll hit the cross-spec context need within a month and upgrade to Team.

### 3. Gaming Opportunities
- **Self-host scoring, DIY rewrite:** The OSS scoring engine is free. I run unlimited scoring in my pipeline at $0. For rewrites, I feed the structured lint output as a prompt to my own LLM API call. Total cost: ~$0.002/rewrite via Claude Haiku or GPT-4o-mini. Speclint's rewrite quality may be better, but my rewrite is fully under my control — no third-party API SLA in my critical path.
- **This is the most dangerous leak in the entire model:** a sophisticated pipeline operator can get 80% of Solo value for near-$0 by combining free OSS scoring with DIY LLM rewrites.

### 4. Conversion Trigger
**A semver-versioned, stable JSON schema with a public changelog and deprecation policy.** Pipeline operators live and die by schema stability. Show me `Content-Type: application/vnd.speclint.rewrite+json; version=2` with a changelog, and I'll pay Solo immediately. That signal alone means "this is a production-grade API, not a toy."

### 5. Conversion Killer
**Non-deterministic structured output.** If I run the same spec twice and get different JSON field structures — different keys present, optional fields inconsistent — that's a production incident in my pipeline. One schema inconsistency and I build my own wrapper instead.

### 6. Gating Verdict: 🟡 Works but leaky (OSS + DIY escape hatch is too accessible)

### 7. Forced Negative
The batch ceiling — 25 items in Solo, 50 in Team — is too low for serious pipeline operators. A mid-size team processing 200 specs/day needs either a higher-tier batch size or a pagination pattern. There's no visible Enterprise tier, which signals the product hasn't thought about Kai's scale yet. He might not start a paid relationship at all if he can't see a clear path to the throughput he needs in 6 months.

---

## Persona 6: Derek (The Skeptic)

*Senior engineer. "ChatGPT does all of this." Needs to be proven wrong with hard evidence, not marketing claims.*

### 1. First Impression
Another AI wrapper. Let me guess: I paste a spec, GPT-4 "lints" it, and I get "be more specific about acceptance criteria." I've had a custom ChatGPT spec review prompt for six months. The 5-dimension scoring framework is mildly interesting — at least it's structured, not vibes. But I'd need to understand whether those dimensions are calibrated against real agent failure modes or just copied from a product requirements template someone found on Medium.

### 2. Would I Pay?
**No — not unless the free tier shows me something I genuinely can't replicate.**
I already pay for ChatGPT Plus. My custom prompt gives me spec feedback and inline rewrites. Why pay $29/mo for a specialized tool when my general one mostly works? The bar is high: Speclint's output needs to be demonstrably better for Cursor/Claude Code specifically — measurably better in agent task completion, not just "more structured."

### 3. Gaming Opportunities
- **Lint-as-prompt-engineering:** The full 5-dimension breakdown is free. I paste the breakdown + original spec into ChatGPT: "rewrite this spec to maximize these scores." I get a free approximate rewrite. Not as good, but probably 70% as effective.
- **Open-source the rubric against me:** I read the OSS scoring engine source on GitHub, understand what it's optimizing for, and refine my ChatGPT system prompt to target those exact dimensions. After 10 iterations my prompt is trained on the Speclint rubric. I never need to pay.
- **Preview inference:** 250-char preview + changes list gives me enough signal to reconstruct what the full rewrite would look like for short specs. Longer specs I'd reconstruct from the changes list and my own judgment.

### 4. Conversion Trigger
**Concrete A/B evidence: Speclint-rewritten specs produce fewer agent clarification requests than ChatGPT-rewritten specs.** Give me a benchmark: 50 specs, two rewrite methods, agent task completion rate. If Speclint's method wins by a statistically meaningful margin, I'm buying Solo that day. Nothing else will convince me — not testimonials, not score improvements, not "optimized for Cursor."

### 5. Conversion Killer
**The 250-char rewrite preview looking identical to what my ChatGPT prompt produces.** If the preview reads like generic GPT feedback ("add more detail to acceptance criteria, clarify the definition of done"), I'll conclude this is literally a ChatGPT wrapper with a pricing page, and I'll tweet about it. The preview has to show me something surprising — a structural choice I wouldn't have made, phrasing I recognize as agent-optimized rather than human-optimized.

### 6. Gating Verdict: 🟡 Works but leaky

### 7. Forced Negative
The free lint breakdown accidentally functions as a prompt engineering curriculum. Derek reads it, understands what Speclint is optimizing for, and trains his own ChatGPT prompt against it. He doesn't pay, but he tells his LinkedIn followers that "Speclint's open scoring is actually useful for building your own spec review prompts." The product inadvertently creates a free substitute for itself by being too transparent. The scoring rubric is a moat — but publishing the full 5-dimension breakdown in the free tier gives that moat away.

---

## PART 2: QUALITY PERSONAS (4)

---

## Persona 7: Quinn (QA Engineer)

*Tests gating boundaries for edge cases. Thinks in state machines. Finds the gap between "documented behavior" and "actual behavior."*

### 1. First Impression
The stated limits are: 5 lints/day (hosted), 1 rewrite/day. What I immediately want to know: are these enforced per IP, per account, per session cookie, per API key, or per device fingerprint? Each enforcement mechanism has different failure modes. Cookie-based limits break the moment I open an incognito window. IP-based limits break the moment I use a VPN or a coffee shop WiFi with shared NAT. Account-based limits are the only one that actually holds — but only if account creation has meaningful friction (email verification, phone, etc.).

### 2. Would I Pay?
**Not as a QA persona evaluating the system — but I'd flag every bypass to the team first.**
This is a professional evaluation. The real question is: do the limits hold under pressure? If they don't, a subset of real users will accidentally discover bypasses and the product will develop a reputation as easy to game.

### 3. Gaming Opportunities — Edge Cases Found

**Rewrite limit bypass vectors (in rough order of ease):**
1. **Cookie clearing:** If the daily rewrite limit is tracked via a browser cookie or local storage, clearing cookies resets the counter. Zero technical skill required.
2. **Incognito / private browsing:** A second browser window in private mode may have no session state, resetting limits. Most common naive bypass — affects any cookie-based enforcement.
3. **Multiple browser profiles:** Chrome allows named profiles, each with independent cookie stores. Trivial to maintain 3–4 profiles = 3–4 free rewrites without logging in.
4. **Account creation with email aliases:** Gmail `+alias` tricks, disposable email services (Mailinator, 10minutemail), or simple multi-account creation. Friction depends entirely on whether account verification is required.
5. **Boundary condition at limit:** What happens on the exactly-5th lint or exactly-1st rewrite? Does the API return a hard 429, a degraded response, or silently serve an empty result? Silent failures are the worst — user thinks the product is broken, not rate-limited.
6. **Timezone exploit:** If "daily" resets at midnight UTC and I'm in a different timezone, I might get effective "2 rewrites" by timing requests across the UTC day boundary. Common bug in "per day" limits.
7. **API key cycling:** If free API keys can be generated without friction, rotating keys is as easy as creating new accounts.

**What the boundary UX should look like (and probably doesn't):**
- Lint #5 of 5: "This is your last free lint today. [Upgrade for unlimited]" — proactive, before the block
- Rewrite #2 attempt: Immediate modal with upgrade CTA, not a generic error message
- What it probably shows: An HTTP 429 or a vague "limit reached" message that doesn't explain what the limit is or how to fix it

### 4. Conversion Trigger
**Transparent, graceful limit messaging with inline upgrade CTA.** If hitting the limit triggers a well-designed gate — "You've used your 1 free rewrite today. See the full rewrite for $29/mo" — Quinn would note it as a green flag: the product is honest about its limits, handles edges well, and the gate is a feature not a bug.

### 5. Conversion Killer
**Inconsistent enforcement.** If Quinn can get 3 rewrites in a single day by clearing cookies once, and the product doesn't catch it, the model is broken. Users who discover this share it. The community develops a workaround culture before the product reaches critical mass. Inconsistent enforcement is worse than no enforcement — it creates the impression of a product that doesn't know what it's doing.

### 6. Gating Verdict: 🟡 Works but leaky

### 7. Forced Negative
The free tier's "1 rewrite/day" is almost certainly enforced client-side or via a cookie at the web UI layer, and server-side for the API with API key tracking. The gap between these two enforcement layers is the biggest risk: web UI users can cookie-clear, while API users can key-rotate. Unless both surfaces share the same server-side usage accounting (tied to an authenticated account, not a session), the limit is a suggestion, not a gate. The product probably needs to require account creation before the first rewrite — even free — to enforce limits meaningfully.

---

## Persona 8: Morgan (Tech Lead / Cost Architecture)

*Reviews gating from a cost and sustainability perspective. Thinks in unit economics. Asks "can a power user bankrupt us?"*

### 1. First Impression
"Unlimited rewrites" at $29/mo is the phrase that makes me pull out a calculator. Rewrite calls are LLM calls — that means COGS per rewrite is real money. The question is whether the $29/mo price point covers the expected P99 usage scenario, or if it's priced assuming average behavior and exposed to cost outliers.

### 2. Would I Pay?
**This is the wrong question for Morgan — the question is: can the model survive?**

Let me run the math:

**Estimated costs per rewrite call:**
- Model: GPT-4o or Claude Sonnet (likely)
- Input tokens: ~500 (spec + system prompt) → ~$0.0025 at GPT-4o pricing
- Output tokens: ~300 (rewritten spec) → ~$0.0045
- **Cost per rewrite: ~$0.007–0.012 depending on model**

**Break-even analysis (Solo at $29/mo):**
- At $0.01/rewrite: break-even = 2,900 rewrites/month = 97 rewrites/day
- At $0.012/rewrite: break-even = 2,417 rewrites/month = 80 rewrites/day
- **A power user doing 100+ rewrites/day is operating at a loss for the product**

**What's a realistic power user ceiling?**
- Sam (DevOps, pipeline): Could submit 200+ rewrites/day in a CI pipeline
- Kai (pipeline operator): Could hit 500+ rewrites/day in a fully automated workflow
- Maya (solo dev, heavy usage): 10–15 rewrites/day — probably fine

**The death scenario:** A single pipeline operator who self-integrates Solo into a high-volume CI/CD pipeline submitting 500 rewrites/day costs the product ~$150/month in LLM calls alone while paying $29/mo. That's a -$121/month customer.

### 3. Gaming Opportunities — Cost Attack Vectors
- **Pipeline integration at Solo pricing:** One motivated DevOps engineer plugging unlimited rewrites into a busy CI pipeline could run COGS multiples above Solo revenue. Nothing in the current gating prevents this.
- **Batch gaming:** Solo's 25-item batch means one API call = 25 rewrites. A script running 1 batch call per minute = 36,000 rewrites/day. At $0.01/rewrite = $360/day in LLM costs for a $29/mo customer.
- **auto_rewrite endpoint:** One call = lint + rewrite. Every auto_rewrite is 2 LLM calls. High-volume users of auto_rewrite double the cost per request.

### 4. Conversion Trigger (as a recommendation to Speclint)
**Usage-based guardrails are non-negotiable.** "Unlimited" should mean "no artificial cap" but must include soft and hard rate limits: requests/minute, requests/day, and ideally a fair-use policy. Overage billing or throttling above a defined threshold (e.g., 500 rewrites/day on Solo) is standard practice.

### 5. Conversion Killer (risk to the business)
**A viral use case drives pipeline adoption before cost controls are in place.** If a popular dev influencer tweets "I plugged Speclint into my CI pipeline at $29/mo and it's amazing," the influx of pipeline users at $29/mo each generating $100+/mo in LLM costs is an existential event.

### 6. Gating Verdict: 🔴 Broken — unlimited rewrites at flat rate is unsustainable without usage guardrails

### 7. Forced Negative
"Unlimited" is a marketing word, not an engineering constraint. Every successful SaaS product that offers "unlimited" anything has either: (a) an informal fair-use policy with enforcement teeth, (b) soft rate limits that prevent abuse without appearing to limit normal users, or (c) usage-based cost control built into the pricing model from day one. Speclint has none of these visibly defined. This isn't a future problem — it's a day-1 architecture requirement. The first high-volume pipeline customer will make this painfully clear.

---

## Persona 9: Sasha (UX Designer)

*Evaluates upgrade path clarity. Is the paywall moment well-timed? Does the gate help or harm the experience?*

### 1. First Impression
The web UI flow as I understand it: land on homepage → paste spec → see lint score + breakdown → click "Fix it" → see 250-char preview + changes list (free) → upgrade CTA for full rewrite. This is a reasonable structure. The critical UX question is: **where exactly does the gate appear, and what does it say?**

The "diagnosis is free, treatment is paid" principle maps to a clean user journey — but the execution of the paywall moment is everything. A well-designed gate converts. A poorly designed gate frustrates and creates churn. The difference is about 15 words and one design decision.

### 2. Would I Pay?
**This depends entirely on when the gate appears and what it says.**
If the gate appears after I've seen the lint score AND the changes list AND the 250-char preview — meaning I've already received real value — the upgrade CTA arrives at peak desire. That's a good gate placement. If the gate appears before I've seen anything meaningful, it's a conversion killer.

### 3. Gaming Opportunities (UX-relevant)
- If the upgrade CTA is only visible after hitting the rewrite limit, users who hit it on their 2nd rewrite attempt have already been frustrated once. One frustration is recoverable. Two is churn.
- If the free→paid transition requires leaving the current page (redirecting to a pricing page), the user loses their draft spec context. Cognitive cost spikes, conversion drops.
- If the upgrade modal doesn't have a "continue with free preview" fallback, users feel trapped rather than offered a choice.

### 4. Conversion Trigger
**An in-context upgrade modal that appears at exactly the right moment — after the user has seen the preview and changes list, triggered by the "see full rewrite" CTA.** The modal should:
- Show the first 250 chars of the rewrite (already visible) + a blur/fade effect below
- Have a single CTA: "Unlock full rewrite — $29/mo"
- Include a one-line value anchor: "See what your spec actually needs to say"
- Have a dismiss option that doesn't feel punishing ("Keep the preview" not "No thanks, I hate good specs")

### 5. Conversion Killer
**A gate that appears before the user understands what they're upgrading for.** If I click "Fix it" and immediately see a paywall before any rewrite output — no preview, no changes list, just "upgrade to see results" — the gate feels like a bait-and-switch. The free tier must deliver real, satisfying value before the gate appears. The preview and changes list are essential pre-gate deliverables, not optional add-ons.

### 6. Gating Verdict: 🟡 Works in theory, but execution is fragile

### 7. Forced Negative
The 250-char preview is a specific number that will feel arbitrary to users. "250 characters" sounds like a lawyer wrote it. The preview should be expressed in human terms: "See the first improvement" or "Preview the opening of your rewritten spec." The technical limit can still be 250 chars — but surfacing the number itself signals "we deliberately cut you off here" rather than "here's a taste." Rename the concept; hide the number.

Additionally: there's no mention of an onboarding flow that sets expectations before the first gate hit. If the first time a user sees the upgrade CTA is when they've already hit the limit, that's a cold paywall. A better pattern: during signup or first use, show a small "here's how the free tier works" explainer that frames the gate as expected, not surprising.

---

## Persona 10: Sam Security (Security Researcher)

*Looks for gating bypass, tier-spoofing, API abuse, and data leakage vectors. Thinks in threat models, not features.*

### 1. First Impression
Before I use the product, I check: is there any client-side tier enforcement? Any JWT or API key that encodes plan information I could tamper with? Does the changes list (free) inadvertently expose enough of the rewrite to reconstruct the full output? These aren't hypotheticals — they're the first five minutes of any security evaluation.

### 2. Would I Pay?
**Irrelevant — evaluating bypass viability.**

### 3. Gaming Opportunities — Attack Vectors

**Tier-spoofing:**
- If the API key or JWT returned on auth encodes plan tier (`{"plan": "free"}`), a client-side modification or a forged token could claim Solo/Team tier without payment. Plan tier must be server-side only — never client-readable, never in the token payload. If it's in a JWT: decode it. If it's in a cookie: inspect it.
- If there's a `X-Plan-Tier` header in API responses, a transparent proxy that rewrites the request header could potentially spoof tier. Unlikely but worth auditing.

**Preview reconstruction:**
- The free tier returns: (1) 250-char preview, (2) changes list, (3) score delta. If the changes list is verbose — describing each specific change made — a determined user could reconstruct 60–80% of the full rewrite by applying the changes list to the original spec manually or with a secondary LLM call: "apply these changes to this spec: [changes list]." The changes list is the bigger leak than the preview.
- Test: How specific are the items in the changes list? If they say "Changed 'user clicks button' to 'user submits form via POST /api/submit'" — that's the full rewrite. If they say "Improved specificity of action descriptions" — that's appropriately vague.

**API key sharing / rotation:**
- Nothing prevents sharing a Solo API key across a team. Without per-seat enforcement or key binding to an account identity, one key = unlimited seats. This is a revenue leak, not a security breach, but it's real.
- Free key rotation: if account creation is frictionless (no phone, no payment method, just email), creating 10 free accounts to rotate keys is trivial. Rate limit circumvention at scale.

**Scraping structured output via preview:**
- If the free rewrite response includes any machine-readable metadata — JSON fields even partially populated, null fields with explicit keys — a developer could infer the schema of the paid structured output and build around it without paying.

**Replay attacks:**
- Can a free user capture a successful Solo rewrite response (e.g., from a trial) and replay it against different spec inputs by swapping the input before the response is generated? Unlikely but worth testing if there's any client-side caching.

**IDOR on rewrites:**
- If rewrite IDs are sequential integers or predictable UUIDs, a free user could attempt to access rewrite results generated by paid users via direct ID enumeration.

### 4. Conversion Trigger
Not applicable — but the finding that would make the product look trustworthy to a security reviewer: **the changes list is appropriately vague** (describes intent, not content), **tier enforcement is entirely server-side**, and **API keys are bound to accounts with rate-limiting per key, not per IP**.

### 5. Conversion Killer
**Finding the full rewrite reconstructible from the free changes list.** If a security researcher (or a curious power user) discovers they can feed the changes list + original spec into any LLM and get 80% of the paid rewrite for free — and then posts about it — the gating model collapses in public.

### 6. Gating Verdict: 🔴 Potentially broken — changes list verbosity is unvalidated

### 7. Forced Negative
The changes list is the most dangerous element in the free tier — more dangerous than the preview. A sufficiently specific changes list IS the rewrite. If item #3 in the changes list reads "Replaced 'The system should handle errors' with 'The API must return a 400 status code with a JSON body containing {error: string, code: string} when validation fails'" — that's a paid rewrite delivered for free in the changes list. The verbosity of the changes list needs an explicit content policy: describe the category of change, not the changed content.

---

## SYNTHESIS: All 10 Personas

### 1. Leaks — Where Paid Value Is Bleeding Into Free

**Critical leaks (fix before launch):**

1. **The Changes List** (Sam Security, Derek) — If changes list items describe the *content* of changes rather than the *category*, a user can reconstruct the full rewrite by applying the changes to the original spec via any LLM. This is a free rewrite hiding in the free tier. Fix: changes list items must describe intent, not content. "Improved acceptance criteria specificity" not "Changed X to Y."

2. **The Lint Breakdown as a Prompt Engineering Curriculum** (Derek, Sam Security) — The full 5-dimension breakdown in the free tier teaches users what Speclint optimizes for. A sophisticated user can replicate 70% of the rewrite quality by building a ChatGPT prompt targeting the same dimensions. The scoring rubric transparency is intentional (open-core), but the scoring breakdown in the API response is a near-complete prompt engineering guide.

3. **Unlimited Self-Hosted Linting Kills the Lint Upsell** (Sam, Kai) — The OSS CLI + GitHub Action give unlimited free linting to anyone who can run `npx`. The 5 hosted API lints/day is a friction-based limit that technical users bypass instantly. The lint limit is not a real gate for the target audience — it's only a gate for non-technical users (Priya), who weren't going to use the API anyway.

**Moderate leaks:**

4. **API Key Sharing** (Jake, Morgan) — Nothing prevents one Solo account serving an entire team. Per-seat enforcement is absent. At $29/mo for a 12-person team, the product is undercharging by 10–12× for team usage.

5. **Cookie/Session Limit Bypass** (Quinn) — Web UI daily limits that rely on cookies or local storage are bypassable with incognito mode or cookie clearing. Without account-gated enforcement, the 1-rewrite/day limit is more of a mild friction than a hard gate for motivated users.

### 2. Gaps — Where Free Is Too Restricted (Hurts Adoption)

1. **The 1 Rewrite/Day Limit Is Too Low for Solo Devs** (Maya) — Maya writes 5–8 specs/day. The free tier is useful for evaluation but not for a daily workflow. This creates pressure that resolves in one of two ways: upgrade, or find a workaround. Maya mostly finds workarounds. A limit of 3 rewrites/day would dramatically reduce workaround motivation while maintaining upgrade pressure for heavy users.

2. **The 250-char Preview Is Too Small to Demonstrate Quality** (Derek, Sasha) — The preview needs to show something *surprising* to convert Derek. 250 characters is roughly 2–3 sentences. That's not enough to demonstrate that Speclint's rewrite is different from ChatGPT's output. Consider showing the first complete section of the rewrite (e.g., the full rewritten problem statement, not a character-truncated snippet).

3. **No Team Demo Path** (Jake) — Jake needs to show the product to 12 engineers. He gets 1 rewrite/day to do it. There's no "team trial" mode, no shareable demo link, no "invite 3 teammates to try free" hook. The free tier is designed for individual evaluation, not team buying decisions.

4. **No Conversion Path for the $0–15/mo Segment** (Maya) — Approximately 30–40% of early adopters are likely solo devs with sub-$20/mo tool budgets. The current model jumps from $0 to $29 with nothing in between. This segment either converts via workarounds (bad) or churns (also bad).

### 3. Missing Tier? — Should There Be a $9 or $15 Tier?

**Yes — a $9/mo "Solo Lite" tier is strongly indicated.**

Evidence:
- Maya (freelance dev) is a real segment who wants the product at $29 but won't buy it
- The gap between $0 and $29 is large relative to competing single-purpose dev tools ($6–15/mo range)
- A $9 tier with ~10 rewrites/day, full rewrite text (no preview), no codebase_context or structured output, and 1-item batches would convert Maya without cannibalizing Solo

**Proposed tier structure:**

| Tier | Price | Rewrites | Full Text | codebase_context | Structured Output | Batch |
|---|---|---|---|---|---|---|
| Free | $0 | 1/day | Preview only | ❌ | ❌ | 1 |
| **Lite** | **$9/mo** | **10/day** | **✅** | **❌** | **❌** | **1** |
| Solo | $29/mo | Unlimited | ✅ | ✅ | ✅ | 25 |
| Team | $79/mo | Unlimited | ✅ | ✅ | ✅ | 50 |

The Lite tier captures Maya's segment, creates a lower-friction upgrade step from Free, and doesn't cannibalize Solo (which has the full feature set that Jake, Kai, and Sam need).

**Counter-argument to include:** A $9 tier adds pricing complexity and a "good enough" option that could slow Solo adoption. If the goal is to push users toward Solo, eliminating the $9 option forces a sharper buy/don't-buy decision. This is a valid tradeoff — the right call depends on whether Maya's segment is actually paying $0 or just leaving. Instrument the free tier conversion rate first.

### 4. Self-Host Threat — How Real Is It?

**For linting: Existential threat to the hosted lint API, but not to the business.**
The OSS scoring engine gives unlimited self-hosted linting to any technical user. Sam, Kai, and Derek can all escape the hosted lint limits immediately. However: these users were never going to pay for linting alone. The lint API limits are a funnel gate for non-technical users (Priya), not a revenue source. The self-host threat to linting is real but largely affects users who wouldn't convert anyway.

**For rewriting: Moderate threat, real with effort.**
Sam Security and Derek both identified the "OSS scoring + DIY LLM rewrite" path: score the spec free, pass the score to any LLM for a rewrite. This path requires: (a) knowing the self-host option exists, (b) setting up a local pipeline, (c) accepting lower rewrite quality. Most users won't bother. Power users (Kai, Derek, Sam) might. The quality gap between Speclint's trained rewrite and a naive ChatGPT rewrite is the moat — if that gap is real and visible, the DIY path is a valid but clearly inferior choice.

**Verdict:** The self-host threat is a retention issue for power technical users, not a mass-market issue. Mitigation: (1) make the quality gap obvious in the free preview, (2) offer the schema stability and API reliability that power users value and can't get from DIY.

### 5. Competitive Moat — What Stops Cloning?

**Thin moat today. Durable moat is achievable but not yet built.**

**What's clonable:**
- The OSS scoring engine is MIT-licensed — clone it, fork it, wrap it, it's designed to be replicated
- The rewrite prompt is a system prompt — competitors can approximate it
- The web UI is commodity
- The GitHub Action is a thin wrapper

**What's harder to clone:**
1. **Agent-specific calibration data** — If the scoring dimensions are trained/tuned against real agent failure modes (Cursor, Claude Code, Codex task completion rates), that calibration data is not OSS. This is the real moat — but only if it's meaningfully better than a generic rubric, and only if users can observe the difference.
2. **API reliability + versioning + SLA** — Sam (DevOps) and Kai (pipeline) will pay for an API they can trust. A scrappy clone won't have uptime SLAs or versioned schemas.
3. **Integration surface** — A GitHub Action with proven reliability, team analytics, and Linear/Jira plugins is hard to clone quickly.
4. **Network effects** (future) — If team spec quality scores are shareable or benchmarkable against industry baselines, the product becomes more valuable with more users. Not present yet.

**Biggest clone risk:** An established player (Linear, GitHub, Cursor) adds "spec quality scoring" as a native feature. That's not a Speclint clone — it's a Speclint replacement for a subset of users who live in one tool. Mitigation: depth in the cross-tool workflow (scores visible in GitHub issues, Linear tickets, Cursor sidepanel) before that happens.

### 6. Final Recommendation — Specific Changes to the Gating Model

Listed in priority order:

---

**P0 — Fix Before Launch (Breaks the Model)**

**1. Audit and restrict the changes list verbosity.**
The changes list in the free rewrite response must describe the *category* of change, not the *content*. "Improved specificity of step 3" not "Changed 'button click' to 'POST /api/submit with payload {…}'." A verbose changes list is a free rewrite. Define an explicit content policy for changes list items and enforce it in the rewrite prompt.

**2. Enforce rewrite limits server-side, tied to authenticated accounts — not cookies.**
The 1-rewrite/day limit must require account creation to enforce. A gate that resets on cookie clear is not a gate. Minimum viable enforcement: email-verified account required before first rewrite (free or paid). This adds friction but is the only reliable enforcement mechanism. Consider: make account creation feel like a feature ("save your lint history") rather than a wall.

**3. Add usage guardrails to "Unlimited" rewrite tiers.**
"Unlimited" must have soft rate limits and a documented fair-use policy. Recommended: 500 rewrites/day on Solo (soft limit, with email notification at 80%); 1,000/day on Team. Overages throttled, not hard-blocked. This protects against the Morgan scenario — one pipeline user burning $150/day in LLM costs on a $29/mo plan.

---

**P1 — Fix Before Marketing Push (Hurts Conversion)**

**4. Add a $9/mo Lite tier OR raise the free rewrite limit to 3/day.**
The current gap between $0 and $29 is too large for Maya's segment. Preferred: add a Lite tier at $9/mo (10 rewrites/day, full text, no codebase_context, 1-item batch). Alternative if tier complexity is undesirable: raise free rewrites to 3/day to reduce workaround motivation and improve word-of-mouth. Measure free→Solo conversion rate before deciding.

**5. Replace the 250-char preview with a section-based preview.**
Show the first complete section of the rewritten spec (e.g., the problem statement or first acceptance criterion), not a character-truncated snippet. This demonstrates real rewrite quality (converting Derek) without giving away the full output. The concept "see the first improvement" converts better than "250 characters."

**6. Add a team trial / demo sharing mode.**
Jake needs to show the product to his team. Add: (a) a "share this lint result" link that shows the score + breakdown to anyone, (b) a "invite to trial" flow that gives teammates 3 free rewrites before the gate. Team buying decisions require team exposure. Individual free tiers don't serve team buyers.

---

**P2 — Improve Retention and Power-User Experience**

**7. Publish a versioned JSON schema with changelog for structured output.**
Kai's conversion depends on this. Add `Content-Type: application/vnd.speclint.rewrite+json; version=1` headers, a public schema definition, and a documented deprecation policy. This costs almost nothing to implement and is the difference between a production-grade API and a prototype for pipeline operators.

**8. Design the paywall moment as a feature, not a friction point.**
Sasha's finding: the upgrade modal must appear after the user has received real value (seen the preview + changes list), must show the blurred-but-present full rewrite below the visible preview, must have a single CTA, and must offer a graceful fallback ("Keep the preview"). Remove the number "250 characters" from any user-facing text — replace with "see the full rewrite."

**9. Add a CI pipeline onboarding track for Sam.**
Sam's conversion path is 60+ days in the current model. Shorten it: add a "Integrate in CI" quickstart that shows the GitHub Action setup in <5 minutes, includes a working example with auto-apply rewrite, and ends with "ready to automate rewrites? Upgrade to Solo." The goal is to show Sam the rewrite automation value prop before he decides to DIY it.

**10. Add an in-app spec quality trend report for Priya.**
A simple "your spec scores over time" view — even just a chart with weekly averages — turns Speclint from a linting tool into a PM accountability metric. This is the feature that gets Priya to expense Team and show it to her director.

---

*Pressure test complete. 10 personas, 10 verdicts, 37 specific findings, 10 prioritized recommendations.*
*Document: `/products/speclint/sprints/gating-pressure-test-s10.md`*
