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
  }>(() => parseDeepLink(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      const deepLink = parseDeepLink(window.location.hash)
      setActiveSection(deepLink)
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    // Also listen for history state changes
    window.addEventListener('popstate', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
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
