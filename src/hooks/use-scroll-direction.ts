import { useState, useEffect, useRef } from 'react'

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const previousScrollY = lastScrollY.current
      const scrollDelta = Math.abs(currentScrollY - previousScrollY)
      
      // Only update visibility if scroll delta is significant (> 10px) to prevent jittery behavior
      if (scrollDelta >= 10) {
        // Show buttons when at the top of the page (within 100px)
        if (currentScrollY < 100) {
          setIsVisible(true)
        } 
        // Hide when scrolling down, show when scrolling up
        else if (currentScrollY > previousScrollY) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        
        // Update ref for next comparison
        lastScrollY.current = currentScrollY
      }
    }

    // Add scroll event listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      // Remove listener (passive option not needed for removal)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return isVisible
}
