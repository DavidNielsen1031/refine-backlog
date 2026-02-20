// Legacy endpoint — redirects to /api/refine for backward compatibility.
// Do not add logic here. All implementation lives in /api/refine/route.ts.
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/api/refine'
  return NextResponse.redirect(url, { status: 307 }) // 307 preserves POST body + method
}

export async function GET() {
  return NextResponse.redirect('https://refinebacklog.com/api/refine', { status: 301 })
}
