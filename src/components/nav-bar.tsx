"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_SECTIONS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Try it", href: "#try-it" },
  { label: "Scoring", href: "#scoring" },
  { label: "Pricing", href: "#pricing" },
]

const NAV_LINKS = [
  { label: "blog", href: "/blog" },
  { label: "docs", href: "/docs/enforce" },
  { label: "dashboard", href: "/dashboard" },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSectionClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-bold font-mono text-base tracking-tight hover:text-emerald-400 transition-colors"
        >
          speclint
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.href}
              onClick={() => handleSectionClick(s.href)}
              className="text-zinc-400 hover:text-white text-sm font-mono px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              {s.label}
            </button>
          ))}
          <div className="w-px h-5 bg-zinc-800 mx-2" />
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-400 hover:text-white text-sm font-mono px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="ml-2">
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4"
              onClick={() => (window.location.href = "/get-key")}
            >
              Get API Key
            </Button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-white p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 px-6 pb-4">
          <div className="flex flex-col gap-1">
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.href}
                onClick={() => handleSectionClick(s.href)}
                className="text-zinc-400 hover:text-white text-sm font-mono py-2 text-left"
              >
                {s.label}
              </button>
            ))}
            <div className="h-px bg-zinc-800 my-2" />
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-zinc-400 hover:text-white text-sm font-mono py-2"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs mt-2 w-fit"
              onClick={() => (window.location.href = "/get-key")}
            >
              Get API Key
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
