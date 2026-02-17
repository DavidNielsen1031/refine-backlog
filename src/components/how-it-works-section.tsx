"use client"

import { ClipboardPaste, Sparkles, Download } from "lucide-react"

const steps = [
  {
    icon: ClipboardPaste,
    number: "1",
    title: "Paste",
    description: "Dump your messy backlog items — one per line. Bullet points, Jira exports, random notes. We don't judge.",
  },
  {
    icon: Sparkles,
    number: "2",
    title: "Refine",
    description: "AI analyzes each item, adds problem statements, acceptance criteria, effort estimates, and priorities.",
  },
  {
    icon: Download,
    number: "3",
    title: "Export",
    description: "Copy as Markdown or download CSV. Ready for Jira, Linear, GitHub Issues, or wherever your team works.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-section-title font-space-grotesk mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three steps. Thirty seconds. Done.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <step.icon className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-6 text-muted-foreground/30 text-3xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
