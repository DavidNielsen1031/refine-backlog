import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "The 15-Item Definition of Ready Checklist Every Scrum Team Needs — Refine Backlog",
  description: "A complete Definition of Ready checklist with 15 items covering user stories, acceptance criteria, dependencies, and estimability. Copy this template for your next sprint planning session.",
  keywords: ["definition of ready checklist", "DoR template", "sprint planning checklist", "scrum definition of ready", "backlog ready criteria"],
  alternates: {
    canonical: "https://refinebacklog.com/blog/definition-of-ready-checklist-15-items",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The 15-Item Definition of Ready Checklist Every Scrum Team Needs",
  "description": "A complete Definition of Ready checklist with 15 items covering user stories, acceptance criteria, dependencies, and estimability. Copy this template for your next sprint planning session.",
  "author": {
    "@type": "Person",
    "name": "David Nielsen",
    "url": "https://refinebacklog.com/about",
    "jobTitle": "Agile Coach & Product Strategist"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Perpetual Agility LLC",
    "url": "https://refinebacklog.com"
  },
  "datePublished": "2026-02-28",
  "dateModified": "2026-02-28",
  "mainEntityOfPage": "https://refinebacklog.com/blog/definition-of-ready-checklist-15-items",
  "image": "https://refinebacklog.com/og-image.png"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://refinebacklog.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://refinebacklog.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "15-Item DoR Checklist", "item": "https://refinebacklog.com/blog/definition-of-ready-checklist-15-items" }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a Definition of Ready in Scrum?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Definition of Ready (DoR) is a shared agreement between the product owner and development team that defines the minimum criteria a backlog item must meet before it can be pulled into a sprint. Unlike the Definition of Done (which defines when work is complete), the DoR defines when work is ready to start. Items that don't meet DoR criteria should be sent back to refinement, not pulled into planning."
      }
    },
    {
      "@type": "Question",
      "name": "How many items should be on a Definition of Ready checklist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most teams use 5-8 items, which is manageable but often leaves gaps — particularly around dependencies, non-functional requirements, and design artifacts. A 15-item checklist is comprehensive enough to catch common sprint failures without becoming bureaucratic. The key is to automate the easy items (story format, AC structure, effort estimate) so the team only spends manual review time on judgment calls like dependency resolution and stakeholder sign-off."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a story doesn't meet the Definition of Ready?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Stories that don't meet DoR should not enter the sprint. The product owner is responsible for getting the story to a ready state before the next sprint planning session. In practice: flag the item during refinement, assign the specific DoR gaps (e.g., 'needs acceptance criteria,' 'dependencies unresolved'), and set a deadline for resolution. If a team consistently pulls in non-ready stories, the sprint predictability data will show it — missed commitments, spillover, and mid-sprint scope questions trace back to DoR violations."
      }
    },
    {
      "@type": "Question",
      "name": "Which Definition of Ready items can be automated with AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Items 1-4 (story format, problem statement, acceptance criteria, Gherkin scenarios) and item 8 (effort estimate) can be generated or checked automatically by AI tools. Items 5-7 (dependencies, blockers, independence) require human judgment about the technical context. Items 9-15 (design artifacts, API contracts, security requirements, QA scenarios, PO sign-off) are human workflows that AI can prompt but can't complete. The goal is to use AI to draft items 1-5 so refinement meetings focus only on the judgment calls."
      }
    }
  ]
};

