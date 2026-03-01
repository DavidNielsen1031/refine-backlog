import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "AI-Powered Spec Linting for Coding Agents — Speclint",
  description: "Learn how AI-powered spec linting catches broken GitHub issues before your coding agent wastes hours on the wrong thing. Speclint scores every issue for agent-readiness.",
  keywords: ["ai coding agent spec quality", "lint github issues", "spec infrastructure", "cursor codex spec", "speclint completeness score"],
  alternates: {
    canonical: "https://speclint.ai/blog/ai-powered-backlog-refinement",
  },
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AI-Powered Spec Linting for Coding Agents",
  "description": "How Speclint uses AI to lint GitHub issues before your coding agent touches them — catching ambiguity, missing context, and untestable acceptance criteria automatically.",
  "author": {
    "@type": "Person",
    "name": "David Nielsen",
    "url": "https://speclint.ai/about",
    "jobTitle": "Spec Infrastructure Engineer"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Speclint",
    "url": "https://speclint.ai"
  },
  "datePublished": "2026-03-01",
  "dateModified": "2026-03-01",
  "mainEntityOfPage": "https://speclint.ai/blog/ai-powered-backlog-refinement",
  "image": "https://speclint.ai/og-image.png"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://speclint.ai" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://speclint.ai/blog" },
    { "@type": "ListItem", "position": 3, "name": "AI-Powered Spec Linting", "item": "https://speclint.ai/blog/ai-powered-backlog-refinement" }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is spec linting for AI coding agents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Spec linting analyzes your GitHub issues before an AI coding agent picks them up. It checks for completeness — does the issue have a clear problem statement, testable acceptance criteria, relevant file paths, and enough context for an agent to work autonomously? Issues that fail the lint get flagged with a completeness_score and specific remediation suggestions."
      }
    },
    {
      "@type": "Question",
      "name": "How is Speclint different from just using ChatGPT to review issues?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Speclint is purpose-built for agent pipelines. It outputs structured JSON with a completeness_score, specific failure reasons, and an agent_ready label — not prose feedback you have to interpret. It integrates directly into your GitHub Actions workflow, so every issue gets linted automatically when opened or labeled."
      }
    },
    {
      "@type": "Question",
      "name": "What score does an issue need to be agent_ready?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Speclint applies the agent_ready label when an issue scores 80 or above on the completeness_score scale. Below 80, the issue gets a comment with the specific dimensions that need improvement — missing AC, no file context, ambiguous scope, etc."
      }
    }
  ]
};

export default function BlogPost() {
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
          <p className="text-sm text-muted-foreground mb-4">By David Nielsen · March 1, 2026 · 6 min read</p>
          <h1 className="text-4xl font-bold font-space-grotesk mb-6 leading-tight">
            AI-Powered Spec Linting for Coding Agents
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your AI coding agent is only as good as the issue it&apos;s reading. Speclint analyzes every GitHub issue before your agent touches it — scoring completeness, flagging ambiguity, and blocking low-quality specs from wasting compute.
          </p>
        </header>

        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-12">
          <p className="text-sm font-semibold text-emerald-400 mb-2">The Core Problem</p>
          <p className="text-muted-foreground">
            Cursor, Codex, and Claude Code don&apos;t push back on bad specs. They hallucinate confidently and ship the wrong thing. Speclint is the quality gate that runs before your agent does.
          </p>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none space-y-6">

          <h2 className="text-2xl font-semibold mt-12 mb-4">The agent doesn&apos;t know your spec is broken</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you assign a GitHub issue to Codex or kick it off in Cursor, the agent reads the issue title, description, and acceptance criteria — then starts writing code. If the spec is vague, the agent fills in the blanks with assumptions. Those assumptions are often wrong.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This isn&apos;t a model problem. GPT-4, Claude 3.5, and Gemini all do the same thing: they&apos;re trained to be helpful and complete, so they complete the task even when the task is underspecified. The result is code that compiles, passes tests you wrote for the wrong behavior, and ships the wrong feature.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The fix isn&apos;t a better model. It&apos;s better specs.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What spec linting actually checks</h2>
          <p className="text-muted-foreground leading-relaxed">
            Speclint analyzes each GitHub issue across five dimensions that predict whether an AI coding agent will ship the right thing:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Problem statement clarity</strong> — Is there a specific, observable problem described? Or just a vague feature request?</li>
            <li><strong className="text-foreground">Acceptance criteria testability</strong> — Can the ACs be verified by running tests or inspecting the UI? Or are they subjective ("should feel fast")?</li>
            <li><strong className="text-foreground">Scope boundedness</strong> — Is the issue small enough for a single agent pass? Or does it hide three features behind one title?</li>
            <li><strong className="text-foreground">Codebase context</strong> — Are the relevant files, components, or API endpoints mentioned? Or does the agent have to guess where to start?</li>
            <li><strong className="text-foreground">Edge case coverage</strong> — Are the failure modes described? What should happen when things go wrong?</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Each dimension contributes to a <code className="text-emerald-400">completeness_score</code> from 0–100. Issues scoring 80+ get the <code className="text-emerald-400">agent_ready</code> label and are safe to assign to your coding agent. Issues below 80 get a comment with specific remediation.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">How the GitHub Action works</h2>
          <p className="text-muted-foreground leading-relaxed">
            Speclint plugs directly into your GitHub workflow. Add the action to your repo and it runs every time an issue is opened or labeled:
          </p>
          <pre className="bg-muted/30 rounded-lg p-4 text-sm text-emerald-300 overflow-x-auto">
{`# .github/workflows/speclint.yml
on:
  issues:
    types: [opened, edited, labeled]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: speclint/lint-issues@v1
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          speclint-api-key: \${{ secrets.SPECLINT_API_KEY }}`}
          </pre>
          <p className="text-muted-foreground leading-relaxed">
            The action posts a structured comment with the <code className="text-emerald-400">completeness_score</code>, the failing dimensions, and suggested improvements. If the issue passes, it gets labeled <code className="text-emerald-400">agent_ready</code>. No manual review required.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Why this matters for Cursor and Codex workflows</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you&apos;re running a small AI dev shop — 2–5 engineers using Cursor or Codex for the heavy lifting — the bottleneck isn&apos;t the agent&apos;s coding ability. It&apos;s the quality of the issues going into the pipeline. A good agent with a bad spec wastes 30–60 minutes of compute and human review time per iteration.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Multiply that by 10–20 issues per week and you&apos;re looking at a significant drag on throughput. Speclint catches the bad specs before the agent starts — the same way ESLint catches syntax errors before your code ships.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Getting started</h2>
          <p className="text-muted-foreground leading-relaxed">
            Get your API key at <Link href="https://speclint.ai/get-key" className="text-emerald-400 hover:underline">speclint.ai/get-key</Link>, add it as a repository secret (<code className="text-emerald-400">SPECLINT_API_KEY</code>), and install the GitHub Action. Your first 100 issue lints are free.
          </p>
        </div>

        <div className="mt-16 p-8 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <h3 className="text-xl font-semibold mb-3">Stop letting bad specs reach your agent</h3>
          <p className="text-muted-foreground mb-4">Get your API key and install the GitHub Action in under 5 minutes.</p>
          <pre className="bg-muted/30 rounded-lg p-4 text-sm text-emerald-300 overflow-x-auto mb-6">
{`- uses: speclint/lint-issues@v1
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    speclint-api-key: \${{ secrets.SPECLINT_API_KEY }}`}
          </pre>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
            <Link href="https://speclint.ai/get-key">
              Get Your API Key <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </article>
    </main>
  )
}
