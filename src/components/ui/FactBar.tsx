import { useEffect, useState, useRef } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Fact {
  value: number
  suffix: string
  labelKey: string
}

const facts: Fact[] = [
  { value: 48, suffix: 'h', labelKey: 'facts.48h' },
  { value: 200, suffix: 'm²', labelKey: 'facts.200m' },
  { value: 3, suffix: '', labelKey: 'facts.3sectors' },
  { value: 100, suffix: '%', labelKey: 'facts.100pct' },
]

function AnimatedNumber({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value)
      return
    }
    const duration = 2000
    let startTime: number | null = null
    let rafId = 0

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayValue(Math.round(progress * value))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [isVisible, value])

  return <span>{displayValue}{suffix}</span>
}

export function FactBar() {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden bg-surface-deep text-primary-foreground py-10 sm:py-12">
      <div
        className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center lg:divide-x lg:divide-white/10">
          {facts.map((fact) => (
            <div key={fact.labelKey} className="lg:px-4">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                <AnimatedNumber value={fact.value} suffix={fact.suffix} isVisible={isVisible} />
              </p>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-on-deep-muted">{t(fact.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
