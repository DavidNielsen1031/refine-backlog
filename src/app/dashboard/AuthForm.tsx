'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitLicenseKey } from './actions'

export function AuthForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await submitLicenseKey(formData)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error ?? 'Something went wrong.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="font-mono font-bold text-white text-2xl hover:text-emerald-400 transition-colors">
            speclint
          </a>
          <p className="text-zinc-400 mt-2 text-sm font-mono">dashboard</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h1 className="text-xl font-bold text-white mb-2">Enter your license key</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Dashboard access is available on Pro and Team plans.{' '}
            <a href="/pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Upgrade →
            </a>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-mono text-zinc-300 mb-2">
                License Key
              </label>
              <input
                id="licenseKey"
                name="licenseKey"
                type="text"
                placeholder="sk-..."
                required
                autoComplete="off"
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold py-3 rounded-lg transition-colors font-mono text-sm"
            >
              {isPending ? 'Verifying…' : 'Open Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6 font-mono">
          Don&apos;t have a key?{' '}
          <a href="/get-key" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            Get one free →
          </a>
        </p>
      </div>
    </div>
  )
}
