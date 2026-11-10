import { create } from 'zustand'
import { trackInquiryOpen } from '@/lib/analytics-tracker'

/** Ort für Knöpfe, die den Dialog öffnen, ohne ihren Ort zu nennen. */
export const INQUIRY_SOURCE_UNKNOWN = 'unbekannt'

interface UIState {
  inquiryDialogOpen: boolean
  /**
   * Öffnet den Anfrage-Dialog und zählt die Öffnung in der Hausstatistik
   * (nur mit Zustimmung). `source` nennt den Ort des Knopfes, z. B. `hero`.
   * Der Typ ist `unknown`, weil viele Knöpfe die Funktion direkt als
   * `onClick` setzen und React dann das Klick-Ereignis übergibt; alles außer
   * einer nicht leeren Zeichenkette zählt als `unbekannt`.
   */
  openInquiry: (source?: unknown) => void
  closeInquiry: () => void
  setInquiryOpen: (open: boolean) => void
  /**
   * Der Besucher hat den Cookie-Banner über „Cookie-Einstellungen" im Footer
   * erneut verlangt (Widerrufsweg). Der Banner zeigt sich dann auch, wenn schon
   * eine Entscheidung gespeichert ist.
   */
  cookieSettingsOpen: boolean
  openCookieSettings: () => void
  closeCookieSettings: () => void
}

export const useUIStore = create<UIState>((set) => ({
  inquiryDialogOpen: false,
  openInquiry: (source) => {
    trackInquiryOpen(typeof source === 'string' && source ? source : INQUIRY_SOURCE_UNKNOWN)
    set({ inquiryDialogOpen: true })
  },
  closeInquiry: () => set({ inquiryDialogOpen: false }),
  setInquiryOpen: (open) => set({ inquiryDialogOpen: open }),
  cookieSettingsOpen: false,
  openCookieSettings: () => set({ cookieSettingsOpen: true }),
  closeCookieSettings: () => set({ cookieSettingsOpen: false }),
}))
