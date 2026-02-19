import { useEffect, useRef } from 'react'
import { trackFirstPartyEvent } from '@/lib/analytics-tracker'
import { isTrackingAllowed } from '@/lib/analytics'

const HEARTBEAT_INTERVAL_MS = 30_000

/**
 * Sends periodic heartbeat events while the page is visible.
 * Pauses when tab is hidden (visibilitychange API).
 * Sends immediately when tab becomes visible again.
 */
export function useHeartbeat(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function sendHeartbeat() {
      if (!isTrackingAllowed()) return
      if (document.visibilityState === 'hidden') return
      trackFirstPartyEvent('heartbeat')
    }

    function startInterval() {
      if (intervalRef.current) return
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
    }

    function stopInterval() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        sendHeartbeat()
        startInterval()
      } else {
        stopInterval()
      }
    }

    if (document.visibilityState === 'visible') {
      sendHeartbeat()
      startInterval()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
