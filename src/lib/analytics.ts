/**
 * Client-side analytics for Speclint conversion funnel.
 * Tracks: page_view → spec_tested → pricing_cta_clicked → checkout_initiated → checkout_success
 *
 * All events POST to /api/events (fire-and-forget, never throws).
 */

export type FunnelEvent =
  | 'page_view'
  | 'spec_tested'
  | 'pricing_cta_clicked'
  | 'checkout_initiated'
  | 'checkout_success'

export interface FunnelProperties {
  page?: string
  plan?: string
  score?: number
  agent_ready?: boolean
  session_id?: string
  [key: string]: unknown
}

/**
 * Track a funnel event. Fire-and-forget — never throws, never blocks the UI.
 */
export function track(event: FunnelEvent, properties?: FunnelProperties): void {
  if (typeof window === 'undefined') return // SSR guard

  const payload = {
    event,
    properties: {
      page: window.location.pathname,
      referrer: document.referrer || undefined,
      ...properties,
    },
    timestamp: new Date().toISOString(),
  }

  // Best-effort POST — if it fails, we silently ignore
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // keepalive so it survives page navigation
    keepalive: true,
  }).catch(() => {
    // Intentionally silent — analytics must never break the product
  })
}

/**
 * Convenience: track a page view. Call in a useEffect on mount.
 */
export function trackPageView(page?: string): void {
  track('page_view', { page: page ?? (typeof window !== 'undefined' ? window.location.pathname : '/') })
}
