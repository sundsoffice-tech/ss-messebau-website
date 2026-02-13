import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { isMobileDevice, prefersReducedMotion } from '../lib/cursor-utils'

interface CursorProps {
  isVisible?: boolean
}

export function CustomCursor({ isVisible = true }: CursorProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'link' | 'button'>('default')
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  const trailsRef = useRef<Array<{ x: number; y: number; id: number }>>([])
  const [trails, setTrails] = useState<Array<{ x: number; y: number; id: number }>>([])
  const trailIdRef = useRef(0)

  useEffect(() => {
    // Check for mobile devices
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    motionQuery.addEventListener('change', handleMotionChange)
    checkMobile()
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  useEffect(() => {
    if (isMobile || !isVisible || prefersReducedMotion) return

    let animationFrameId: number
    let lastTrailTime = 0
    const TRAIL_INTERVAL = 30 // milliseconds between trails

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Add trail effect with throttling
      const currentTime = Date.now()
      if (currentTime - lastTrailTime > TRAIL_INTERVAL) {
        lastTrailTime = currentTime
        const newTrail = { x: e.clientX, y: e.clientY, id: trailIdRef.current++ }
        trailsRef.current = [...trailsRef.current, newTrail].slice(-8) // Keep last 8 trails
        setTrails([...trailsRef.current])
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement
      const isLink = target.closest('a, button, [role="button"]')
      const isButton = target.closest('button, [role="button"]')
      
      if (isButton) {
        setCursorVariant('button')
        setIsHovering(true)
      } else if (isLink) {
        setCursorVariant('link')
        setIsHovering(true)
      } else {
        setCursorVariant('default')
        setIsHovering(false)
      }
    }

    const handleMouseDown = () => {
      setIsClicking(true)
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    const handleMouseLeave = () => {
      cursorX.set(-100)
      cursorY.set(-100)
      setTrails([])
      trailsRef.current = []
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup old trails periodically
    const trailCleanup = setInterval(() => {
      if (trailsRef.current.length > 0) {
        trailsRef.current = trailsRef.current.slice(1)
        setTrails([...trailsRef.current])
      }
    }, 100)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      clearInterval(trailCleanup)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [cursorX, cursorY, isMobile, isVisible, prefersReducedMotion])

  // Don't render on mobile or if disabled
  if (isMobile || !isVisible || prefersReducedMotion) {
    return null
  }

  return (
    <>
      {/* Trail particles */}
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="fixed pointer-events-none z-[9999] rounded-full"
          style={{
            left: trail.x,
            top: trail.y,
            width: 4,
            height: 4,
            background: `oklch(0.45 0.15 250 / ${0.3 * (index + 1) / trails.length})`,
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width: isClicking ? 4 : (isHovering ? 8 : 6),
            height: isClicking ? 4 : (isHovering ? 8 : 6),
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        />
      </motion.div>

      {/* Cursor ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full border-2 border-white mix-blend-difference"
          animate={{
            width: isClicking ? 28 : (isHovering ? (cursorVariant === 'button' ? 60 : 48) : 32),
            height: isClicking ? 28 : (isHovering ? (cursorVariant === 'button' ? 60 : 48) : 32),
            opacity: isHovering ? 0.5 : 0.3,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>

      {/* Glow effect for buttons */}
      {isHovering && cursorVariant === 'button' && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-full blur-xl"
            style={{
              width: 80,
              height: 80,
              background: 'oklch(0.45 0.15 250)',
            }}
          />
        </motion.div>
      )}
    </>
  )
}
