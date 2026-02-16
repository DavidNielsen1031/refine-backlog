"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/config/site"
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react"

export function ExampleSection() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'P1': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'P2': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'S': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'M': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'L': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <section id="example" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-section-title font-space-grotesk mb-4">
            See the Transformation
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how AI turns vague todos into actionable, prioritized work items
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
                <div className="whitespace-pre-line text-muted-foreground">
                  {siteConfig.example.before}
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Problems with this backlog:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="destructive" className="text-xs">Vague titles</Badge>
                  <Badge variant="destructive" className="text-xs">No priorities</Badge>
                  <Badge variant="destructive" className="text-xs">Missing context</Badge>
                  <Badge variant="destructive" className="text-xs">No effort estimates</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="hidden lg:flex justify-center items-center">
            <ArrowRight className="h-8 w-8 text-emerald-accent" />
          </div>

          {/* After */}
          <Card className="border-emerald-accent/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-xl text-emerald-400">After: Clean & Prioritized</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteConfig.example.after.map((item, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border/30">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <div className="flex gap-1">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge className={getEffortColor(item.effort)}>
                          {item.effort}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.problem}</p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <span className="text-muted-foreground">Deps: {item.dependencies}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Now you have:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Clear titles</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Problem statements</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Priorities set</Badge>
                  <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-400">Effort estimated</Badge>
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