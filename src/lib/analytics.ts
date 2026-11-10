/**
 * Zustimmung zur Hausstatistik (Cookie-Banner) und A/B-Zuteilung.
 *
 * Gezählt wird ausschließlich mit der eigenen Statistik (`analytics-tracker.ts`,
 * Endpunkt `/api/collect.php`). Die früheren GA4-Aufrufe (`window.gtag`) sind
 * entfernt: Das Skript wurde nie geladen, jedes Ereignis lief ins Leere.
 * Ohne Zustimmung wird nichts gespeichert und nichts gesendet.
 */

/* ------------------------------------------------------------------ */
/*  Cookie Consent                                                     */
/* ------------------------------------------------------------------ */

const CONSENT_KEY = 'ss_cookie_consent';

export type ConsentValue = 'granted' | 'denied' | null;

type ConsentListener = (value: 'granted' | 'denied') => void;

const consentListeners = new Set<ConsentListener>();

/**
 * Meldet einen Lauscher an, der bei jeder Entscheidung im Banner gerufen wird.
 * Die Hausstatistik sendet darüber nach „Akzeptieren" Sitzungsstart und
 * Seitenaufruf der laufenden Seite nach. Rückgabe: Abmelden.
 */
export function onConsentChange(listener: ConsentListener): () => void {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

/** Persist the user's consent decision */
export function setConsent(value: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage unavailable – degrade silently
  }
  for (const listener of consentListeners) {
    try {
      listener(value);
    } catch {
      // Ein fehlerhafter Lauscher darf die Entscheidung nicht verhindern
    }
  }
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

/** Check whether tracking is currently allowed */
export function isTrackingAllowed(): boolean {
  return getConsent() === 'granted';
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
