// /api/lint — canonical Speclint endpoint
// /api/refine is kept as a backward-compatible alias
import { POST as refineHandler, GET } from '@/app/api/refine/route'
import { NextRequest, NextResponse } from 'next/server'
import { corsOptions } from '@/lib/cors'

export { GET }

export { corsOptions as OPTIONS }

export async function POST(request: NextRequest) {
  // Content-Type guard
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 })
  }

  // Read body first (stream can only be consumed once), then reconstruct request
  // with x-forwarded-endpoint so telemetry records 'lint' not 'refine'
  const body = await request.text()
  const headers = new Headers(request.headers)
  headers.set('x-forwarded-endpoint', 'lint')
  const newReq = new NextRequest(new URL(request.url), {
    method: 'POST',
    headers,
    body,
  })
  const response = await refineHandler(newReq)

  // Add CORS headers to the response
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-License-Key')
  return newResponse
}
