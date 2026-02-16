import { useState, useEffect, useRef } from 'react'

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const lastProcessedScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastProcessedScrollY.current)
      
      // Only update visibility if scroll delta is significant (> 10px) to prevent jittery behavior
      if (scrollDelta < 10) {
        return
      }
      
      // Show buttons when at the top of the page (within 100px)
      if (currentScrollY < 100) {
        setIsVisible(true)
      } 
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      // Update both refs after processing
      lastScrollY.current = currentScrollY
      lastProcessedScrollY.current = currentScrollY
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
