import { useEffect, useRef, useCallback } from 'react'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

/**
 * Premium Card Spotlight Effect
 *
 * Stripe/Linear-level spotlight that:
 * - Tracks mouse position relative to each card
 * - Creates radial gradient spotlight on card surface
 * - Uses CSS custom properties for GPU-accelerated rendering
 * - Only activates on [data-spotlight] elements or cards
 * - Completely decoupled from React render cycle for performance
 */
export function CursorGlow() {
  const frameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const activeElements = useRef<Set<HTMLElement>>(new Set())

  const updateSpotlight = useCallback(() => {
    const { x, y } = mouseRef.current

    activeElements.current.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const isInside =
        x >= rect.left - 80 &&
        x <= rect.right + 80 &&
        y >= rect.top - 80 &&
        y <= rect.bottom + 80

      if (isInside) {
        const relX = x - rect.left
        const relY = y - rect.top
        el.style.setProperty('--spotlight-x', `${relX}px`)
        el.style.setProperty('--spotlight-y', `${relY}px`)
        el.style.setProperty('--spotlight-opacity', '1')
      } else {
        el.style.setProperty('--spotlight-opacity', '0')
      }
    })
  }, [])

  useEffect(() => {
    if (shouldDisableCursorEffects()) return

    // Collect all spotlight-eligible elements
    const collectElements = () => {
      activeElements.current.clear()
      const elements = document.querySelectorAll<HTMLElement>(
        '[data-spotlight], [data-slot="card"], .spotlight-card'
      )
      elements.forEach((el) => activeElements.current.add(el))
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(updateSpotlight)
    }

    // Initial collection + MutationObserver for dynamic content
    collectElements()

    const observer = new MutationObserver(() => {
      collectElements()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [updateSpotlight])

  // This component renders nothing - it's a pure side-effect controller
  return null
}
