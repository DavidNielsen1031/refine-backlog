// /api/lint — canonical Speclint endpoint
// /api/refine is kept as a backward-compatible alias
// We wrap instead of re-export so that request.nextUrl.pathname reflects 'lint' in telemetry
import { POST as refineHandler, GET } from '@/app/api/refine/route'
import { NextRequest } from 'next/server'

export { GET }

export async function POST(request: NextRequest) {
  // Tag the request so the refine handler records endpoint='lint' in telemetry
  const headers = new Headers(request.headers)
  headers.set('x-forwarded-endpoint', 'lint')
  return refineHandler(new NextRequest(request, { headers }))
}
