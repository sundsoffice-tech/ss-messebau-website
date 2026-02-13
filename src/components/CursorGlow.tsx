import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Interactive Cursor Glow Effect
 * Creates a subtle glow around interactive elements when hovered
 */
export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false)
  const [glowColor, setGlowColor] = useState('oklch(0.45 0.15 250)')
  const [isMobile, setIsMobile] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 30, stiffness: 200 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  useEffect(() => {
    // Check for mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.matchMedia('(pointer: coarse)').matches
    setIsMobile(mobile)
    
    if (mobile) return

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check what type of element we're hovering
      const isButton = target.closest('button:not([disabled])')
      const isLink = target.closest('a')
      const isInteractive = target.closest('[role="button"], [tabindex]:not([tabindex="-1"])')
      
      if (isButton || isLink || isInteractive) {
        setIsVisible(true)
        x.set(e.clientX)
        y.set(e.clientY)
        
        // Different colors for different elements
        if (isButton) {
          setGlowColor('oklch(0.45 0.15 250)')
        } else if (isLink) {
          setGlowColor('oklch(0.40 0.15 270)')
        } else {
          setGlowColor('oklch(0.45 0.15 250)')
        }
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y, isMobile])

  if (isMobile) return null

  return (
    <motion.div
      className="fixed pointer-events-none z-[9997]"
      style={{
        left: xSpring,
        top: ySpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: isVisible ? 0.08 : 0,
        scale: isVisible ? 1 : 0.5,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className="rounded-full blur-3xl"
        style={{
          width: '120px',
          height: '120px',
          background: glowColor,
        }}
      />
    </motion.div>
  )
}
