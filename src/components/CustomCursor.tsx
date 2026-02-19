import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { isMobileDevice, prefersReducedMotion } from '../lib/cursor-utils'

type CursorState = 'default' | 'link' | 'button' | 'text' | 'media'

interface CursorProps {
  isVisible?: boolean
}

/**
 * Premium Custom Cursor
 *
 * Apple/Stripe-level cursor with:
 * - Velocity-aware morphing (stretches in movement direction)
 * - Smooth spring physics with differentiated inner/outer lag
 * - Context-aware state changes (default, link, button, text, media)
 * - Satisfying click compression with elastic release
 * - Subtle opacity modulation based on velocity
 */
export function CustomCursor({ isVisible = true }: CursorProps) {
  const [cursorState, setCursorState] = useState<CursorState>('default')
  const [isClicking, setIsClicking] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [enabled, setEnabled] = useState(false)

  // Raw position (instant)
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Velocity tracking
  const velocityX = useMotionValue(0)
  const velocityY = useMotionValue(0)
  const lastPos = useRef({ x: -100, y: -100, time: 0 })

  // Inner dot - tight spring, nearly instant (premium feel: responsive core)
  const dotSpring = { damping: 40, stiffness: 400, mass: 0.2 }
  const dotX = useSpring(mouseX, dotSpring)
  const dotY = useSpring(mouseY, dotSpring)

  // Outer ring - softer spring, elegant lag (premium feel: fluid follow)
  const ringSpring = { damping: 28, stiffness: 180, mass: 0.8 }
  const ringX = useSpring(mouseX, ringSpring)
  const ringY = useSpring(mouseY, ringSpring)

  // Velocity magnitude for morphing
  const speed = useTransform(
    [velocityX, velocityY],
    ([vx, vy]: number[]) => Math.min(Math.sqrt(vx * vx + vy * vy), 150)
  )

  // Velocity-based stretch factor (subtle, max 1.3x)
  const stretch = useTransform(speed, [0, 150], [1, 1.25])

  // Velocity-based rotation (cursor stretches in direction of movement)
  const rotation = useTransform(
    [velocityX, velocityY],
    ([vx, vy]: number[]) => Math.atan2(vy, vx) * (180 / Math.PI)
  )

  // Ring opacity - slightly more visible when moving fast
  const ringOpacity = useTransform(speed, [0, 80, 150], [0.35, 0.5, 0.25])

  // Cursor size configuration per state
  const dotSizes: Record<CursorState, number> = {
    default: 6,
    link: 5,
    button: 5,
    text: 2,
    media: 8,
  }

  const ringSizes: Record<CursorState, number> = {
    default: 36,
    link: 52,
    button: 56,
    text: 0,
    media: 64,
  }

  const detectState = useCallback((target: HTMLElement): CursorState => {
    // Text inputs
    if (target.closest('input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]')) {
      return 'text'
    }
    // Media elements
    if (target.closest('video, .carousel, [data-cursor="media"]')) {
      return 'media'
    }
    // Buttons
    if (target.closest('button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input[type="submit"], input[type="button"]')) {
      return 'button'
    }
    // Links
    if (target.closest('a[href], [data-cursor="link"]')) {
      return 'link'
    }
    return 'default'
  }, [])

  // Init check
  useEffect(() => {
    const mobile = isMobileDevice()
    const reduced = prefersReducedMotion()
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover) and (min-width: 1280px)').matches
    setEnabled(!mobile && !reduced && finePointer)

    const handleMotionChange = () => {
      setEnabled(!isMobileDevice() && !prefersReducedMotion() && window.matchMedia('(pointer: fine) and (hover: hover) and (min-width: 1280px)').matches)
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', handleMotionChange)
    return () => motionQuery.removeEventListener('change', handleMotionChange)
  }, [])

  // Main event loop
  useEffect(() => {
    if (!enabled || !isVisible) return

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      const dt = now - lastPos.current.time

      if (dt > 0) {
        const vx = (e.clientX - lastPos.current.x) / (dt / 16) // Normalize to ~60fps
        const vy = (e.clientY - lastPos.current.y) / (dt / 16)
        velocityX.set(vx)
        velocityY.set(vy)
      }

      lastPos.current = { x: e.clientX, y: e.clientY, time: now }
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      // Detect hover state
      const target = e.target as HTMLElement
      setCursorState(detectState(target))
      setIsHidden(false)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => {
      setIsHidden(true)
      mouseX.set(-100)
      mouseY.set(-100)
    }
    const handleMouseEnter = () => setIsHidden(false)

    // Passive listeners for performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [enabled, isVisible, mouseX, mouseY, velocityX, velocityY, detectState])

  // Decay velocity when mouse stops
  useEffect(() => {
    if (!enabled) return

    let frame: number
    const decay = () => {
      velocityX.set(velocityX.get() * 0.92)
      velocityY.set(velocityY.get() * 0.92)
      frame = requestAnimationFrame(decay)
    }
    frame = requestAnimationFrame(decay)
    return () => cancelAnimationFrame(frame)
  }, [enabled, velocityX, velocityY])

  if (!enabled || !isVisible) return null

  const dotSize = isClicking ? dotSizes[cursorState] * 0.6 : dotSizes[cursorState]
  const ringSize = isClicking ? ringSizes[cursorState] * 0.85 : ringSizes[cursorState]
  const isInteractive = cursorState === 'link' || cursorState === 'button'

  return (
    <AnimatePresence>
      {!isHidden && (
        <>
          {/* Inner dot - precise, responsive */}
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[10000]"
            style={{
              x: dotX,
              y: dotY,
              translateX: '-50%',
              translateY: '-50%',
            }}
          >
            <motion.div
              className="rounded-full bg-white"
              style={{
                scaleX: cursorState === 'default' ? stretch : 1,
                rotate: cursorState === 'default' ? rotation : 0,
                mixBlendMode: 'difference',
              }}
              animate={{
                width: dotSize,
                height: dotSize,
                opacity: cursorState === 'text' ? 1 : 1,
              }}
              transition={{
                width: { type: 'spring', stiffness: 600, damping: 35 },
                height: { type: 'spring', stiffness: 600, damping: 35 },
              }}
            />
          </motion.div>

          {/* Outer ring - fluid, elegant follow */}
          {cursorState !== 'text' && (
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9999]"
              style={{
                x: ringX,
                y: ringY,
                translateX: '-50%',
                translateY: '-50%',
              }}
            >
              <motion.div
                className="rounded-full"
                style={{
                  mixBlendMode: 'difference',
                  opacity: ringOpacity,
                }}
                animate={{
                  width: ringSize,
                  height: ringSize,
                  borderWidth: isInteractive ? 1.5 : 1,
                  borderColor: 'rgba(255, 255, 255, 1)',
                  backgroundColor: isInteractive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                }}
                transition={{
                  type: 'spring',
                  stiffness: isClicking ? 500 : 220,
                  damping: isClicking ? 30 : 22,
                  mass: 0.6,
                }}
              />
            </motion.div>
          )}

          {/* Interactive glow backdrop */}
          {isInteractive && (
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9997]"
              style={{
                x: ringX,
                y: ringY,
                translateX: '-50%',
                translateY: '-50%',
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 90,
                  height: 90,
                  background: 'radial-gradient(circle, oklch(0.45 0.15 250 / 0.12) 0%, transparent 70%)',
                  filter: 'blur(8px)',
                }}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
