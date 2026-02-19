import { useEffect, useRef, RefObject } from 'react'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

interface CardSpotlightOptions {
  /** Spotlight radius in px (default: 200) */
  radius?: number
  /** Spotlight color (default: oklch primary) */
  color?: string
  /** Max opacity 0-1 (default: 0.08) */
  opacity?: number
  /** Also add border highlight (default: true) */
  borderGlow?: boolean
  disabled?: boolean
}

/**
 * Premium Card Spotlight Hook
 *
 * Adds a Stripe-style radial gradient spotlight that follows
 * the cursor across a card surface.
 *
 * Uses CSS custom properties for GPU compositing.
 * The actual gradient is rendered via CSS ::before pseudo-element
 * (see corresponding CSS in index.css).
 */
export function useCardSpotlight<T extends HTMLElement>(
  options: CardSpotlightOptions = {}
): RefObject<T | null> {
  const {
    radius = 200,
    color = 'oklch(0.45 0.15 250)',
    opacity = 0.08,
    borderGlow = true,
    disabled = false,
  } = options

  const elementRef = useRef<T>(null)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (disabled) return

    const element = elementRef.current
    if (!element) return
    if (shouldDisableCursorEffects()) return

    // Set initial CSS custom properties
    element.style.setProperty('--spotlight-radius', `${radius}px`)
    element.style.setProperty('--spotlight-color', color)
    element.style.setProperty('--spotlight-max-opacity', `${opacity}`)
    element.style.setProperty('--spotlight-opacity', '0')

    if (borderGlow) {
      element.dataset.spotlightBorder = 'true'
    }

    // Mark element for CSS targeting
    element.dataset.spotlight = 'true'

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameRef.current!)
      frameRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        element.style.setProperty('--spotlight-x', `${x}px`)
        element.style.setProperty('--spotlight-y', `${y}px`)
      })
    }

    const handleMouseEnter = () => {
      element.style.setProperty('--spotlight-opacity', '1')
    }

    const handleMouseLeave = () => {
      element.style.setProperty('--spotlight-opacity', '0')
    }

    element.addEventListener('mousemove', handleMouseMove, { passive: true })
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [radius, color, opacity, borderGlow, disabled])

  return elementRef
}
