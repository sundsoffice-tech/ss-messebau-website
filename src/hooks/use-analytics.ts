import { useEffect, useRef, useCallback } from 'react';
import { isTrackingAllowed } from '@/lib/analytics';
import {
  trackFormInteraction,
  trackFormAbandon,
  trackExitIntent,
  trackBlogArticleRead,
} from '@/lib/analytics-tracker';

/*
 * Scrolltiefe und Verweildauer zählt die Hausstatistik selbst bei jedem
 * Seitenaufruf (`initScrollDepthTracking`, `initEngagementTracking` in
 * `analytics-tracker.ts`). Die früheren Hooks dafür sendeten nur an GA4,
 * das nie geladen wurde, und sind entfernt.
 */

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
