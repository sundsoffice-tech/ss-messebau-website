import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import type { ComponentType } from 'react'
// @ts-ignore Build-Skript ohne Typen
import { baueSeite, ladeInhalte, rechtsInhalt } from '../../../../scripts/seiten-vorab.mjs'
import { I18nContext, getTranslation } from '@/lib/i18n'
import { ImpressumPage, DatenschutzPage } from '@/components/pages/OtherPages'
import seitenMeta from '@/lib/seiten-meta.json'
import rechtsseiten from '@/lib/rechtsseiten.json'
import deTexte from '@/locales/de.json'
import enTexte from '@/locales/en.json'

/**
 * Impressum und Datenschutzerklärung müssen ohne JavaScript vollständig ankommen.
 *
 * Geprüft wird die gerenderte Seite gegen den Rückfalltext, den
 * scripts/seiten-vorab.mjs beim Build in dist/_s/<seite>.html schreibt: Jede
 * Überschrift, jeder Absatz und jeder Listenpunkt der Seite muss dort stehen.
 * Der Test wird rot, wenn jemand der Seite einen Abschnitt gibt, der nicht aus
 * rechtsseiten.json kommt, oder wenn der Rückfalltext wieder gekürzt wird.
 *
 * Pfade sind relativ zum Arbeitsverzeichnis (vitest läuft in der Repo-Wurzel),
 * weil das Projekt kein @types/node führt.
 */

type Block = [string, string]
interface Struktur {
  titel: string
  abschnitte: Array<{ titel: string; inhalt: Block[] }>
}

const struktur = rechtsseiten as unknown as Record<string, Struktur>
const meta = seitenMeta as Record<string, { title: string; description: string }>
const de = deTexte as Record<string, string>
const en = enTexte as Record<string, string>
const vorlage = readFileSync('index.html', 'utf8')
const inhalte = ladeInhalte() as Record<string, unknown>

const SEITEN: Array<[pfad: string, Seite: ComponentType, mindestWoerter: number, abschnitte: number]> = [
  ['/impressum', ImpressumPage, 70, 5],
  ['/datenschutz', DatenschutzPage, 1000, 14],
]

/** Vergleich ohne Leerraum: Die Seite trennt Zeilen mit <br>, textContent kennt dort kein Leerzeichen. */
const dicht = (text: string | null) => (text ?? '').replace(/\s+/g, '')

/** Sichtbarer Text mit Leerzeichen an Zeilen- und Blockgrenzen, für die Wortzahl. */
function sichtbarerText(wurzel: Element): string {
  const kopie = wurzel.cloneNode(true) as Element
  for (const e of Array.from(kopie.querySelectorAll('br, h1, h2, h3, p, li'))) {
    e.after(' ')
  }
  return kopie.textContent ?? ''
}

const woerter = (text: string) => text.split(/\s+/).filter(Boolean).length

function rendereSeite(Seite: ComponentType): HTMLElement {
  const { container } = render(
    <I18nContext.Provider value={{ lang: 'de', setLang: () => {}, t: getTranslation('de') }}>
      <Seite />
    </I18nContext.Provider>,
  )
  return container
}

/** <main> der vorab erzeugten Datei: das, was ohne JavaScript zu lesen ist. */
function rueckfallMain(html: string): Element {
  const main = new DOMParser().parseFromString(html, 'text/html').querySelector('main')
  if (!main) throw new Error('vorab erzeugte Datei ohne <main>')
  return main
}

/** Alles, was die Seite zeigt und der Rückfalltext nicht enthält. Leer heißt vollständig. */
function fehltImRueckfall(seite: Element, main: Element): string[] {
  const fehlt: string[] = []
  for (const stufe of ['h1', 'h2', 'h3']) {
    const dort = Array.from(main.querySelectorAll(stufe)).map((e) => dicht(e.textContent))
    for (const e of Array.from(seite.querySelectorAll(stufe))) {
      if (!dort.includes(dicht(e.textContent))) fehlt.push(`${stufe}: ${e.textContent}`)
    }
  }
  const dort = Array.from(main.querySelectorAll('p, li')).map((e) => dicht(e.textContent))
  for (const e of Array.from(seite.querySelectorAll('p, li'))) {
    if (!dort.includes(dicht(e.textContent))) {
      fehlt.push(`${e.tagName.toLowerCase()}: ${(e.textContent ?? '').slice(0, 60)}`)
    }
  }
  return fehlt
}

const ueberschriften = (wurzel: Element, stufe: string) =>
  Array.from(wurzel.querySelectorAll(stufe)).map((e) => (e.textContent ?? '').trim())

afterEach(() => {
  cleanup()
})

