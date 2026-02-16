import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      
      // Only update if scroll delta is significant (> 10px) to prevent jittery behavior
      if (scrollDelta < 10) {
        return
      }
      
      // Show buttons when at the top of the page (within 100px)
      if (currentScrollY < 100) {
        setIsVisible(true)
      } 
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Add scroll event listener with passive flag for better performance
    const scrollOptions = { passive: true }
    window.addEventListener('scroll', handleScroll, scrollOptions)
    
    return () => {
      window.removeEventListener('scroll', handleScroll, scrollOptions)
    }
  }, [lastScrollY])

  return isVisible
}
