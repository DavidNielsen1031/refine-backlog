import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionByCustomer } from '@/lib/kv'

/**
 * GET /api/license?session_id=cs_xxx
 *
 * Returns the license key for a completed Stripe checkout session.
 * Called by the success page to display the key to the customer.
 * Returns 202 if the webhook hasn't fired yet (caller should retry).
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  try {
    // Retrieve the Stripe checkout session
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[LICENSE] Stripe session lookup failed:', err)
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const session = await res.json()
    const customerId = session.customer as string | null

    if (!customerId) {
      // Webhook hasn't fired yet — tell the client to retry
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    // Look up the license key from KV
    const sub = await getSubscriptionByCustomer(customerId)

    if (!sub || !sub.licenseKey) {
      // Webhook fired but no license yet — still processing
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    return NextResponse.json({
      licenseKey: sub.licenseKey,
      plan: sub.plan,
      email: session.customer_details?.email ?? null,
    })
  } catch (error) {
    console.error('[LICENSE] Error retrieving license key:', error)
    return NextResponse.json({ error: 'Failed to retrieve license key' }, { status: 500 })
  }
}
