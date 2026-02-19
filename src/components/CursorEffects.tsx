import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

/**
 * Premium Hover Scale Effect
 *
 * Adds subtle scale + lift to interactive elements on hover.
 * Uses CSS transforms directly for maximum performance.
 * Includes proper transition curves matching Apple HIG.
 */
export function useCursorScale() {
  useEffect(() => {
    if (shouldDisableCursorEffects()) return

    const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)' // Apple-style ease
    const handleMouseEnter = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('button:not([disabled]), [role="button"]:not([aria-disabled="true"])') as HTMLElement | null
      if (!target || target.dataset.noScale) return
      target.style.transition = `transform 0.4s ${EASE}`
      target.style.transform = 'scale(1.02) translateY(-1px)'
    }

    const handleMouseLeave = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('button:not([disabled]), [role="button"]:not([aria-disabled="true"])') as HTMLElement | null
      if (!target || target.dataset.noScale) return
      target.style.transition = `transform 0.5s ${EASE}`
      target.style.transform = ''
    }

    const handleMouseDown = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('button:not([disabled]), [role="button"]:not([aria-disabled="true"])') as HTMLElement | null
      if (!target || target.dataset.noScale) return
      target.style.transition = `transform 0.15s ${EASE}`
      target.style.transform = 'scale(0.97)'
    }

    const handleMouseUp = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('button:not([disabled]), [role="button"]:not([aria-disabled="true"])') as HTMLElement | null
      if (!target || target.dataset.noScale) return
      target.style.transition = `transform 0.5s ${EASE}`
      target.style.transform = 'scale(1.02) translateY(-1px)'
    }

    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mouseup', handleMouseUp, true)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
    }
  }, [])
}

interface Ripple {
  x: number
  y: number
  id: number
}

/**
 * Premium Click Ripple
 *
 * Minimal, refined click feedback:
 * - Radial gradient pulse (not just a border ring)
 * - Starts from exact click position
 * - Fast expansion with graceful fade
 * - Only triggers on interactive elements
 */
export function CursorRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const idRef = useRef(0)

  const handleClick = useCallback((e: MouseEvent) => {
    if (shouldDisableCursorEffects()) return

    const target = e.target as HTMLElement
    const interactive = target.closest('button:not([disabled]), a[href], [role="button"]')
    if (!interactive) return

    const id = idRef.current++
    setRipples((prev) => [...prev, { x: e.clientX, y: e.clientY, id }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)
  }, [])

  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <AnimatePresence>
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed pointer-events-none z-[9996] rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            translateX: '-50%',
            translateY: '-50%',
            mixBlendMode: 'difference',
          }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 80, height: 80, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

/**
 * Premium 3D Tilt Effect for Cards
 *
 * Adds perspective-based tilt on hover for card elements.
 * Controlled via [data-tilt] attribute or .tilt-card class.
 * Uses vanilla JS for performance (no React re-renders).
 */
export function useCardTilt() {
  useEffect(() => {
    if (shouldDisableCursorEffects()) return

    const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
    const MAX_TILT = 4 // degrees - subtle
    const PERSPECTIVE = 800

    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tilt], .tilt-card') as HTMLElement | null
      if (!target) return

      const rect = target.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      const rotateX = -y * MAX_TILT
      const rotateY = x * MAX_TILT

      target.style.transition = `transform 0.1s linear`
      target.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
    }

    const handleMouseLeave = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('[data-tilt], .tilt-card') as HTMLElement | null
      if (!target) return

      target.style.transition = `transform 0.6s ${EASE}`
      target.style.transform = ''
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true } as EventListenerOptions)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])
}
