import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getFreeKey, setFreeKey } from '@/lib/kv'

function generateFreeKey(): string {
  const chars = randomBytes(9).toString('hex').toUpperCase().slice(0, 12)
  return `SK-FREE-${chars}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Idempotent: return existing free key if already issued
    const existing = await getFreeKey(normalizedEmail)
    if (existing) {
      return NextResponse.json({ licenseKey: existing, plan: 'free', isNew: false })
    }

    // Issue new free key
    const licenseKey = generateFreeKey()
    await setFreeKey(normalizedEmail, licenseKey)

    return NextResponse.json({ licenseKey, plan: 'free', isNew: true })
  } catch (error) {
    console.error('[issue-free-key] Error:', error)
    return NextResponse.json({ error: 'Failed to issue free key' }, { status: 500 })
  }
}