const checklistItems = [
  {
    num: 1,
    title: "User story follows standard format",
    detail: "\"As a [type of user], I want [goal], so that [benefit].\" This format forces the team to articulate who benefits and why — not just what to build. If you can't fill in all three blanks, the story isn't understood yet.",
    automatable: true,
  },
  {
    num: 2,
    title: "Problem statement is clearly articulated",
    detail: "Not a solution, not a feature request — a problem. \"Users can't find their order history on mobile\" is a problem. \"Add an order history page\" is a solution. Stories built on solutions skip the why and frequently deliver the wrong thing.",
    automatable: true,
  },
  {
    num: 3,
    title: "Acceptance criteria written (minimum 3 testable conditions)",
    detail: "Each AC must be binary: either it passes or it doesn't. \"Improve the loading experience\" fails this test. \"Dashboard loads in under 2 seconds on 4G connections\" passes it. Minimum 3 conditions covers the happy path, at least one edge case, and one failure/error state.",
    automatable: true,
  },
  {
    num: 4,
    title: "Gherkin scenarios drafted for complex flows",
    detail: "Given/When/Then format for any story that touches a multi-step user flow, state change, or branching logic. Not every story needs Gherkin — save it for flows where ambiguity about sequence could cause rework. For simpler acceptance criteria, see our guide to <a href='/blog/how-to-write-acceptance-criteria'>writing acceptance criteria that work</a>.",
    automatable: true,
  },
  {
    num: 5,
    title: "Dependencies identified and documented",
    detail: "List every upstream dependency: APIs that must exist, data that must be migrated, other stories that must ship first. Unknown dependencies are the #1 cause of sprint spillover. If you discover them mid-sprint, the estimate is invalidated.",
    automatable: false,
  },
  {
    num: 6,
    title: "Blockers are removed or have a clear resolution path",
    detail: "A blocker is anything that prevents the team from starting work on day 1 of the sprint. Either resolve it before planning or document a specific owner and date for resolution. \"We'll figure it out\" is not a resolution path.",
    automatable: false,
  },
  {
    num: 7,
    title: "Story is independently deliverable",
    detail: "The \"I\" in INVEST. Can this story be shipped and provide value without requiring another story to be complete? If story B can't ship without story A, consider merging them or restructuring the slice. Stories with hard dependencies create convoy effects in the sprint.",
    automatable: false,
  },
  {
    num: 8,
    title: "Effort estimate assigned (story points or t-shirt size)",
    detail: "Not a precise prediction — a sizing agreement. The team has enough information to say whether this is an S, M, L, or XL effort. If nobody can estimate it, the story isn't refined enough. Inability to estimate is a DoR failure signal.",
    automatable: true,
  },
  {
    num: 9,
    title: "Team agrees estimate is achievable in one sprint",
    detail: "If the estimate implies more than one sprint of work, break it down. A story that spans sprint boundaries is an epic in disguise. The split point is almost always obvious once you ask: \"What's the smallest version of this that delivers value?\"",
    automatable: false,
  },
  {
    num: 10,
    title: "Design mockups or wireframes attached (if UI work)",
    detail: "Any story that changes the user interface needs a visual reference before it enters the sprint. Low-fidelity is fine — even a sketch. Engineers shouldn't be making visual design decisions during implementation; that decision-making time isn't in the estimate.",
    automatable: false,
  },
  {
    num: 11,
    title: "API contracts defined (if backend work)",
    detail: "For stories touching an API — new endpoint, changed schema, auth flow — the contract must be agreed on before work starts. This includes: method, path, request/response shape, error codes, and auth requirements. Front-end and back-end teams can then work in parallel against the contract.",
    automatable: false,
  },
  {
    num: 12,
    title: "Security and compliance requirements noted",
    detail: "Does this story handle PII? Does it touch authentication or authorization? Does it affect audit logs or data retention? These requirements change the implementation significantly and need to be in scope before the estimate. Discovering them mid-sprint forces rework.",
    automatable: false,
  },
  {
    num: 13,
    title: "Non-functional requirements documented",
    detail: "Performance targets, accessibility requirements (WCAG level), browser/device compatibility, localization needs. \"It should be fast\" is not an NFR. \"The API response must be under 300ms at the 95th percentile\" is. NFRs left undefined become scope arguments after the fact.",
    automatable: false,
  },
  {
    num: 14,
    title: "Test scenarios identified (not just happy path)",
    detail: "QA shouldn't be writing test scenarios for the first time during the sprint. The team should agree on: happy path, key edge cases, and at least one negative test (what happens when input is invalid or the system is unavailable). This is different from acceptance criteria — it's the QA execution plan.",
    automatable: false,
  },
  {
    num: 15,
    title: "Product owner has signed off on scope",
    detail: "The PO confirms: this story solves the right problem, the AC covers the right conditions, and the scope is appropriate for the sprint. Without this, engineers might implement something technically correct but misaligned with business intent. PO sign-off is the final gate before planning.",
    automatable: false,
  },
];

