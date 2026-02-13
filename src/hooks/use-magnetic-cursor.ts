import { useEffect, useRef, RefObject } from 'react'
import { shouldDisableCursorEffects } from '../lib/cursor-utils'

interface MagneticCursorOptions {
  strength?: number // How strong the magnetic effect is (0-1)
  radius?: number // Radius of effect in pixels
  disabled?: boolean
}

/**
 * Hook to add magnetic cursor effect to an element
 * The element will subtly move towards the cursor when it's nearby
 */
export function useMagneticCursor<T extends HTMLElement>(
  options: MagneticCursorOptions = {}
): RefObject<T> {
  const { strength = 0.3, radius = 100, disabled = false } = options
  const elementRef = useRef<T>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (disabled) return
    
    const element = elementRef.current
    if (!element) return

    // Check if cursor effects should be disabled
    if (shouldDisableCursorEffects()) return

    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < radius) {
        const factor = (1 - distance / radius) * strength
        targetX = distanceX * factor
        targetY = distanceY * factor
      } else {
        targetX = 0
        targetY = 0
      }
    }

    const handleMouseLeave = () => {
      targetX = 0
      targetY = 0
    }

    const animate = () => {
      // Smooth interpolation
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1

      if (element) {
        element.style.transform = `translate(${currentX}px, ${currentY}px)`
      }

      // Continue animation if not at target
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    const handleMouseMoveWithAnimation = (e: MouseEvent) => {
      handleMouseMove(e)
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    window.addEventListener('mousemove', handleMouseMoveWithAnimation)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWithAnimation)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (element) {
        element.style.transform = ''
      }
    }
  }, [strength, radius, disabled])

  return elementRef
}
