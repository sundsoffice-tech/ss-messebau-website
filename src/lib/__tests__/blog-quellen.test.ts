import { describe, it, expect } from 'vitest'
import { DEMO_BLOG_POSTS } from '../demo-blog-posts'
import seitenMeta from '../seiten-meta.json'
import seitenInhalt from '../../../scripts/seiten-inhalt.json'
import startseite from '../../../index.html?raw'
import sitemap from '../../../public/sitemap.xml?raw'

/**
 * Jeder neue Blogbeitrag beruht auf eigener Recherche (Auftrag des Inhabers vom 10.11.2026): Jede Zahl im Text
 * steht in einem wörtlichen Auszug einer abgerufenen Quelle oder ist als Annahme oder eigene Rechnung ausgewiesen.
 * Das Quellenprotokoll liegt unter docs/blog-quellen/<slug>.md, der Aufbau steht in docs/blog-quellen/README.md.
 *
 * Der Test prüft die Form und die Zahlen. Die Zahlenprobe ist grob: Sie verlangt nur, dass jede Zahl des Beitrags
 * in irgendeinem Auszug vorkommt, nicht, dass sie zur Aussage gehört (ein vertauschter Stichtag bleibt grün).
 * Ob ein Auszug die Aussage auch dem Sinn nach trägt, prüft vor jedem
 * Beitrag eine zweite Person gegen das Protokoll; das Ergebnis steht im Abschnitt „Gegenprüfung“.
 */

/** Beiträge von vor dem 10.11.2026 ohne Protokoll. Die Liste wird nur kürzer: Wer einen überarbeitet, legt das Protokoll an. */
const OHNE_PROTOKOLL = [
  'messestand-checkliste',
  'messestand-budget-guide',
  'nachhaltiger-messebau',
  'messestand-kosten-mittelstand',
  'messestand-food-unternehmen-anuga',
  'schnelle-angebotsstellung-messebau-48h',
]

