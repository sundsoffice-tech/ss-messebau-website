import { useEffect, useState, useRef } from 'react'

interface Fact {
  value: number
  suffix: string
  label: string
}

const facts: Fact[] = [
  { value: 500, suffix: '+', label: 'Projekte' },
  { value: 15, suffix: '+', label: 'Jahre Erfahrung' },
  { value: 50, suffix: '+', label: 'Messen bundesweit' },
  { value: 98, suffix: '%', label: 'Termintreu' },
]

function AnimatedNumber({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    const duration = 2000
    let startTime: number | null = null
    let rafId: number

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
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-primary text-primary-foreground py-8 sm:py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {facts.map((fact) => (
            <div key={fact.label}>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                <AnimatedNumber value={fact.value} suffix={fact.suffix} isVisible={isVisible} />
              </p>
              <p className="text-xs sm:text-sm opacity-80">{fact.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
