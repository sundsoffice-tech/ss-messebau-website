import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics-tracker'

/**
 * Hook that tracks first-party page_view events on hash changes.
 * Works with hash-based SPA routing.
 */
export function usePageViewTracking(): void {
  useEffect(() => {
    // Track initial page view
    trackPageView()

    // Track on hash change (SPA navigation)
    const handler = () => {
      trackPageView()
    }

    // popstate fires on browser back/forward, hashchange fires on
    // programmatic hash changes – both are needed for hash-based routing
    window.addEventListener('popstate', handler)
    window.addEventListener('hashchange', handler)
    return () => {
      window.removeEventListener('popstate', handler)
      window.removeEventListener('hashchange', handler)
    }
  }, [])
}
