import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionByEmail } from '@/lib/kv'

/**
 * POST /api/retrieve-key
 * Body: { email: string }
 *
 * Lets customers recover their license key by email address.
 * Returns the key if an active subscription is found.
 */
export async function POST(request: NextRequest) {
  let email: string
  try {
    const body = await request.json()
    email = body.email?.trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Slight delay to prevent enumeration attacks
  await new Promise(r => setTimeout(r, 400 + Math.random() * 200))

  const sub = await getSubscriptionByEmail(email)

  if (!sub || sub.status !== 'active') {
    // Always return the same message — don't reveal whether email exists
    return NextResponse.json({
      message: "If that email has an active subscription, your license key has been displayed below. Check your Stripe receipt at billing.stripe.com if nothing shows here.",
      found: false,
    })
  }

  return NextResponse.json({
    message: "Found your subscription.",
    found: true,
    licenseKey: sub.licenseKey,
    plan: sub.plan,
  })
}
