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

    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
}
