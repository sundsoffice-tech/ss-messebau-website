/**
 * Central Analytics Helper – GA4 Event Tracking, A/B Tests, Cookie Consent
 *
 * Provides typed helpers around window.gtag so components only need to import
 * lightweight functions instead of touching the global directly.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** All custom GA4 event names used across the site */
export type AnalyticsEvent =
  | 'hero_cta_click'
  | 'whatsapp_click'
  | '48h_banner_click'
  | 'form_submit'
  | 'calculator_complete'
  | 'reference_detail_view'
  | 'blog_article_read'
  | 'scroll_depth'
  | 'page_engagement'
  | 'ab_test_impression';

export interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/* ------------------------------------------------------------------ */
/*  Cookie Consent                                                     */
/* ------------------------------------------------------------------ */

const CONSENT_KEY = 'ss_cookie_consent';

export type ConsentValue = 'granted' | 'denied' | null;

/** Persist the user's consent decision */
export function setConsent(value: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage unavailable – degrade silently
  }
  updateGtagConsent(value);
}

/** Read persisted consent. Returns null when no decision has been taken. */
export function getConsent(): ConsentValue {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'granted' || v === 'denied') return v;
  } catch {
    // ignore
  }
  return null;
}

/** Push consent state to gtag */
function updateGtagConsent(value: 'granted' | 'denied'): void {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: value,
    });
  }
}

/** Check whether tracking is currently allowed */
export function isTrackingAllowed(): boolean {
  return getConsent() === 'granted';
}

/* ------------------------------------------------------------------ */
/*  GA4 Event helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Fire a custom GA4 event. Silently no-ops when:
 * - gtag is not loaded (script blocked / not yet loaded)
 * - User has not granted consent
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  params?: EventParams,
): void {
  if (!isTrackingAllowed()) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/* ------------------------------------------------------------------ */
/*  Convenience wrappers for specific funnel events                    */
/* ------------------------------------------------------------------ */

export function trackHeroCTAClick(variant?: string): void {
  trackEvent('hero_cta_click', { variant: variant ?? 'default' });
}

export function trackWhatsAppClick(source: string): void {
  trackEvent('whatsapp_click', { source });
}

export function track48hBannerClick(): void {
  trackEvent('48h_banner_click');
}

export function trackFormSubmit(formType: string, params?: EventParams): void {
  trackEvent('form_submit', { form_type: formType, ...params });
}

export function trackCalculatorComplete(params?: EventParams): void {
  trackEvent('calculator_complete', params);
}

export function trackReferenceDetailView(referenceId: string): void {
  trackEvent('reference_detail_view', { reference_id: referenceId });
}

export function trackBlogArticleRead(
  articleSlug: string,
  readTimeSeconds: number,
): void {
  trackEvent('blog_article_read', {
    article_slug: articleSlug,
    read_time_seconds: readTimeSeconds,
  });
}

export function trackScrollDepth(
  page: string,
  depthPercent: number,
): void {
  trackEvent('scroll_depth', { page, depth_percent: depthPercent });
}

export function trackPageEngagement(
  page: string,
  dwellTimeSeconds: number,
): void {
  trackEvent('page_engagement', {
    page,
    dwell_time_seconds: dwellTimeSeconds,
  });
}

/* ------------------------------------------------------------------ */
/*  A/B Test helpers                                                   */
/* ------------------------------------------------------------------ */

const AB_KEY_PREFIX = 'ss_ab_';

export type ABVariant = 'A' | 'B';

/**
 * Deterministically assign and persist an A/B variant for a given test.
 * The assignment is stored in localStorage so the user always sees the
 * same variant.
 */
export function getABVariant(testName: string): ABVariant {
  const key = AB_KEY_PREFIX + testName;
  try {
    const stored = localStorage.getItem(key);
    if (stored === 'A' || stored === 'B') return stored;
  } catch {
    // ignore
  }
  const variant: ABVariant = Math.random() < 0.5 ? 'A' : 'B';
  try {
    localStorage.setItem(key, variant);
  } catch {
    // ignore
  }
  return variant;
}

/** Record an impression for the assigned variant */
export function trackABImpression(
  testName: string,
  variant: ABVariant,
): void {
  trackEvent('ab_test_impression', { test_name: testName, variant });
}