export default function BlogPost() {
  const automatableCount = checklistItems.filter(i => i.automatable).length;

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <article className="mx-auto max-w-3xl px-6 lg:px-8 py-24">
        <Link href="/blog" className="text-emerald-400 hover:underline text-sm mb-8 inline-block">
          ← Back to Blog
        </Link>

        <header className="mb-12">
          <p className="text-sm text-muted-foreground mb-4">By David Nielsen · February 28, 2026 · 8 min read</p>
          <h1 className="text-4xl font-bold font-space-grotesk mb-6 leading-tight">
            The 15-Item Definition of Ready Checklist Every Scrum Team Needs
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Most Definition of Ready checklists have 5 items. Most sprints still blow up from the same root causes: unknown dependencies, missing designs, undefined NFRs, no PO sign-off. Here&apos;s a complete 15-item DoR checklist that covers the gaps — with {automatableCount} items you can automate away entirely.
          </p>
        </header>

        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-12">
          <p className="text-sm font-semibold text-emerald-400 mb-2">Key Takeaway</p>
          <p className="text-muted-foreground">
            A rigorous Definition of Ready eliminates the two most common sprint failures: mid-sprint clarification loops and post-sprint rework from misunderstood scope. Teams that enforce DoR consistently report 30-40% fewer sprint commitment misses. The first {automatableCount} items can be drafted automatically with AI — leaving only judgment calls for human review.
          </p>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-6">

          <h2 className="text-2xl font-semibold mt-12 mb-4">Why 5-item checklists leave gaps</h2>
          <p className="text-muted-foreground leading-relaxed">
            The typical DoR covers: user story format, acceptance criteria, estimated, no blockers, PO approved. That&apos;s a good starting point. It doesn&apos;t cover design artifacts, API contracts, security requirements, NFRs, or QA scenarios — all of which, when undefined, cause mid-sprint slowdowns or post-sprint rework.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The expanded 15-item checklist below is designed for teams building software products. Not every item applies to every story — use judgment. But every item on this list has caused real sprint failures when skipped. For foundational DoR concepts, see our <Link href="/blog/definition-of-ready-checklist" className="text-emerald-400 hover:underline">core Definition of Ready guide</Link>.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">The complete 15-item checklist</h2>

          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.num} className="p-5 rounded-xl border border-border bg-muted/10">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center">
                    {item.num}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.automatable && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          AI-automatable
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.detail }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mt-12 mb-4">How to use this checklist in your refinement meeting</h2>
          <p className="text-muted-foreground leading-relaxed">
            Don&apos;t run every story through all 15 items in the meeting — that&apos;s how refinement becomes a 3-hour death march. Instead:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Before the meeting:</strong> Run stories through an AI tool to auto-generate items 1-4 and item 8 (story format, problem statement, AC, Gherkin if needed, effort estimate). This gives you a draft to react to instead of a blank page.</li>
            <li><strong className="text-foreground">In the meeting:</strong> Review only the judgment items — dependencies (5-7), design artifacts (10-11), security/NFRs (12-13), QA scenarios (14), and PO sign-off (15). These can&apos;t be automated and require team discussion.</li>
            <li><strong className="text-foreground">Gate at planning:</strong> Any story missing a checklist item during sprint planning goes back. Don&apos;t pull it in with the intent to resolve it later — &quot;later&quot; is always mid-sprint.</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Which items to automate vs. which need human judgment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-sm font-semibold text-emerald-400 mb-3">✦ AI can draft these</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. User story format</li>
                <li>2. Problem statement</li>
                <li>3. Acceptance criteria</li>
                <li>4. Gherkin scenarios</li>
                <li>8. Effort estimate</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-border bg-muted/10">
              <p className="text-sm font-semibold text-foreground mb-3">⚑ Humans must decide these</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>5-7. Dependencies, blockers, independence</li>
                <li>9. Achievable in one sprint</li>
                <li>10-11. Design artifacts, API contracts</li>
                <li>12-13. Security, NFRs</li>
                <li>14. QA scenarios</li>
                <li>15. PO sign-off</li>
              </ul>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The goal is to enter every refinement meeting with items 1-5 already drafted, so the team spends their time on judgment — not transcription.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">How to handle stories that don&apos;t meet DoR</h2>
          <p className="text-muted-foreground leading-relaxed">
            The answer is simple and uncomfortable: don&apos;t pull them into the sprint.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In practice, teams feel pressure to fill the sprint capacity and pull in &quot;mostly ready&quot; stories with open items. This is where sprint failures originate. A team that consistently misses commitments by 20-30% almost always has a DoR enforcement problem, not an estimation problem.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When a story fails DoR at planning: flag the specific items that aren&apos;t met, assign an owner for each gap, and set a date. If the gaps can be resolved in 1-2 days, consider pulling the story in with a commitment to resolve before anyone starts work. If resolution requires more than a couple of days — the story waits for the next sprint.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For a deeper dive on the refinement process itself, see our guide to <Link href="/blog/backlog-refinement-best-practices" className="text-emerald-400 hover:underline">backlog refinement best practices</Link>.
          </p>
        </div>

        <div className="mt-16 p-8 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
          <h3 className="text-xl font-semibold mb-3">Auto-generate items 1–4 for your next refinement</h3>
          <p className="text-muted-foreground mb-6">Paste a raw backlog item. Get a structured user story, acceptance criteria, Gherkin scenarios, and effort estimate in seconds — free, no signup.</p>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
            <Link href="/#refiner">
              Refine My Backlog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    </main>
  )
}
