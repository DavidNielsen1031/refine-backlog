import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomBytes } from 'crypto'
import { setSubscription, cancelSubscriptionByCustomer, getSubscriptionByCustomer } from '@/lib/kv'
import { sendLicenseEmail, PLAN_DETAILS, VALID_PLANS } from '@/lib/email'
import type { PaidPlan } from '@/lib/email'

function maskKey(key: string): string {
  if (key.length <= 10) return key.slice(0, 2) + '...' + key.slice(-4)
  return key.slice(0, 6) + '...' + key.slice(-4)
}

function validatePlan(raw: unknown): PaidPlan {
  if (typeof raw === 'string' && VALID_PLANS.includes(raw as PaidPlan)) {
    return raw as PaidPlan
  }
  console.warn(`[WEBHOOK] Unknown plan "${raw}", defaulting to pro`)
  return 'pro'
}

/** Maps Stripe price IDs (from env vars) → plan names */
function buildPriceToplan(): Record<string, PaidPlan> {
  const map: Record<string, PaidPlan> = {}
  if (process.env.STRIPE_LITE_PRICE_ID) map[process.env.STRIPE_LITE_PRICE_ID] = 'lite'
  if (process.env.STRIPE_PRO_PRICE_ID)  map[process.env.STRIPE_PRO_PRICE_ID]  = 'pro'
  if (process.env.STRIPE_TEAM_PRICE_ID) map[process.env.STRIPE_TEAM_PRICE_ID] = 'team'
  return map
}

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

async function notifyDiscord(message: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN
  const channelId = process.env.DISCORD_RB_CHANNEL_ID || '1477742404244209786' // #speclint-notifications
  if (!token) return
  try {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://openclaw.ai, 1.0)',
      },
      body: JSON.stringify({ content: message }),
    })
  } catch {
    // Non-blocking
  }
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = randomBytes(32)
  const raw = Array.from(bytes, b => chars[b % chars.length]).join('')
  return raw.replace(/(.{4})/g, '$1-').slice(0, -1)
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
          const plan = validatePlan(session.metadata?.plan)

          // Idempotency check — license/route.ts may have already created a key on fast path
          const existing = await getSubscriptionByCustomer(customerId)
          if (existing?.licenseKey) {
            console.log(`[WEBHOOK] key already exists for customer ${customerId}, skipping`)
            break
          }

          const licenseKey = generateLicenseKey()

          try {
            await setSubscription(customerId, {
              plan,
              status: 'active',
              email: session.customer_details?.email || undefined,
              licenseKey,
              subscriptionId: session.subscription as string,
            })
            console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=success licenseKey=${maskKey(licenseKey)}`)

            // 📧 Email license key to customer via Resend (fire and forget)
            const email = session.customer_details?.email ?? 'unknown'
            if (email !== 'unknown') {
              sendLicenseEmail({ to: email, plan, licenseKey }).catch(() => {})
            }

            // 💰 Notify David on Telegram + Discord (fire and forget)
            const planLabel = `${PLAN_DETAILS[plan].label} ${PLAN_DETAILS[plan].price.replace('month', 'mo')}`
            const telegramMsg =
              `💰 <b>New Speclint subscriber!</b>\n\n` +
              `📧 ${email}\n` +
              `📦 ${planLabel}\n` +
              `🔑 ${licenseKey}\n` +
              `👤 ${customerId}`
            const discordMsg =
              `💰 **New Speclint subscriber!**\n\n` +
              `📧 ${email}\n` +
              `📦 ${planLabel}\n` +
              `🔑 \`${licenseKey}\`\n` +
              `👤 ${customerId}`
            notifyTelegram(telegramMsg).catch(() => {})
            notifyDiscord(discordMsg).catch(() => {})

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
            // Fix 4: treat past_due and trialing as active (grace period)
            const activeStatuses = ['active', 'past_due', 'trialing']
            const newStatus = activeStatuses.includes(subscription.status) ? 'active' : 'canceled'
            existing.status = newStatus as 'active' | 'canceled'

            // Fix 1: detect plan change from the subscription's price ID
            const priceId = subscription.items?.data?.[0]?.price?.id
            const priceToplan = buildPriceToplan()
            if (priceId && priceToplan[priceId]) {
              const newPlan = priceToplan[priceId]
              if (existing.plan !== newPlan) {
                console.log(`[WEBHOOK] event=${eventType} customer=${customerId} plan_change=${existing.plan}->${newPlan}`)
                existing.plan = newPlan
              }
            } else if (priceId) {
              console.warn(`[WEBHOOK] event=${eventType} customer=${customerId} unknown_price_id=${priceId} — plan unchanged`)
            }

            await setSubscription(customerId, existing)
            console.log(`[WEBHOOK] event=${eventType} customer=${customerId} result=success status=${newStatus} plan=${existing.plan}`)
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
