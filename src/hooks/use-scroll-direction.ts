import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
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
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return isVisible
}
