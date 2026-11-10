/**
 * Herkunft einer Anfrage (UTM-Parameter der Einstiegsadresse).
 *
 * Gespeichert wird nur mit Zustimmung, weil der Banner zusagt, dass die Messung
 * „nur mit Ihrer Zustimmung" geschieht:
 * - keine Entscheidung: Die Parameter der Einstiegsadresse liegen nur im
 *   Arbeitsspeicher der laufenden Seite. Eine Anfrage, die der Besucher in
 *   diesem Seitenaufruf selbst absendet, behält damit ihre Quelle; nach einem
 *   Neuladen ist sie weg. Im Browser wird nichts abgelegt.
 * - Zustimmung: zusätzlich im sessionStorage (`ss_utm_params`), damit die Quelle
 *   ein Neuladen im selben Tab übersteht.
 * - Ablehnung (auch als Widerruf, auch in einem anderen Tab): Eintrag und
 *   Arbeitsspeicher werden geleert, Anfragen gehen ohne Quelle hinaus.
 *
 * Die Hausstatistik (`analytics-tracker.ts`) liest dieselbe gemerkte Quelle für
 * den Einstieg der Sitzung, wenn die Adresse bei der Zustimmung schon
 * umgeschrieben ist. Gemerkt wird sie nur hier.
 */

import { getConsent, onConsentChange, CONSENT_STORAGE_KEY } from '@/lib/analytics'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const UTM_STORAGE_KEY = 'ss_utm_params'

type UtmParams = Partial<Record<typeof UTM_KEYS[number], string>>

/** Quelle der Einstiegsadresse, nur für die Dauer dieses Seitenaufrufs. */
let inMemory: UtmParams = {}

function hasAny(utm: UtmParams): boolean {
  return Object.keys(utm).length > 0
}

function readFromUrl(): UtmParams {
  const utm: UtmParams = {}
  try {
    const params = new URLSearchParams(window.location.search)
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) utm[key] = value
    }
  } catch { /* ignore */ }
  return utm
}

/**
 * Aus einem gespeicherten Eintrag nur die fünf Kampagnen-Felder als nicht leere
 * Zeichenketten. Der Eintrag liegt im Browser des Besuchers und kann dort verändert
 * sein; ohne den Filter landeten fremde Felder ungeprüft in einer Anfrage.
 */
function nurKampagnenfelder(wert: unknown): UtmParams {
  const utm: UtmParams = {}
  if (!wert || typeof wert !== 'object' || Array.isArray(wert)) return utm
  for (const key of UTM_KEYS) {
    const feld = (wert as Record<string, unknown>)[key]
    if (typeof feld === 'string' && feld !== '') utm[key] = feld
  }
  return utm
}

function persist(utm: UtmParams): void {
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm))
  } catch { /* ignore */ }
}

function forget(): void {
  inMemory = {}
  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY)
  } catch { /* ignore */ }
}

/**
 * Liest die UTM-Parameter der aktuellen Adresse. Läuft beim Laden der Seite.
 * In den Browser-Speicher schreibt die Funktion nur, wenn zugestimmt wurde.
 */
export function captureUtmParams(): void {
  const consent = getConsent()
  if (consent === 'denied') {
    // Ein Eintrag aus einer früheren Zustimmung kann noch liegen, wenn die Ablehnung in einem
    // anderen Tab fiel, während dieser nicht geladen war. Er wird hier mit vergessen.
    forget()
    return
  }
  const utm = readFromUrl()
  if (!hasAny(utm)) return
  inMemory = utm
  if (consent === 'granted') persist(utm)
}

/**
 * Quelle für eine Anfrage: aktuelle Adresse, sonst die Einstiegsadresse.
 * Nach einer Ablehnung leer.
 */
export function getUtmParams(): UtmParams {
  const consent = getConsent()
  if (consent === 'denied') return {}

  const fromUrl = readFromUrl()
  if (hasAny(fromUrl)) return fromUrl
  if (hasAny(inMemory)) return { ...inMemory }

  if (consent === 'granted') {
    try {
      const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
      const gespeichert = nurKampagnenfelder(raw ? JSON.parse(raw) : null)
      if (hasAny(gespeichert)) return gespeichert
    } catch { /* ignore */ }
  }
  return {}
}

if (typeof window !== 'undefined') {
  captureUtmParams()
  onConsentChange((value) => {
    if (value === 'denied') {
      forget()
      return
    }
    // Zustimmung erst nach dem Laden: Einstiegsquelle jetzt ablegen
    if (!hasAny(inMemory)) inMemory = readFromUrl()
    if (hasAny(inMemory)) persist(inMemory)
  })
  // Ablehnung in einem anderen Tab: Der Browser meldet sie als `storage`-Ereignis;
  // auch dieser Tab vergisst die gemerkte Quelle (wie der Tracker seine Zählung).
  window.addEventListener('storage', (ereignis) => {
    const name = ereignis.key
    if (name !== null && name !== CONSENT_STORAGE_KEY) return
    // Maßgeblich ist der gemeldete Wert, nicht der Zustand beim Verarbeiten: Ein Tab im
    // Hintergrund kann das Ereignis erst bekommen, nachdem wieder zugestimmt wurde. Vergessen
    // wird bei Ablehnung und wenn die Entscheidung entfernt oder der Speicher geleert wurde;
    // nur eine gemeldete Zustimmung lässt die gemerkte Quelle stehen.
    const zugestimmt = name === null ? getConsent() === 'granted' : ereignis.newValue === 'granted'
    if (!zugestimmt) forget()
  })
}
