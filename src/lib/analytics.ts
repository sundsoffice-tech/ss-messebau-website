/**
 * Zustimmung zur Hausstatistik (Cookie-Banner).
 *
 * Gezählt wird ausschließlich mit der eigenen Statistik (`analytics-tracker.ts`,
 * Endpunkt `/api/collect.php`). Die früheren GA4-Aufrufe (`window.gtag`) sind
 * entfernt: Das Skript wurde nie geladen, jedes Ereignis lief ins Leere.
 * Ohne Zustimmung wird nichts gespeichert und nichts gesendet.
 *
 * Widerruf: „Ablehnen" nach früherem „Akzeptieren" läuft über dieselbe
 * Funktion `setConsent('denied')`. Jedes Modul, das mit Zustimmung speichert
 * oder sendet, hängt sich mit `onConsentChange` an und räumt bei `denied`
 * seine eigenen Schlüssel ab (`analytics-tracker.ts`, `utm-utils.ts`).
 */

/* ------------------------------------------------------------------ */
/*  Cookie Consent                                                     */
/* ------------------------------------------------------------------ */

/** Schlüssel der Entscheidung im localStorage; einziger Eintrag der Statistik, der ohne Zustimmung entsteht. */
export const CONSENT_STORAGE_KEY = 'ss_cookie_consent';
const CONSENT_KEY = CONSENT_STORAGE_KEY;

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
