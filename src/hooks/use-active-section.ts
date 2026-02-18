import { useState, useEffect } from 'react'
import { parseDeepLink } from '@/lib/deep-linking'

/**
 * Hook to track the current active section in navigation
 * Returns the current page and section from the URL hash
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<{
    page: string
    section?: string
  }>(() => {
    if (typeof window === 'undefined') {
      return { page: '/' }
    }
    return parseDeepLink()
  })

  useEffect(() => {
    const handleRouteChange = () => {
      const deepLink = parseDeepLink()
      setActiveSection(deepLink)
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  return activeSection
}

/**
 * Hook to check if a specific page/section combination is currently active
 */
export function useIsActive(page: string, section?: string): boolean {
  const activeSection = useActiveSection()
  
  if (section) {
    return activeSection.page === page && activeSection.section === section
  }
  
  return activeSection.page === page
}
