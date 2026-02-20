import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { isMobileDevice, prefersReducedMotion } from '../lib/cursor-utils'

// Lazy singleton 1×1 canvas for resolving any CSS color to RGBA
let _colorCtx: CanvasRenderingContext2D | null = null
function getColorCtx(): CanvasRenderingContext2D {
  if (!_colorCtx) {
    const c = document.createElement('canvas')
    c.width = 1; c.height = 1
    _colorCtx = c.getContext('2d', { willReadFrequently: true })!
  }
  return _colorCtx
}

// Parse ANY CSS color (rgb, rgba, oklch, lab, hsl, hex, named) → [r, g, b, a] normalized 0–1
function parseCSSColor(color: string): [number, number, number, number] | null {
  if (!color || color === 'transparent') return null

  // Fast path: rgb/rgba regex (most common case, avoids canvas overhead)
  const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/)
  if (m) {
    const a = m[4] !== undefined
      ? (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]))
      : 1
    if (a <= 0.01) return null
    return [parseFloat(m[1]) / 255, parseFloat(m[2]) / 255, parseFloat(m[3]) / 255, Math.min(1, Math.max(0, a))]
  }

  // Fallback: canvas resolves oklch, lab, hsl, hex, named colors, etc.
  try {
    const ctx = getColorCtx()
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0,0,0,0)' // Reset to transparent
    ctx.fillStyle = color // Set target; invalid values are silently ignored
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    if (d[3] <= 2) return null // Nearly transparent
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]
  } catch {
    return null
  }
}

// Check if composited background color has a dominant blue hue
function hasBlueHue(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return false
  const saturation = (max - min) / max
  if (saturation < 0.15) return false // Too desaturated (gray/white)
  return b > r * 1.2 && b > g * 1.1   // Blue channel dominates
}

// WCAG sRGB linearization for accurate perceptual luminance
function toLinearRGB(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Analyze background at a given screen position.
 * Returns luminance (WCAG) and whether the background has a blue hue.
 * - Walks the DOM tree collecting background colors (solid + gradient)
 * - Alpha-composites semi-transparent layers correctly
 * - Uses canvas fallback for oklch/lab/hsl colors
 */
function analyzeBackground(x: number, y: number): { luminance: number, isBlue: boolean } {
  const el = document.elementFromPoint(x, y)
  if (!el) return { luminance: 1, isBlue: false }

  // Collect background color layers from topmost element to deepest ancestor
  const layers: [number, number, number, number][] = []
  let current: Element | null = el

  while (current && current !== document.documentElement) {
    const style = getComputedStyle(current)
    let color: [number, number, number, number] | null = null

    // 1. Try solid background-color first
    const bg = style.backgroundColor
    if (bg) {
      color = parseCSSColor(bg)
    }

    // 2. If transparent/none, try gradient or image background
    if (!color) {
      const bgImage = style.backgroundImage
      if (bgImage && bgImage !== 'none') {
        // Extract first color stop from gradient string
        color = parseCSSColor(bgImage)
      }
    }

    if (color) {
      layers.push(color)
      if (color[3] >= 0.99) break // Fully opaque: no need to composite further
    }

    current = current.parentElement
  }

  if (layers.length === 0) return { luminance: 1, isBlue: false }

  // Alpha-composite from deepest layer (bottom) to topmost (top)
  let r = 1, g = 1, b = 1 // Start with white browser background
  for (let i = layers.length - 1; i >= 0; i--) {
    const [lr, lg, lb, a] = layers[i]
    r = lr * a + r * (1 - a)
    g = lg * a + g * (1 - a)
    b = lb * a + b * (1 - a)
  }

  return {
    luminance: 0.2126 * toLinearRGB(r) + 0.7152 * toLinearRGB(g) + 0.0722 * toLinearRGB(b),
    isBlue: hasBlueHue(r, g, b),
  }
}

// Cursor colors: brand blue on light surfaces, white on dark surfaces
const CURSOR_COLOR_ON_LIGHT = '#0057B8'
const CURSOR_COLOR_ON_DARK = '#ffffff'

// Hysteresis thresholds – wide gap prevents flickering at section boundaries.
// Website backgrounds: white/muted ≈ 0.87–1.0 luminance, primary blue ≈ 0.05–0.13
const THRESHOLD_TO_LIGHT = 0.45 // Luminance above this → switch cursor to blue
const THRESHOLD_TO_DARK  = 0.25 // Luminance below this → switch cursor to white

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
  const [isLightBg, setIsLightBg] = useState(false)
  const isLightBgRef = useRef(false)
  const lastBgCheckTime = useRef(0)

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

      // Throttled background analysis for cursor color adaptation
      if (now - lastBgCheckTime.current > 100) {
        lastBgCheckTime.current = now
        const { luminance, isBlue } = analyzeBackground(e.clientX, e.clientY)
        // Hysteresis + blue-hue guard: never show blue cursor on blue background
        const threshold = isLightBgRef.current ? THRESHOLD_TO_DARK : THRESHOLD_TO_LIGHT
        const isLight = luminance > threshold && !isBlue
        if (isLight !== isLightBgRef.current) {
          isLightBgRef.current = isLight
          setIsLightBg(isLight)
        }
      }
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
              className="rounded-full"
              style={{
                scaleX: cursorState === 'default' ? stretch : 1,
                rotate: cursorState === 'default' ? rotation : 0,
              }}
              animate={{
                width: dotSize,
                height: dotSize,
                opacity: cursorState === 'text' ? 1 : 1,
                backgroundColor: isLightBg ? CURSOR_COLOR_ON_LIGHT : CURSOR_COLOR_ON_DARK,
              }}
              transition={{
                width: { type: 'spring', stiffness: 600, damping: 35 },
                height: { type: 'spring', stiffness: 600, damping: 35 },
                backgroundColor: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
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
                  opacity: isLightBg ? 0.85 : ringOpacity,
                }}
                animate={{
                  width: ringSize,
                  height: ringSize,
                  borderWidth: isInteractive ? 1.5 : 1,
                  borderColor: isLightBg ? CURSOR_COLOR_ON_LIGHT : 'rgba(255, 255, 255, 1)',
                  backgroundColor: isInteractive
                    ? (isLightBg ? 'rgba(0, 87, 184, 0.08)' : 'rgba(255, 255, 255, 0.06)')
                    : 'transparent',
                }}
                transition={{
                  type: 'spring',
                  stiffness: isClicking ? 500 : 220,
                  damping: isClicking ? 30 : 22,
                  mass: 0.6,
                  borderColor: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
                  backgroundColor: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
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
                  background: isLightBg
                    ? 'radial-gradient(circle, rgba(0, 87, 184, 0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, oklch(0.45 0.15 250 / 0.12) 0%, transparent 70%)',
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
