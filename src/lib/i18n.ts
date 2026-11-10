import { createContext, useContext } from 'react'
import de from '@/locales/de.json'
import en from '@/locales/en.json'

export type Language = 'de' | 'en'

const translations: Record<Language, Record<string, string>> = { de, en }

export interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'de',
  setLang: () => {},
  t: (key: string) => key,
})

export function useTranslation() {
  return useContext(I18nContext)
}

export function getTranslation(lang: Language) {
  const dict = translations[lang] || translations.de
  return (key: string): string => dict[key] || translations.de[key] || key
}

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem('ss-lang')
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    // localStorage not available
  }
  return 'de'
}

/**
 * Sprache beim Start: Die Adresse geht vor (`?lang=en` oder `?lang=de`), sonst die
 * gespeicherte Wahl. Jede Seite nennt im Kopf `hreflang="en"` mit `?lang=en`; ohne
 * diese Auswertung zeigte genau diese Adresse die deutsche Fassung. Gespeichert wird
 * dabei nichts: `ss-lang` entsteht erst, wenn der Besucher die Sprache selbst umstellt.
 */
export function getInitialLanguage(suche?: string): Language {
  try {
    const wert = new URLSearchParams(suche ?? window.location.search).get('lang')
    if (wert === 'en' || wert === 'de') return wert
  } catch {
    // keine Adresse lesbar: dann gilt die gespeicherte Wahl
  }
  return getStoredLanguage()
}

/**
 * Adresse ohne die Angabe `lang`, alles andere bleibt (UTM-Angaben, Anker).
 * Stellt der Besucher die Sprache selbst um, gilt seine Wahl; stünde `?lang=en`
 * weiter in der Adresse, zeigte ein Neuladen wieder Englisch, weil die Adresse
 * beim Start vorgeht.
 */
export function ohneSprachangabe(pfad: string, suche: string, anker: string): string {
  const angaben = new URLSearchParams(suche)
  if (!angaben.has('lang')) return `${pfad}${suche}${anker}`
  angaben.delete('lang')
  const rest = angaben.toString()
  return `${pfad}${rest ? `?${rest}` : ''}${anker}`
}

export function storeLanguage(lang: Language) {
  try {
    localStorage.setItem('ss-lang', lang)
  } catch {
    // localStorage not available
  }
}
