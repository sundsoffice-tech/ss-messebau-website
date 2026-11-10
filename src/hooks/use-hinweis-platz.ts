import { useLayoutEffect, type RefObject } from 'react'

/**
 * CSS-Variable am <html>-Element: Höhe des Cookie-Hinweises, solange er steht.
 *
 * Zwei Stellen lesen sie, beide mit Rückfall 0px:
 * - `body` in `index.css` hält unten so viel Platz frei, damit am Seitenende
 *   die Fuß-Verweise (Impressum, Datenschutz) über dem Hinweis liegen;
 * - die Kontaktleiste in `StickyCTA.tsx` rückt um denselben Wert nach oben.
 *
 * Der Name steht dort als fester Text (Tailwind braucht ganze Klassennamen);
 * `cookie-hinweis-platz.test.tsx` hält die drei Stellen zusammen.
 */
export const HINWEIS_HOEHE_VARIABLE = '--cookie-hinweis-hoehe'

/**
 * Misst die Höhe des Hinweises und schreibt sie in die Variable, solange
 * `aktiv` gilt. Folgt jeder Größenänderung (Umbruch bei schmalem Fenster,
 * Sprachwechsel) und nimmt die Variable beim Schließen wieder weg.
 */
export function useHinweisPlatz(hinweis: RefObject<HTMLElement | null>, aktiv: boolean): void {
  useLayoutEffect(() => {
    const element = hinweis.current
    if (!aktiv || !element) return

    const wurzel = document.documentElement
    const messen = () => {
      const hoehe = Math.ceil(element.getBoundingClientRect().height)
      wurzel.style.setProperty(HINWEIS_HOEHE_VARIABLE, `${hoehe}px`)
    }

    messen()
    const beobachter = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(messen)
    beobachter?.observe(element)
    window.addEventListener('resize', messen)

    return () => {
      beobachter?.disconnect()
      window.removeEventListener('resize', messen)
      wurzel.style.removeProperty(HINWEIS_HOEHE_VARIABLE)
    }
  }, [hinweis, aktiv])
}