describe.each(SEITEN)('%s: voller Text im Rückfalltext', (pfad, Seite, mindestWoerter, abschnitte) => {
  const baue = () => rueckfallMain(baueSeite(vorlage, pfad, meta[pfad], inhalte[pfad]))

  it('jede Überschrift, jeder Absatz und jeder Listenpunkt der Seite steht im Rückfalltext', () => {
    const seite = rendereSeite(Seite)
    expect(seite.querySelectorAll('p, li').length).toBeGreaterThan(4)
    expect(fehltImRueckfall(seite, baue())).toEqual([])
  })

  it('die Abschnittsüberschriften stimmen in Zahl und Reihenfolge überein', () => {
    const seite = rendereSeite(Seite)
    const main = baue()
    expect(ueberschriften(seite, 'h2')).toHaveLength(abschnitte)
    expect(ueberschriften(main, 'h2')).toEqual(ueberschriften(seite, 'h2'))
    expect(ueberschriften(main, 'h3')).toEqual(ueberschriften(seite, 'h3'))
    expect(ueberschriften(main, 'h1')).toEqual(ueberschriften(seite, 'h1'))
  })

  it('der Rückfalltext hat mindestens so viele Wörter wie die Seite', () => {
    const seitenWoerter = woerter(sichtbarerText(rendereSeite(Seite)))
    const rueckfallWoerter = woerter(sichtbarerText(baue()))
    expect(seitenWoerter).toBeGreaterThanOrEqual(mindestWoerter)
    expect(rueckfallWoerter).toBeGreaterThanOrEqual(seitenWoerter)
  })

  it('Rotprobe: fehlt dem Rückfalltext der letzte Abschnitt, meldet der Vergleich ihn', () => {
    const letzter = struktur[pfad].abschnitte[struktur[pfad].abschnitte.length - 1]
    const gekuerzt = { [pfad]: { ...struktur[pfad], abschnitte: struktur[pfad].abschnitte.slice(0, -1) } }
    const main = rueckfallMain(baueSeite(vorlage, pfad, meta[pfad], rechtsInhalt(pfad, gekuerzt, de)))
    const fehlt = fehltImRueckfall(rendereSeite(Seite), main)
    expect(fehlt).toContain(`h2: ${de[letzter.titel]}`)
    expect(fehlt.length).toBeGreaterThan(1)
  })

  it('Rotprobe: die frühere Kurzfassung (Überschriften als Liste, drei Absätze) fällt durch', () => {
    const seite = rendereSeite(Seite)
    const kurz = {
      h1: de[struktur[pfad].titel],
      absaetze: Array.from(seite.querySelectorAll('p')).slice(0, 3).map((e) => e.textContent ?? ''),
      abschnitte: ueberschriften(seite, 'h2'),
    }
    const fehlt = fehltImRueckfall(seite, rueckfallMain(baueSeite(vorlage, pfad, meta[pfad], kurz)))
    expect(fehlt).toContain(`h2: ${ueberschriften(seite, 'h2')[0]}`)
  })
})

describe('Rechtsseiten: eine Quelle für Seite und Rückfalltext', () => {
  const verwendet = new Set<string>()
  for (const seite of Object.values(struktur)) {
    verwendet.add(seite.titel)
    for (const abschnitt of seite.abschnitte) {
      verwendet.add(abschnitt.titel)
      for (const [, schluessel] of abschnitt.inhalt) verwendet.add(schluessel)
    }
  }

  it('seiten-inhalt.json führt keine zweite Fassung der Rechtsseiten', () => {
    const handgepflegt = JSON.parse(readFileSync('scripts/seiten-inhalt.json', 'utf8')) as Record<string, unknown>
    expect(Object.keys(struktur).sort()).toEqual(['/datenschutz', '/impressum'])
    for (const pfad of Object.keys(struktur)) {
      expect(handgepflegt[pfad], `${pfad} in seiten-inhalt.json`).toBeUndefined()
      expect(inhalte[pfad], `${pfad} im Rückfalltext`).toBeDefined()
    }
  })

  it('jeder Text privacy.* und imprint.* in de.json steht auf einer Rechtsseite, keiner fehlt', () => {
    const vorhanden = Object.keys(de).filter((k) => /^(privacy|imprint)\./.test(k))
    expect(vorhanden.sort()).toEqual(Array.from(verwendet).sort())
  })

  it('die englische Fassung hat jeden Schlüssel und dieselbe Zahl an Zeilen und Listenpunkten', () => {
    for (const schluessel of verwendet) {
      expect(en[schluessel], `en.json: ${schluessel}`).toBeTruthy()
      expect(de[schluessel], `de.json: ${schluessel}`).toBeTruthy()
    }
    const listen = Object.values(struktur)
      .flatMap((s) => s.abschnitte.flatMap((a) => a.inhalt))
      .filter(([art, schluessel]) => art === 'ul' && schluessel.startsWith('privacy.'))
    expect(listen.length).toBeGreaterThan(3)
    for (const [, schluessel] of listen) {
      expect(en[schluessel].split('\n'), `en.json: ${schluessel}`).toHaveLength(de[schluessel].split('\n').length)
    }
  })

  it('der Verantwortliche der Datenschutzerklärung ist wörtlich die Angabe aus dem Impressum', () => {
    const verantwortlich = struktur['/datenschutz'].abschnitte.find((a) => a.titel === 'privacy.verantwortlich.title')
    expect(verantwortlich?.inhalt.map(([, schluessel]) => schluessel)).toEqual(
      expect.arrayContaining(['imprint.address', 'imprint.contact.details']),
    )
    const main = rueckfallMain(baueSeite(vorlage, '/datenschutz', meta['/datenschutz'], inhalte['/datenschutz']))
    expect(dicht(main.textContent)).toContain(dicht(de['imprint.address']))
  })

  it('der Fließtext der Datenschutzerklärung kommt ohne Gedankenstriche und Mittelpunkte aus', () => {
    for (const schluessel of verwendet) {
      if (!schluessel.startsWith('privacy.')) continue
      expect(de[schluessel], schluessel).not.toMatch(/[–—·]/)
    }
  })

  it('ein Schlüssel, den de.json nicht kennt, bricht den Build ab statt eine Lücke zu schreiben', () => {
    const kaputt = { '/x': { titel: 'privacy.title', abschnitte: [{ titel: 'gibt.es.nicht', inhalt: [] }] } }
    expect(() => rechtsInhalt('/x', kaputt, de)).toThrow(/gibt\.es\.nicht/)
  })
})
