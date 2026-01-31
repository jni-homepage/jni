'use client'

import { useEffect, useRef, useState } from 'react'

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

interface CountUpNumberProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  className?: string
}

export default function CountUpNumber({
  end,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
  className = '',
}: CountUpNumberProps) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start: number | null = null

          const animate = (timestamp: number) => {
            if (!start) start = timestamp
            const elapsed = timestamp - start
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOutQuart(progress)
            const current = easedProgress * end

            const formatted = decimals > 0
              ? current.toFixed(decimals)
              : Math.floor(current).toString()

            setDisplay(`${prefix}${formatted}${suffix}`)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [end, suffix, prefix, duration, decimals])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
