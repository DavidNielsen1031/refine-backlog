"use client"

import { Users } from "lucide-react"

export function SocialProofSection() {
  return (
    <section className="py-12 border-y border-border/30 bg-card/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">
            Built for Product Owners and Scrum Masters who run refinement sessions
          </span>
        </div>
      </div>
    </section>
  )
}
