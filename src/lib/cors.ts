/**
 * Shared CORS helpers for API routes.
 * All public API routes should use these to support preflight + cross-origin access.
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-License-Key',
  'Access-Control-Max-Age': '86400',
} as const

/**
 * Returns a 204 No Content response with CORS preflight headers.
 * Export this from every API route as `OPTIONS`.
 */
export function corsOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

/**
 * Add CORS headers to an existing Headers object (mutates).
 */
export function addCorsHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value)
  }
}
