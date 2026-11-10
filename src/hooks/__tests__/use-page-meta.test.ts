import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import deutsch from '@/lib/seiten-meta.json'
import englisch from '@/lib/seiten-meta-en.json'
import { usePageMeta, seitenMetaFuer } from '@/hooks/use-page-meta'

/**
 * Die englische Fassung zeigte im Browser-Tab und in der Beschreibung weiter die
 * deutschen Angaben. Jetzt folgen Titel und Beschreibung der gewählten Sprache;
 * die kanonische Adresse und die deutschen Angaben bleiben, wie sie waren.
 */

const de = deutsch as Record<string, { title: string; description: string }>
const en = englisch as Record<string, { title: string; description: string }>

function kopf() {
  document.head.innerHTML = [
    '<title>alt</title>',
    '<meta name="description" content="alt" />',
    '<meta property="og:title" content="alt" />',
    '<meta property="og:description" content="alt" />',
    '<meta name="twitter:title" content="alt" />',
    '<meta name="twitter:description" content="alt" />',
    '<link rel="canonical" href="https://sunds-messebau.de/" />',
    '<meta property="og:url" content="https://sunds-messebau.de/" />',
  ].join('')
}

function inhalt(wahl: string) {
  return document.querySelector(wahl)?.getAttribute('content')
}

beforeEach(kopf)

describe('Titel und Beschreibung je Sprache', () => {
  it('jede englische Angabe gehört zu einer Seite, die es deutsch gibt', () => {
    expect(Object.keys(en).filter((pfad) => !(pfad in de))).toEqual([])
  })

  it('jede Seite außer den Blogbeiträgen hat englische Angaben', () => {
    const ohne = Object.keys(de).filter((pfad) => !pfad.startsWith('/blog/') && !(pfad in en))
    expect(ohne).toEqual([])
  })

  it('keine englische Angabe ist leer oder gleich der deutschen', () => {
    for (const [pfad, angabe] of Object.entries(en)) {
      expect(angabe.title.trim(), pfad).not.toBe('')
      expect(angabe.description.trim(), pfad).not.toBe('')
      expect(angabe.title, pfad).not.toBe(de[pfad].title)
      expect(angabe.description, pfad).not.toBe(de[pfad].description)
    }
  })

  it('deutsch bleibt unverändert, auch ohne Angabe der Sprache', () => {
    expect(seitenMetaFuer('/kontakt')).toEqual(de['/kontakt'])
    expect(seitenMetaFuer('/kontakt', 'de')).toEqual(de['/kontakt'])
  })

  it('englisch nimmt die englischen Angaben, Blogbeiträge behalten die deutschen', () => {
    expect(seitenMetaFuer('/kontakt', 'en').title).toBe(en['/kontakt'].title)
    const beitrag = Object.keys(de).find((pfad) => pfad.startsWith('/blog/')) as string
    expect(seitenMetaFuer(beitrag, 'en')).toEqual(de[beitrag])
  })

  it('eine unbekannte Seite bekommt die Angaben der Startseite in der gewählten Sprache', () => {
    expect(seitenMetaFuer('/gibt-es-nicht', 'de')).toEqual(de['/'])
    expect(seitenMetaFuer('/gibt-es-nicht', 'en').title).toBe(en['/'].title)
  })
})

describe('usePageMeta', () => {
  it('setzt auf der englischen Fassung Titel, Beschreibung und die Angaben für das Teilen englisch', () => {
    renderHook(() => usePageMeta('/branchen', 'en'))

    expect(document.title).toBe(en['/branchen'].title)
    expect(inhalt('meta[name="description"]')).toBe(en['/branchen'].description)
    expect(inhalt('meta[property="og:title"]')).toBe(en['/branchen'].title)
    expect(inhalt('meta[property="og:description"]')).toBe(en['/branchen'].description)
    expect(inhalt('meta[name="twitter:title"]')).toBe(en['/branchen'].title)
    expect(inhalt('meta[name="twitter:description"]')).toBe(en['/branchen'].description)
  })

  it('lässt die kanonische Adresse unabhängig von der Sprache', () => {
    renderHook(() => usePageMeta('/branchen', 'en'))

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://sunds-messebau.de/branchen')
    expect(inhalt('meta[property="og:url"]')).toBe('https://sunds-messebau.de/branchen')
  })

  it('folgt dem Umstellen der Sprache ohne Seitenwechsel', () => {
    const { rerender } = renderHook(({ lang }: { lang: 'de' | 'en' }) => usePageMeta('/kontakt', lang), {
      initialProps: { lang: 'en' },
    })
    expect(document.title).toBe(en['/kontakt'].title)

    rerender({ lang: 'de' })

    expect(document.title).toBe(de['/kontakt'].title)
    expect(inhalt('meta[name="description"]')).toBe(de['/kontakt'].description)
  })

  it('setzt ohne Angabe der Sprache die deutschen Angaben', () => {
    renderHook(() => usePageMeta('/kontakt'))

    expect(document.title).toBe(de['/kontakt'].title)
  })
})
