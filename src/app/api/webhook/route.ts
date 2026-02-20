import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { setSubscription, cancelSubscriptionByCustomer, getSubscriptionByCustomer } from '@/lib/kv'

async function notifyTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || '1656378684'
  if (!token) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
  } catch {
    // Non-blocking — never let notification failure affect webhook response
  }
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result.replace(/(.{4})/g, '$1-').slice(0, -1)
}

export async function POST(request: NextRequest) {
  // Check STRIPE_SECRET_KEY first
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[WEBHOOK] STRIPE_SECRET_KEY is not configured')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!endpointSecret || endpointSecret === 'whsec_placeholder') {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured — rejecting request. Signature verification is mandatory.')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let stripe: Stripe
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  } catch (err) {
    console.error('[WEBHOOK] Failed to initialize Stripe SDK:', err)
    return NextResponse.json({ error: 'Stripe initialization failed' }, { status: 500 })
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('[WEBHOOK] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = event.type
  let customerId = 'unknown'

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        customerId = (session.customer as string) || 'unknown'

        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const plan = (session.metadata?.plan as 'pro' | 'team') || 'pro'
          const licenseKey = generateLicenseKey()

          try {
            await setSubscription(customerId, {
              plan,
              status: 'active',
              email: session.customer_details?.email || undefined,
              licenseKey,
              subscriptionId: session.subscription as string,
            })
            console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=success licenseKey=${licenseKey}`)

            // 💰 Notify David on Telegram (fire and forget)
            const email = session.customer_details?.email ?? 'unknown'
            const planLabel = plan === 'team' ? 'Team $29/mo' : 'Pro $9/mo'
            notifyTelegram(
              `💰 <b>New Refine Backlog subscriber!</b>\n\n` +
              `📧 ${email}\n` +
              `📦 ${planLabel}\n` +
              `🔑 ${licenseKey}\n` +
              `👤 ${customerId}`
            ).catch(() => {})

          } catch (kvErr) {
            console.error(`[WEBHOOK] event=${eventType} customer=${customerId} result=fail kvError=`, kvErr)
            // Still return 200 to Stripe
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        customerId = subscription.customer as string

        try {
          const existing = await getSubscriptionByCustomer(customerId)
          if (existing) {
            const newStatus = subscription.status === 'active' ? 'active' : 'canceled'
            existing.status = newStatus as 'active' | 'canceled'
            await setSubscription(customerId, existing)
            console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=success status=${newStatus}`)
          } else {
            console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=skip reason=no_existing_subscription`)
          }
        } catch (kvErr) {
          console.error(`[WEBHOOK] event=${eventType} customer=${customerId} result=fail kvError=`, kvErr)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        customerId = subscription.customer as string
        try {
          await cancelSubscriptionByCustomer(customerId)
          console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=success`)
        } catch (kvErr) {
          console.error(`[WEBHOOK] event=${eventType} customer=${customerId} result=fail kvError=`, kvErr)
        }
        break
      }

      default:
        console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=unhandled`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`[WEBHOOK] event=${eventType} customer=${customerId} result=fail error=`, error)
    // Always return 200 to Stripe to prevent retry loops
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Webhook Endpoint',
    events: ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted']
  })
}
