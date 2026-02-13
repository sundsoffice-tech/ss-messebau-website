import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

/**
 * Cursor Scale Effect
 * Scales interactive elements slightly when the cursor hovers over them
 */
export function useCursorScale() {
  useEffect(() => {
    // Check for mobile and reduced motion
    if (shouldDisableCursorEffects()) return

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.matches('button:not([disabled]), a, [role="button"]')) {
        target.style.transform = 'scale(1.05)'
        target.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.matches('button:not([disabled]), a, [role="button"]')) {
        target.style.transform = ''
        target.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }

    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])
}

/**
 * Cursor Ripple Effect
 * Creates a ripple effect on click
 */
export function CursorRipple() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const rippleIdRef = useRef(0)

  useEffect(() => {
    // Check for mobile and reduced motion
    if (shouldDisableCursorEffects()) return

    const handleClick = (e: MouseEvent) => {
      const newRipple = { x: e.clientX, y: e.clientY, id: rippleIdRef.current++ }
      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 800)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <>
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="fixed pointer-events-none z-[9996] rounded-full border-2 border-white"
          style={{
            left: ripple.x,
            top: ripple.y,
            translateX: '-50%',
            translateY: '-50%',
            mixBlendMode: 'difference',
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: 100, height: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}
