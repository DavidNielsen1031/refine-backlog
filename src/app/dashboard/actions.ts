'use server'

import { cookies } from 'next/headers'
import { getLicenseData } from '@/lib/kv'

const COOKIE_NAME = 'sl-dashboard-key'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface AuthResult {
  success: boolean
  tier?: string
  error?: string
}

export async function submitLicenseKey(formData: FormData): Promise<AuthResult> {
  const key = (formData.get('licenseKey') as string | null)?.trim()

  if (!key) {
    return { success: false, error: 'Please enter a license key.' }
  }

  const licenseData = await getLicenseData(key)

  if (!licenseData) {
    return { success: false, error: 'Invalid license key. Check your key and try again.' }
  }

  if (licenseData.status !== 'active') {
    return { success: false, error: 'Your subscription is no longer active.' }
  }

  if (licenseData.plan !== 'pro' && licenseData.plan !== 'team') {
    return {
      success: false,
      error: 'Dashboard access requires a Pro or Team plan. Upgrade at speclint.ai/pricing.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/dashboard',
  })

  return { success: true, tier: licenseData.plan }
}

export async function clearDashboardSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
