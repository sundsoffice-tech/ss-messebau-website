/**
 * Zentrale Kontaktdaten von S&S Messebau.
 *
 * Einzige Quelle für Rufnummer, WhatsApp-Nummer und E-Mail in den
 * Kontakt-Bedienelementen (Schnellkontakt-Leiste, Header, Footer).
 * Ändert sich eine Nummer, ändert sie sich hier – nicht in fünf Komponenten.
 */
export const CONTACT = {
  /** E.164 ohne Leerzeichen – für tel:-Links */
  phoneE164: '+4915140368754',
  /** Anzeigeform, wie sie gesprochen und gelesen wird */
  phoneDisplay: '+49 1514 0368754',
  /** WhatsApp verlangt die Nummer ohne "+" und ohne Leerzeichen */
  whatsappNumber: '4915140368754',
  email: 'info@sundsmessebau.com',
} as const

/** tel:-URL für Anruf-Links */
export const PHONE_HREF = `tel:${CONTACT.phoneE164}`

/** mailto:-URL für E-Mail-Links */
export const EMAIL_HREF = `mailto:${CONTACT.email}`

/**
 * Baut den offiziellen WhatsApp-Click-to-Chat-Link (https://wa.me/<nummer>?text=…).
 * Der Text wird URL-kodiert; eine leere Nachricht ergibt einen Link ohne Query.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`
  const text = message?.trim()
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
