"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

const beforeItems = [
  "fix bug with login",
  "new feature for dashboard",
  "update documentation",
  "performance improvements",
  "mobile responsive design",
]

const afterItems = [
  {
    title: "Fix Session Timeout Authentication Bug",
    problem: "Users are getting logged out mid-session due to token expiration mishandling, causing data loss and support tickets.",
    acceptanceCriteria: [
      "User stays logged in for full session duration (8 hours)",
      "Token refresh happens silently without page reload",
      "Failed refresh redirects to login with saved state",
    ],
    estimate: "M" as const,
    priority: "HIGH",
    tags: ["bug", "auth", "critical"],
    assumptions: ["Confirm whether token refresh applies to all auth methods or OAuth only"],
  },
  {
    title: "Implement Dashboard Analytics Overview",
    problem: "Users lack visibility into usage patterns and key metrics, reducing engagement and making it hard to demonstrate ROI.",
    acceptanceCriteria: [
      "Dashboard shows daily/weekly/monthly active users chart",
      "Key metrics load in under 2 seconds",
      "Data is filterable by date range",
    ],
    estimate: "L" as const,
    priority: "MEDIUM",
    tags: ["feature", "analytics", "ux"],
    assumptions: [] as string[],
  },
  {
    title: "Update REST API Documentation",
    problem: "Outdated API docs are causing integration delays and increasing support burden from developer customers.",
    acceptanceCriteria: [
      "All endpoints documented with request/response examples",
      "Authentication flow documented with code samples",
      "OpenAPI spec file is auto-generated and published",
    ],
    estimate: "S" as const,
    priority: "MEDIUM",
    tags: ["docs", "developer-experience"],
    assumptions: [] as string[],
  },
]

const getPriorityColor = (priority: string) => {
  if (priority === "HIGH") return "bg-red-500/10 text-red-400 border-red-500/20"
  if (priority === "MEDIUM") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  return "bg-blue-500/10 text-blue-400 border-blue-500/20"
}

const getEstimateColor = (est: string) => {
  const colors: Record<string, string> = {
    XS: "bg-green-500/10 text-green-400 border-green-500/20",
    S: "bg-green-500/10 text-green-400 border-green-500/20",
    M: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    L: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    XL: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return colors[est] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
}

export function ExampleSection() {
  return (
    <section id="example" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-section-title font-space-grotesk mb-4">
            See the Transformation
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how AI turns vague todos into actionable, sprint-ready stories
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Before */}
          <Card className="border-border/50 bg-card/30 backdrop-blur">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <CardTitle className="text-xl text-red-400">Before: Messy Input</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                {beforeItems.map((item, i) => (
                  <div key={i} className="text-muted-foreground py-1">- {item}</div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Problems with this backlog:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="destructive" className="text-xs">Vague titles</Badge>
                  <Badge variant="destructive" className="text-xs">No priorities</Badge>
                  <Badge variant="destructive" className="text-xs">No acceptance criteria</Badge>
                  <Badge variant="destructive" className="text-xs">No estimates</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* After */}
          <Card className="border-emerald-accent/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-xl text-emerald-400">After: Clean & Actionable</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {afterItems.map((item, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border/30">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge className={getPriorityColor(item.priority)}>
                          Priority: {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
                        </Badge>
                        <Badge className={getEstimateColor(item.estimate)}>
                          Effort: {item.estimate}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.problem}</p>
                    <div className="mb-2">
                      <ul className="space-y-0.5">
                        {item.acceptanceCriteria.slice(0, 2).map((ac, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {ac}
                          </li>
                        ))}
                        {item.acceptanceCriteria.length > 2 && (
                          <li className="text-xs text-muted-foreground/60">+{item.acceptanceCriteria.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    {item.assumptions && item.assumptions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <span className="text-xs font-medium text-muted-foreground/70">Needs clarification:</span>
                        <ul className="mt-1 space-y-0.5">
                          {item.assumptions.map((assumption: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground/60 flex items-start gap-1.5">
                              <span className="text-yellow-400/60 mt-0.5">?</span>
                              {assumption}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Now you have:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Clear titles</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Problem statements</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Acceptance criteria</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Size estimates</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Ready for import into <span className="text-emerald-400 font-semibold">Jira</span>, <span className="text-emerald-400 font-semibold">Linear</span>, <span className="text-emerald-400 font-semibold">GitHub Issues</span>, or any project management tool
          </p>
        </div>
      </div>
    </section>
  )
}