const protokolle = Object.fromEntries(
  Object.entries(
    import.meta.glob(['../../../docs/blog-quellen/*.md', '!**/README.md'], {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
  ).map(([pfad, text]) => [pfad.replace(/^.*\/([^/]+)\.md$/, '$1'), text])
)

interface Quelle {
  kennung: string
  adresse: string | null
  abgerufen: string | null
  stand: string | null
  auszuege: string[]
}

function abschnitt(protokoll: string, titel: string): string {
  const teile = protokoll.split(/^## /m)
  const teil = teile.find((t) => t.startsWith(titel))
  return teil ? teil.slice(teil.indexOf('\n') + 1) : ''
}

function quellenDesProtokolls(protokoll: string): Quelle[] {
  return abschnitt(protokoll, 'Quellen')
    .split(/^### /m)
    .slice(1)
    .map((block) => ({
      kennung: (block.match(/^(Q\d+)\b/) || [])[1] || '',
      adresse: (block.match(/^- Adresse: (https:\/\/\S+)$/m) || [])[1] || null,
      abgerufen: (block.match(/^- Abgerufen: (\d{2}\.\d{2}\.\d{4} \d{2}:\d{2})$/m) || [])[1] || null,
      stand: (block.match(/^- Stand der Seite: (.+)$/m) || [])[1] || null,
      auszuege: [...block.matchAll(/^- Auszug: „(.+)“$/gm)].map((t) => t[1]),
    }))
}

/** Zahl ohne Tausenderpunkt und ohne schließende Satzzeichen: „1.250“ wird „1250“, „3,5“ bleibt. */
function normiere(zahl: string): string {
  return zahl
    .replace(/[.,]+$/, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(/(,\d*?)0+$/, '$1') // 4,00 trägt 4, 2,50 trägt 2,5
    .replace(/,$/, '')
}

/** Ein Datum (27.09.2026, 27.9., 14.-18.06.2027) wird zu seinen Teilen ohne führende Null: 27 9 2026. */
function zerlegeDaten(text: string): string {
  return text.replace(
    /(?<![\d.,])(\d{1,2})\.(?:\s?[-–]\s?(\d{1,2})\.)?(\d{1,2})\.(\d{4}|\d{2})?(?![\d])/g,
    (_, tag, bisTag, monat, jahr) => [tag, bisTag, monat, jahr].filter(Boolean).map((t) => String(Number(t))).join(' ') + ' '
  )
}

function zahlenIm(text: string): string[] {
  const ohneListenziffern = zerlegeDaten(text.replace(/^\s*\d+\. /gm, ''))
  return [...ohneListenziffern.matchAll(/\d[\d.,]*/g)].map((t) => normiere(t[0])).filter((z) => z.length > 0)
}

/** Zahlen des Beitrags, die weder in einem Auszug noch unter „Annahmen und eigene Rechnungen“ stehen. */
function zahlenOhneBeleg(beitrag: string, protokoll: string): string[] {
  const belegtext =
    quellenDesProtokolls(protokoll)
      .flatMap((q) => q.auszuege)
      .join('\n') +
    '\n' +
    abschnitt(protokoll, 'Annahmen und eigene Rechnungen')
  const belegt = new Set<string>()
  for (const z of zahlenIm(belegtext)) {
    belegt.add(z)
    belegt.add(normiere(z.replace('.', ','))) // englische Quelle: 3.5 trägt 3,5, 600.00 trägt 600
  }
  // englische Tausender: 110,000 trägt 110000
  for (const roh of belegtext.match(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d,])/g) || []) belegt.add(roh.replace(/,/g, ''))
  // Quellenverweise am Ende des Beitrags sind keine Aussagen
  const aussagen = beitrag.split(/^## Quellen\s*$/m)[0].replace(/\]\([^)]*\)/g, ']')
  return [...new Set(zahlenIm(aussagen).filter((z) => !belegt.has(z)))]
}

const mitProtokoll = DEMO_BLOG_POSTS.filter((p) => !OHNE_PROTOKOLL.includes(p.slug))
const meta = seitenMeta as Record<string, { title: string; description: string; ogType?: string }>
const inhalt = seitenInhalt as Record<string, { h1: string; absaetze: string[]; abschnitte: string[] }>

describe('Blog: Quellenprotokoll je Beitrag', () => {
  it('die Liste der Beiträge ohne Protokoll nennt nur vorhandene Beiträge', () => {
    const slugs = DEMO_BLOG_POSTS.map((p) => p.slug)
    expect(OHNE_PROTOKOLL.filter((s) => !slugs.includes(s))).toEqual([])
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('jeder Beitrag außerhalb dieser Liste hat ein Protokoll, und kein Protokoll steht ohne Beitrag da', () => {
    expect(mitProtokoll.filter((p) => !protokolle[p.slug]).map((p) => p.slug)).toEqual([])
    const slugs = DEMO_BLOG_POSTS.map((p) => p.slug)
    expect(Object.keys(protokolle).filter((s) => !slugs.includes(s))).toEqual([])
  })

  it.each(mitProtokoll.map((p) => [p.slug, p] as const))('%s: Quellen vollständig, Verweise im Protokoll, jede Zahl kommt in einem Auszug oder unter den Annahmen vor', (slug, post) => {
    const protokoll = protokolle[slug] ?? ''
    const quellen = quellenDesProtokolls(protokoll)
    expect(quellen.length, 'mindestens drei Quellen').toBeGreaterThanOrEqual(3)
    expect(new Set(quellen.map((q) => q.kennung)).size, 'Kennungen Q1, Q2, … einmalig').toBe(quellen.length)
    for (const q of quellen) {
      expect(q.kennung, 'Quelle ohne Kennung').toMatch(/^Q\d+$/)
      expect(q.adresse, `${q.kennung}: Adresse`).toBeTruthy()
      expect(q.abgerufen, `${q.kennung}: Abrufzeit TT.MM.JJJJ HH:MM`).toBeTruthy()
      expect(q.stand, `${q.kennung}: Stand der Seite`).toBeTruthy()
      expect(q.auszuege.length, `${q.kennung}: wörtlicher Auszug`).toBeGreaterThan(0)
      // Tabellenzellen einer Quelle sind kurz („Wandhöhe ≤ 4,00 m“); je Quelle trägt aber mindestens ein ganzer Satz
      for (const a of q.auszuege) expect(a.length, `${q.kennung}: Auszug zu kurz`).toBeGreaterThanOrEqual(8)
      expect(Math.max(...q.auszuege.map((a) => a.length)), `${q.kennung}: kein Auszug mit ganzem Satz`).toBeGreaterThanOrEqual(40)
    }
    // Jede Adresse, auf die der Beitrag verweist, steht mit Abrufzeit und Auszug im Protokoll
    const adressen = quellen.map((q) => q.adresse)
    const verweise = [...post.content.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((t) => t[1])
    expect(verweise.filter((v) => !adressen.includes(v))).toEqual([])
    expect(verweise.length, 'Verweise am Ende des Beitrags').toBeGreaterThanOrEqual(3)
    expect(post.content).toMatch(/^## Quellen\s*$/m)
    // Keine Zahl im Text ohne Auszug oder ausgewiesene Annahme
    expect(zahlenOhneBeleg(post.content, protokoll)).toEqual([])
    // Die Gegenprüfung ist abgeschlossen und nennt ihr Ergebnis; ein Protokoll mit offener Prüfung geht nicht hinaus
    const gegen = abschnitt(protokoll, 'Gegenprüfung')
    expect(gegen, 'Gegenprüfung nicht abgeschlossen').not.toMatch(/steht aus|noch offen|läuft noch/i)
    expect(gegen).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    expect(gegen, 'Zahl der geprüften Aussagen').toMatch(/\d+ (Aussagen|Stellen) geprüft/)
    // Nach „## Quellen“ stehen nur der Satz zum Abruftag und Verweise; dort wird sonst nichts geprüft
    const nachQuellen = (post.content.split(/^## Quellen\s*$/m)[1] || '').split('\n').filter((z) => z.trim())
    const erlaubt = /^(- \[[^\]]+\]\(https:\/\/[^)\s]+\)|Alle (Seiten und )?Dokumente abgerufen am \d{1,2}\. [A-Za-zä]+ \d{4}\.)$/
    expect(nachQuellen.filter((z) => !erlaubt.test(z))).toEqual([])
    // Kein fremdes Bild ohne belegte Lizenz
    expect(post.imageUrl).toBe('')
  })

  it('die Zahlenprobe erkennt eine Zahl ohne Beleg und lässt belegte durch', () => {
    const protokoll = [
      '# Quellenprotokoll: probe',
      '## Quellen',
      '### Q1 Veranstalter: Schlussbericht',
      '- Adresse: https://example.org/bericht',
      '- Stand der Seite: 27.09.2026',
      '- Abgerufen: 10.11.2026 18:40',
      '- Auszug: „Zur Messe am 27.09.2026 kamen 1.250 Aussteller und rund 3.5 million visitors aus 90 Ländern.“',
      '## Annahmen und eigene Rechnungen',
      '- Rechenbeispiel: 20 qm mal 150 € sind 3.000 €.',
      '## Gegenprüfung',
      '- 10.11.2026',
    ].join('\n')
    expect(quellenDesProtokolls(protokoll)).toHaveLength(1)
    expect(zahlenOhneBeleg('Am 27. September 2026 kamen 1250 Aussteller, 3,5 Millionen Besucher.', protokoll)).toEqual([])
    expect(zahlenOhneBeleg('1. Punkt\n2. Punkt\n\nIm Beispiel kosten 20 qm 3.000 €.', protokoll)).toEqual([])
    expect(zahlenOhneBeleg('Es kamen 1.300 Aussteller aus 90 Ländern.', protokoll)).toEqual(['1300'])
    // Teile einer belegten Zahl sind selbst nicht belegt: 1.250 trägt weder 250 noch 1
    expect(zahlenOhneBeleg('Es kamen 250 Aussteller in 1 Halle.', protokoll)).toEqual(['250', '1'])
    expect(zahlenOhneBeleg('Am 27.9. war Schluss.', protokoll)).toEqual([])
    // Preise und Maße mit und ohne Nachkommanullen sind dieselbe Zahl
    const preise = protokoll.replace('aus 90 Ländern', 'aus 90 Ländern, Abnahme 1.495,00 €, Höhe 4,00 m, Rückwand 2,50 m')
    expect(zahlenOhneBeleg('Die Abnahme kostet 1.495 €, bis 4 m Höhe, ab 2,5 m neutral.', preise)).toEqual([])
    expect(zahlenOhneBeleg('Die Abnahme kostet 1.496 €.', preise)).toEqual(['1496'])
    const englisch = protokoll.replace('aus 90 Ländern', 'aus 90 Ländern, minimum fee of €600.00 and €13.00/m²')
    expect(zahlenOhneBeleg('Mindestens 600,00 €, je m² 13 €.', englisch)).toEqual([])
    const tausender = protokoll.replace('aus 90 Ländern', 'aus 90 Ländern, a total of 110,000 visitors')
    expect(zahlenOhneBeleg('Es kamen 110.000 Besucher.', tausender)).toEqual([])
    expect(zahlenOhneBeleg('Es kamen 110.000 Besucher.', protokoll)).toEqual(['110000'])
    expect(zahlenOhneBeleg('Die Quote lag bei 42 %.', protokoll)).toEqual(['42'])
    // Zahlen in der Adresse eines Verweises im Fließtext sind keine Aussagen
    expect(zahlenOhneBeleg('[Bericht](https://example.org/2031) sagt nichts.', protokoll)).toEqual([])
    // Das Datum der Seite im Kopf der Quelle ist kein Auszug: Ein Datum im Text braucht eine Stelle, die es nennt
    expect(zahlenOhneBeleg('Abgerufen wurde um 18 Uhr.', protokoll)).toEqual(['18'])
    // Die Tabelle der Behauptungen zitiert den Beitrag und zählt deshalb nicht als Beleg
    expect(zahlenOhneBeleg('Es waren 777 Stände.', protokoll + '\n## Behauptungen\n| B1 | „Es waren 777 Stände.“ | Q1 |')).toEqual(['777'])
    // Zahlen in den Verweisen am Ende sind keine Aussagen
    expect(zahlenOhneBeleg('Text.\n\n## Quellen\n\n- [Bericht 2031](https://example.org/2031)', protokoll)).toEqual([])
  })
})

describe('Blog: jeder Beitrag steht an allen Stellen', () => {
  it.each(DEMO_BLOG_POSTS.map((p) => [p.slug, p] as const))('%s', (slug, post) => {
    const pfad = `/blog/${slug}`
    // Fehlt eine Stelle, bekommt der Beitrag live den Kopf der Startseite oder fehlt in der Suche.
    expect(meta[pfad], 'seiten-meta.json').toBeDefined()
    expect(meta[pfad].ogType).toBe('article')
    expect(inhalt[pfad], 'seiten-inhalt.json').toBeDefined()
    expect(sitemap, 'sitemap.xml').toContain(`<loc>https://sunds-messebau.de${pfad}</loc>`)
    expect(startseite.split(`href="${pfad}"`).length - 1, 'zwei Linklisten in index.html').toBe(2)
    if (!OHNE_PROTOKOLL.includes(slug)) {
      expect(inhalt[pfad].h1).toBe(post.title)
      expect(meta[pfad].title).toBe(`${post.title} | S&S Messebau`)
      expect(meta[pfad].description).toBe(post.excerpt)
      expect(inhalt[pfad].absaetze.length).toBe(3)
      // Die Zwischenüberschriften des vorab gebauten Texts sind die des Beitrags
      expect(inhalt[pfad].abschnitte).toEqual([...post.content.matchAll(/^## (.+)$/gm)].map((t) => t[1]))
      // Auch Titel, Anreißer und die vorab gebauten Absätze nennen keine Zahl ohne Beleg
      const vorab = [post.title, post.excerpt, ...inhalt[pfad].absaetze].join('\n')
      expect(zahlenOhneBeleg(vorab, protokolle[slug] ?? '')).toEqual([])
    }
  })
})
