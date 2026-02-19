import { useEffect, useRef, useCallback } from 'react';
import {
  trackScrollDepth,
  trackPageEngagement,
  trackBlogArticleRead,
  isTrackingAllowed,
} from '@/lib/analytics';
import {
  trackFormInteraction,
  trackFormAbandon,
  trackExitIntent,
} from '@/lib/analytics-tracker';

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

/* ------------------------------------------------------------------ */
/*  useFormInteractionTracking – tracks field focus/blur in forms       */
/* ------------------------------------------------------------------ */

export function useFormInteractionTracking(formType: string): {
  onFieldFocus: (fieldName: string) => void
  onFieldBlur: (fieldName: string) => void
  onFieldChange: (fieldName: string) => void
} {
  const interactedFieldsRef = useRef<Set<string>>(new Set())
  const lastFieldRef = useRef<string>('')

  const onFieldFocus = useCallback((fieldName: string) => {
    if (!isTrackingAllowed()) return
    lastFieldRef.current = fieldName
    if (!interactedFieldsRef.current.has(fieldName)) {
      interactedFieldsRef.current.add(fieldName)
      trackFormInteraction(formType, fieldName, 'focus')
    }
  }, [formType])

  const onFieldBlur = useCallback((fieldName: string) => {
    if (!isTrackingAllowed()) return
    trackFormInteraction(formType, fieldName, 'blur')
  }, [formType])

  const onFieldChange = useCallback((fieldName: string) => {
    if (!isTrackingAllowed()) return
    lastFieldRef.current = fieldName
    interactedFieldsRef.current.add(fieldName)
  }, [])

  return { onFieldFocus, onFieldBlur, onFieldChange }
}

/* ------------------------------------------------------------------ */
/*  useFormAbandonTracking – detects form abandon on unmount/navigate   */
/* ------------------------------------------------------------------ */

export function useFormAbandonTracking(
  formType: string,
  formValues: Record<string, unknown>,
  totalFields: number,
  submitted: boolean,
): void {
  const submittedRef = useRef(submitted)
  const valuesRef = useRef(formValues)

  useEffect(() => { submittedRef.current = submitted }, [submitted])
  useEffect(() => { valuesRef.current = formValues }, [formValues])

  useEffect(() => {
    return () => {
      if (submittedRef.current) return
      if (!isTrackingAllowed()) return
      const values = valuesRef.current
      const filledFields = Object.values(values).filter(
        v => v !== undefined && v !== null && v !== '' && v !== false,
      ).length
      if (filledFields > 0) {
        const lastField = Object.entries(values)
          .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false)
          .pop()?.[0] || ''
        trackFormAbandon(formType, lastField, filledFields, totalFields)
      }
    }
  }, [formType, totalFields])
}

/* ------------------------------------------------------------------ */
/*  useExitIntentTracking – detects mouse leaving viewport (desktop)    */
/* ------------------------------------------------------------------ */

export function useExitIntentTracking(pageName: string): void {
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false

    const handler = (e: MouseEvent) => {
      if (firedRef.current) return
      if (!isTrackingAllowed()) return
      if (e.clientY <= 5) {
        firedRef.current = true
        trackExitIntent(pageName)
      }
    }

    document.addEventListener('mouseout', handler)
    return () => document.removeEventListener('mouseout', handler)
  }, [pageName])
}
