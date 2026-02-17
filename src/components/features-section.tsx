import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/config/site"
import { Zap, Target, Download, Shield, Clock, Users } from "lucide-react"

const iconMap = {
  Zap,
  Target, 
  Download,
  Shield,
  Clock,
  Users
}

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-section-title font-space-grotesk mb-4">
            Why Choose Refine Backlog?
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop wasting hours in refinement meetings. Get your backlog cleaned and prioritized in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap]
            
            return (
              <Card 
                key={index} 
                className="border-border/50 bg-card/30 backdrop-blur hover:bg-card/50 transition-all duration-300 group"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Built for the weekly grind */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-emerald-400">Consistent Quality</div>
            <div className="text-sm text-muted-foreground">Same structured format every sprint, every time.</div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-emerald-400">Ready in Seconds</div>
            <div className="text-sm text-muted-foreground">Paste 5–50 items, get results before your coffee cools.</div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-emerald-400">Your Starting Point</div>
            <div className="text-sm text-muted-foreground">AI drafts. Your team reviews and decides.</div>
          </div>
        </div>
      </div>
    </section>
  )
}