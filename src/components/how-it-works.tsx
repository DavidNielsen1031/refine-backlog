"use client"

import { ScrollReveal } from "@/components/scroll-reveal"

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Issue opens on GitHub",
      description: "The speclint-action fires automatically on issues.opened and issues.edited. No manual trigger. No CI configuration beyond the YAML.",
      code: "on:\n  issues:\n    types: [opened, edited]",
    },
    {
      number: "02",
      title: "Spec gets scored",
      description: "The issue body is evaluated across 5 dimensions. Each maps to a real failure mode: agents that guess, agents that over-build, agents that skip edge cases. Result: a completeness_score from 0\u2013100.",
      code: '{\n  "completeness_score": 58,\n  "agent_ready": false,\n  "missing": ["has_measurable_outcome", "has_verification_steps"]\n}',
    },
    {
      number: "03",
      title: "Gate, label, or fix",
      description: "Below threshold? Speclint comments with exactly what's missing \u2014 and can rewrite the spec for you. Above threshold? The issue is labeled agent_ready and your coding agent can pick it up. You set the threshold (default: 70).",
      code: 'if score >= threshold:  # default: 70\n  label("agent_ready")\nelse:\n  comment("missing: ...")\n  # rewrite available via /api/rewrite\n  # re-lints on issues.edited',
    },
  ]

  return (
    <section className="bg-[#0a0a0a] py-24 border-b border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16">
            <p className="text-emerald-400 font-mono text-sm mb-3">// how it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Spec in. Score out. Fix in 2 minutes.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.number} delay={Math.min(idx + 1, 3) as 1 | 2 | 3}>
              <div className="relative group">
                <div className="text-6xl font-bold text-[#1a1a1a] font-mono mb-4 select-none group-hover:text-emerald-500/10 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{step.description}</p>
                <pre className="bg-[#111] border border-[#222] rounded-lg px-4 py-3 text-xs text-emerald-300 font-mono overflow-x-auto group-hover:border-emerald-500/20 transition-colors">
                  {step.code}
                </pre>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
