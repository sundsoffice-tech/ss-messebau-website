/**
 * Entfernt Einträge im Browserspeicher, die frühere Fassungen der Website
 * geschrieben und nie gelesen haben. Seit 10.11.2026 schreibt sie kein Code mehr;
 * bei Besuchern von vorher liegen sie noch im Browser und tragen Name, E-Mail,
 * Telefon, Nachricht oder die ersten Zeichen von Chat-Fragen.
 *
 * Grund: § 25 Abs. 2 Nr. 2 TDDDG erlaubt ohne Einwilligung nur Einträge, die eine
 * Funktion braucht. Für diese vier gab es keinen Leser mit Wirkung für den Besucher
 * (Rechtsprüfung 10.11.2026, Auflage 2).
 */

/** Feste Schlüssel ohne Leser: Kopie der Anfragen und die zwei Chat-Protokolle. */
export const ALTBESTAND_SCHLUESSEL = ['ss_kv_inquiries', 'chat_audit_log', 'chat_security_log'] as const

/**
 * Kopie einer Banner-Bestellung: `ss_kv_banner_<Zeitstempel>`. Der Entwurf des
 * Konfigurators (`ss_kv_banner_config_draft`) hat einen Leser und bleibt.
 */
export const ALTBESTAND_BESTELLKOPIE = /^ss_kv_banner_\d+$/

/** Löscht die Altbestände und gibt die entfernten Schlüssel zurück. Wirft nie. */
export function entferneSpeicherAltbestand(speicher?: Storage): string[] {
  const entfernt: string[] = []
  try {
    const ziel = speicher ?? window.localStorage
    const vorhanden: string[] = []
    for (let i = 0; i < ziel.length; i++) {
      const schluessel = ziel.key(i)
      if (schluessel !== null) vorhanden.push(schluessel)
    }
    for (const schluessel of vorhanden) {
      const fest = (ALTBESTAND_SCHLUESSEL as readonly string[]).includes(schluessel)
      if (fest || ALTBESTAND_BESTELLKOPIE.test(schluessel)) {
        ziel.removeItem(schluessel)
        entfernt.push(schluessel)
      }
    }
  } catch {
    // Speicher gesperrt oder nicht vorhanden: dann liegt dort auch kein Altbestand.
  }
  return entfernt
}
