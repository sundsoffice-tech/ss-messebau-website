import { useEffect, useRef } from 'react';
import {
  trackScrollDepth,
  trackPageEngagement,
  trackBlogArticleRead,
  isTrackingAllowed,
} from '@/lib/analytics';

/* ------------------------------------------------------------------ */
/*  useScrollDepthTracking – fires at 25 / 50 / 75 / 100 % thresholds */
/* ------------------------------------------------------------------ */

export function useScrollDepthTracking(pageName: string): void {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const fired = firedRef.current;
    fired.clear();

    const handler = () => {
      if (!isTrackingAllowed()) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);
      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          trackScrollDepth(pageName, t);
        }
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [pageName]);
}

/* ------------------------------------------------------------------ */
/*  useDwellTimeTracking – fires engagement event when user leaves      */
/* ------------------------------------------------------------------ */

export function useDwellTimeTracking(pageName: string): void {
  useEffect(() => {
    const start = Date.now();

    const sendEngagement = () => {
      if (!isTrackingAllowed()) return;
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds > 2) {
        trackPageEngagement(pageName, seconds);
      }
    };

    // fire on page hide (works on mobile & desktop)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendEngagement();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      sendEngagement();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pageName]);
}

/* ------------------------------------------------------------------ */
/*  useArticleReadTracking – fires when user has read > threshold secs  */
/* ------------------------------------------------------------------ */

export function useArticleReadTracking(
  articleSlug: string | undefined,
  thresholdSeconds = 120,
): void {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!articleSlug) return;
    firedRef.current = false;

    const start = Date.now();
    const interval = setInterval(() => {
      if (firedRef.current) return;
      if (!isTrackingAllowed()) return;
      const elapsed = Math.round((Date.now() - start) / 1000);
      if (elapsed >= thresholdSeconds) {
        firedRef.current = true;
        trackBlogArticleRead(articleSlug, elapsed);
        clearInterval(interval);
      }
    }, 10_000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [articleSlug, thresholdSeconds]);
}
