"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const session = searchParams.get('session_id')
    setSessionId(session)
  }, [searchParams])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-emerald-500/10 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Refine Backlog Pro! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Your subscription is now active. Here's what happens next.
          </p>
        </div>

        {/* License Key Card */}
        <Card className="border-emerald-500/20 bg-emerald-50/5">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Your License Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your license key has been generated and will be sent to your email shortly. 
              You can also retrieve it anytime from your account.
            </p>
            
            {sessionId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Session ID (for reference):
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-muted/50 p-2 rounded text-sm font-mono">
                    {sessionId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(sessionId)}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">📧 Check Your Email</h4>
              <p className="text-sm text-muted-foreground">
                We've sent your license key and setup instructions to your email address. 
                If you don't see it in a few minutes, check your spam folder.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card>
          <CardHeader>
            <CardTitle>What's Included in Your Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-emerald-400">✨ Pro Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 100 items per refinement session</li>
                  <li>• Unlimited sessions per month</li>
                  <li>• Priority AI processing</li>
                  <li>• Export to Jira/Linear CSV</li>
                  <li>• Email support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400">🚀 Coming Soon</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Direct Jira integration</li>
                  <li>• Custom refinement templates</li>
                  <li>• Team collaboration features</li>
                  <li>• Advanced analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600">
            <Link href="/#refiner">
              <ArrowRight className="mr-2 h-4 w-4" />
              Start Refining Backlogs
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" asChild>
            <Link href="mailto:david@perpetualagility.com?subject=Refine%20Backlog%20Pro%20Support">
              Get Help & Support
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need help? Email{" "}
            <a 
              href="mailto:david@perpetualagility.com" 
              className="text-emerald-400 hover:underline"
            >
              david@perpetualagility.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Session ID: {sessionId || "Loading..."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}