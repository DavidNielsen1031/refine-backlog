"use client"

import { Users } from "lucide-react"

export function SocialProofSection() {
  return (
    <section className="py-12 border-y border-border/30 bg-card/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">
              Trusted by product managers at startups and Fortune 500s
            </span>
          </div>
          <div className="flex items-center gap-8 opacity-50">
            {["Agile Teams", "Scrum Masters", "Product Owners", "Engineering Leads"].map((role) => (
              <span key={role} className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
