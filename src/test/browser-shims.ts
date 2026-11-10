import { vi } from 'vitest'

/**
 * Browser-Schnittstellen, die jsdom nicht mitbringt, für Tests, die ganze
 * Seiten oder die Kopfzeile rendern. Aufruf in `beforeAll`.
 */
export function installBrowserShims(): void {
  class Beobachter {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): never[] {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', Beobachter)
  vi.stubGlobal('ResizeObserver', Beobachter)
  vi.stubGlobal(
    'matchMedia',
    (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  )
  vi.stubGlobal('scrollTo', () => {})
  Element.prototype.scrollIntoView = () => {}
  // Kein Netz im Test: jede Anfrage endet als „nicht erreichbar", ohne zu werfen
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
      text: async () => '',
    })),
  )
}

/** Klick auf einen Link, ohne dass jsdom zu navigieren versucht (tel:, mailto:, wa.me). */
export function preventNavigation(element: HTMLElement): HTMLElement {
  element.addEventListener('click', (event) => event.preventDefault())
  return element
}
