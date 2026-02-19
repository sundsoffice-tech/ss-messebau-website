import { useEffect, useRef, RefObject } from 'react'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

interface MagneticCursorOptions {
  /** Pull strength 0-1 (default: 0.35) */
  strength?: number
  /** Activation radius in px (default: 120) */
  radius?: number
  /** Also shift inner content toward cursor (default: true) */
  shiftContent?: boolean
  /** Content shift multiplier (default: 0.5) */
  contentShift?: number
  disabled?: boolean
}

/**
 * Premium Magnetic Cursor Hook
 *
 * Makes elements subtly pull toward the cursor when nearby.
 * Stripe/Vercel-level implementation:
 * - Smooth exponential easing (not linear interpolation)
 * - Optional content shift (text/icons follow cursor within element)
 * - Continuous rAF loop only while cursor is in radius
 * - Graceful spring-back on exit with overshoot
 */
export function useMagneticCursor<T extends HTMLElement>(
  options: MagneticCursorOptions = {}
): RefObject<T | null> {
  const {
    strength = 0.35,
    radius = 120,
    shiftContent = true,
    contentShift = 0.5,
    disabled = false,
  } = options

  const elementRef = useRef<T>(null)
  const frameRef = useRef<number | undefined>(undefined)
  const stateRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
    isReturning: false,
  })

  useEffect(() => {
    if (disabled) return

    const element = elementRef.current
    if (!element) return
    if (shouldDisableCursorEffects()) return

    const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
    const LERP_SPEED = 0.12
    const RETURN_SPEED = 0.08

    const contentEl = element.firstElementChild as HTMLElement | null

    const animate = () => {
      const s = stateRef.current
      const speed = s.isReturning ? RETURN_SPEED : LERP_SPEED

      // Exponential easing
      s.currentX += (s.targetX - s.currentX) * speed
      s.currentY += (s.targetY - s.currentY) * speed

      element.style.transform = `translate(${s.currentX}px, ${s.currentY}px)`

      // Content shift (inner element moves more for parallax feel)
      if (shiftContent && contentEl) {
        const cx = s.currentX * contentShift
        const cy = s.currentY * contentShift
        contentEl.style.transform = `translate(${cx}px, ${cy}px)`
      }

      const delta = Math.abs(s.targetX - s.currentX) + Math.abs(s.targetY - s.currentY)

      if (delta > 0.05) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        // Snap to final position
        if (!s.isActive) {
          element.style.transform = ''
          if (shiftContent && contentEl) {
            contentEl.style.transform = ''
          }
        }
        frameRef.current = undefined
      }
    }

    const startAnimation = () => {
      if (frameRef.current === undefined) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < radius) {
        // Smooth falloff: stronger pull closer to center
        const factor = Math.pow(1 - distance / radius, 1.5) * strength
        stateRef.current.targetX = distanceX * factor
        stateRef.current.targetY = distanceY * factor
        stateRef.current.isActive = true
        stateRef.current.isReturning = false

        // Add hover styling
        element.style.transition = 'none'
        startAnimation()
      } else if (stateRef.current.isActive) {
        // Exit radius - begin spring-back
        stateRef.current.targetX = 0
        stateRef.current.targetY = 0
        stateRef.current.isActive = false
        stateRef.current.isReturning = true
        startAnimation()
      }
    }

    const handleMouseLeave = () => {
      stateRef.current.targetX = 0
      stateRef.current.targetY = 0
      stateRef.current.isActive = false
      stateRef.current.isReturning = true
      element.style.transition = `transform 0.6s ${EASE}`
      startAnimation()
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current)
      }
      element.style.transform = ''
      if (shiftContent && contentEl) {
        contentEl.style.transform = ''
      }
    }
  }, [strength, radius, shiftContent, contentShift, disabled])

  return elementRef
}
