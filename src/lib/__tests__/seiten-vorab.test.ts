// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// @ts-ignore Build-Skript ohne Typen
import { baueSeite, pfadeDerSitemap, rueckfalltext, maskiere, ladeInhalte } from '../../../scripts/seiten-vorab.mjs'
import seitenMeta from '../seiten-meta.json'

const wurzel = resolve(__dirname, '../../..')
const vorlage = readFileSync(resolve(wurzel, 'index.html'), 'utf8')
const sitemap = pfadeDerSitemap(readFileSync(resolve(wurzel, 'public/sitemap.xml'), 'utf8'))
const meta = seitenMeta as Record<string, { title: string; description: string }>
// seiten-inhalt.json plus die Rechtsseiten, deren Text aus rechtsseiten.json und de.json kommt
const inhalt = ladeInhalte() as Record<string, { h1: string; absaetze?: string[]; abschnitte?: string[] }>

function zaehle(html: string, muster: RegExp) {
  return (html.match(muster) || []).length
}

describe('seiten-vorab: eigene HTML-Datei je Seite', () => {
  it('jede Adresse der Sitemap hat Titel, Beschreibung und Rückfalltext', () => {
    expect(sitemap.length).toBeGreaterThan(20)
    for (const pfad of sitemap) {
      expect(meta[pfad], `seiten-meta.json: ${pfad}`).toBeDefined()
      expect(inhalt[pfad], `seiten-inhalt.json: ${pfad}`).toBeDefined()
    }
  })

  it('kein Titel und keine Beschreibung kommt in der Sitemap zweimal vor', () => {
    const pfade = sitemap
    expect(new Set(pfade.map((p) => meta[p].title)).size).toBe(pfade.length)
    expect(new Set(pfade.map((p) => meta[p].description)).size).toBe(pfade.length)
  })

  it.each(sitemap.filter((p) => p !== '/'))('%s trägt eigenen Kopf und genau eine Hauptüberschrift', (pfad) => {
    const html = baueSeite(vorlage, pfad, meta[pfad], inhalt[pfad])
    const url = `https://sunds-messebau.de${pfad}`
    expect(html).toContain(`<title>${maskiere(meta[pfad].title)}</title>`)
    expect(html).toContain(`<link rel="canonical" href="${url}" />`)
    expect(html).toContain(`<meta property="og:url" content="${url}" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="en" href="${url}?lang=en" />`)
    expect(html).toContain(`<meta name="description" content="${maskiere(meta[pfad].description)}" />`)
    expect(zaehle(html, /<link rel="canonical"/g)).toBe(1)
    expect(zaehle(html, /<h1[\s>]/g)).toBe(1)
    expect(html).toContain(`<h1>${maskiere(inhalt[pfad].h1)}</h1>`)
    // Der Text der Startseite steht auf keiner Unterseite mehr
    expect(html).not.toContain('Messestände, die Ihre Marke verkaufen – S&amp;S Messebau aus NRW')
    expect(html).not.toContain('S&amp;S Messebau – Professioneller Messebau aus NRW</h1>')
    // Die Anwendung startet unverändert
    expect(html).toContain('<div id="root">')
    expect(zaehle(html, /<script type="module"/g)).toBe(zaehle(vorlage, /<script type="module"/g))
  })

  it('jede Route der Anwendung hat eine eigene Datei oder ist eine bekannte Ausnahme', () => {
    // Neue case-Zeile in App.tsx ohne Eintrag hier: Die Seite bekäme live den Kopf der Startseite
    // (Stufe 1) oder Status 404 (Stufe 2). Dann seiten-meta.json, seiten-inhalt.json und Sitemap ergänzen.
    const app = readFileSync(resolve(wurzel, 'src/App.tsx'), 'utf8')
    const routen = [...app.matchAll(/case '(\/[^']*)':/g)].map((t) => t[1])
    expect(routen.length).toBeGreaterThan(20)
    const ausnahmen = ['/', '/admin', '/leistungen/showrooms', '/leistungen/ladenbau', '/leistungen/brandspaces']
    const ohne = routen.filter((r) => !inhalt[r] && !ausnahmen.includes(r))
    expect(ohne).toEqual([])
  })

  it('die 404-Antwort ist von der Suche ausgenommen und hat keine Canonical-Adresse', () => {
    const html = baueSeite(
      vorlage,
      '/nicht-gefunden',
      { title: 'Seite nicht gefunden | S&S Messebau', description: 'Diese Seite gibt es nicht.' },
      { h1: 'Seite nicht gefunden', absaetze: [], abschnitte: [] },
      { ohneIndex: true }
    )
    expect(html).toContain('<meta name="robots" content="noindex" />')
    expect(zaehle(html, /<link rel="canonical"/g)).toBe(0)
    expect(zaehle(html, /hreflang=/g)).toBe(0)
  })

  it('Sonderzeichen aus den Daten werden maskiert', () => {
    const text = rueckfalltext({ h1: 'A & B <script>', absaetze: ['"x"'], abschnitte: ['<b>'] }, 'd')
    expect(text).toContain('<h1>A &amp; B &lt;script&gt;</h1>')
    expect(text).toContain('<p>&quot;x&quot;</p>')
    expect(text).toContain('<li>&lt;b&gt;</li>')
  })

  it('bricht ab, wenn die Vorlage eine erwartete Stelle nicht genau einmal enthält', () => {
    const ohneCanonical = vorlage.replace(/<link rel="canonical"[^>]*>/, '')
    expect(() => baueSeite(ohneCanonical, '/kontakt', meta['/kontakt'], inhalt['/kontakt'])).toThrow(/canonical/)
  })
})
