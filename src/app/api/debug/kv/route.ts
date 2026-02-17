import { NextResponse } from 'next/server'
import { debugKvRoundTrip } from '@/lib/kv'

export async function GET() {
  const result = await debugKvRoundTrip()
  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
  })
}
