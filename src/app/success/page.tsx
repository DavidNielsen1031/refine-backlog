"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy, ArrowRight, Key, Loader2 } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [licenseEmail, setLicenseEmail] = useState<string | null>(null)
  const [licenseStatus, setLicenseStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const fetchLicenseKey = useCallback(async (attempt = 0) => {
    if (!sessionId) {
      setLicenseStatus('error')
      return
    }

    try {
      const res = await fetch(`/api/license?session_id=${encodeURIComponent(sessionId)}`)
      if (res.status === 202) {
        // Webhook hasn't fired yet — retry up to 5 times with 2s delay
        if (attempt < 5) {
          setTimeout(() => fetchLicenseKey(attempt + 1), 2000)
        } else {
          setLicenseStatus('error')
        }
        return
      }
      if (!res.ok) {
        setLicenseStatus('error')
        return
      }
      const data = await res.json()
      setLicenseKey(data.licenseKey)
      setLicenseEmail(data.email)
      setLicenseStatus('ready')
    } catch {
      setLicenseStatus('error')
    }
  }, [sessionId])

  useEffect(() => {
    fetchLicenseKey(0)
  }, [fetchLicenseKey])

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
            {licenseEmail ? `Subscription active for ${licenseEmail}.` : 'Your subscription is now active.'}
          </p>
        </div>

        {/* License Key Card */}
        <Card className="border-emerald-500/20 bg-emerald-50/5">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your License Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenseStatus === 'loading' && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your license key…
              </div>
            )}

            {licenseStatus === 'ready' && licenseKey && (
              <>
                <p className="text-sm text-muted-foreground">
                  Save this key — you&apos;ll need it to use the CLI and API without limits.
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted/50 border border-muted p-3 rounded-lg text-sm font-mono tracking-wide break-all">
                      {licenseKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 self-start mt-1"
                      onClick={() => handleCopy(licenseKey)}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" />
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

                {/* CLI quickstart */}
                <div className="bg-muted/30 p-4 rounded-lg border border-muted space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Quick start — CLI</h4>
                  <code className="block text-xs font-mono text-emerald-400 break-all">
                    npx refine-backlog-cli --key {licenseKey} &quot;Fix login bug&quot; &quot;Add dark mode&quot;
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Or set <code className="font-mono">REFINE_BACKLOG_KEY={licenseKey}</code> in your environment and drop the flag.
                  </p>
                </div>

                {/* API quickstart */}
                <div className="bg-muted/30 p-4 rounded-lg border border-muted space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Quick start — API</h4>
                  <code className="block text-xs font-mono text-muted-foreground break-all whitespace-pre-wrap">{`curl -X POST https://refinebacklog.com/api/refine \\
  -H "Content-Type: application/json" \\
  -H "x-license-key: ${licenseKey}" \\
  -d '{"items":["Fix login bug"]}'`}</code>
                </div>
              </>
            )}

            {licenseStatus === 'error' && (
              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-400 mb-2">Key still processing</h4>
                <p className="text-sm text-muted-foreground">
                  Your subscription is confirmed. Email{' '}
                  <a href="mailto:refinebacklog@gmail.com?subject=License%20Key%20Request" className="text-emerald-400 hover:underline">
                    refinebacklog@gmail.com
                  </a>{' '}
                  with your order and we&apos;ll send your key within minutes.
                </p>
              </div>
            )}
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
            <Link href="mailto:refinebacklog@gmail.com?subject=Refine%20Backlog%20Pro%20Support">
              Get Help &amp; Support
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Lost your key?{" "}
            <Link href="/get-key" className="text-emerald-400 hover:underline">
              Retrieve it anytime at /get-key
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Email{" "}
            <a
              href="mailto:refinebacklog@gmail.com"
              className="text-emerald-400 hover:underline"
            >
              refinebacklog@gmail.com
            </a>
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
