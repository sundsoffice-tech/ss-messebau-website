import { useState, useEffect, useRef } from 'react'

// Constants for scroll behavior
const TOP_THRESHOLD = 100 // Show buttons when within 100px of page top
const SCROLL_DELTA_THRESHOLD = 10 // Minimum scroll distance to trigger visibility change

export function useScrollDirection() {
  // Initialize visibility based on current scroll position
  const [isVisible, setIsVisible] = useState(() => window.scrollY < TOP_THRESHOLD)
  const lastProcessedScrollY = useRef(window.scrollY)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastProcessedScrollY.current)
      
      // Only update visibility if scroll delta is significant to prevent jittery behavior
      if (scrollDelta >= SCROLL_DELTA_THRESHOLD) {
        // Show buttons when at the top of the page
        if (currentScrollY < TOP_THRESHOLD) {
          setIsVisible(true)
        } 
        // Hide when scrolling down, show when scrolling up
        else if (currentScrollY > lastProcessedScrollY.current) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        
        // Update last processed position for next delta calculation
        lastProcessedScrollY.current = currentScrollY
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
