"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

export function ScrollReveal({
  children,
  className,
  delay,
}: {
  children: React.ReactNode
  className?: string
  delay?: 1 | 2 | 3 | 4
}) {
  const { ref, isVisible } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal",
        isVisible && "is-visible",
        delay && `scroll-reveal-delay-${delay}`,
        className
      )}
    >
      {children}
    </div>
  )
}
