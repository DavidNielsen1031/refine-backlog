import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

/**
 * Extracts the real client IP from an incoming request.
 *
 * On Vercel, the platform APPENDS the real client IP as the LAST entry in
 * x-forwarded-for. Clients can inject arbitrary values at the front of this
 * header, but they cannot spoof the value Vercel appends at the end.
 *
 * Using the first value (as commonly seen in old tutorials) allows attackers
 * to bypass IP-based rate limits by sending:
 *   x-forwarded-for: 1.2.3.4, 5.6.7.8, ...
 *
 * When no real IP is available (local dev, unusual proxies), falls back to
 * a privacy-safe fingerprint derived from request headers rather than 'unknown'.
 */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map(s => s.trim())
    return parts[parts.length - 1] || deriveFingerprint(request)
  }
  return request.headers.get('x-real-ip') || deriveFingerprint(request)
}

/**
 * Derive a stable but privacy-safe fingerprint from request headers.
 * Used as a fallback when no real IP is available.
 * Prefixed with 'fp:' so callers can distinguish fingerprints from real IPs.
 */
function deriveFingerprint(request: NextRequest): string {
  const ua = request.headers.get('user-agent') || ''
  const accept = request.headers.get('accept') || ''
  return 'fp:' + createHash('sha256').update(ua + accept).digest('hex').slice(0, 16)
}
