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

export function storeLanguage(lang: Language) {
  try {
    localStorage.setItem('ss-lang', lang)
  } catch {
    // localStorage not available
  }
}
