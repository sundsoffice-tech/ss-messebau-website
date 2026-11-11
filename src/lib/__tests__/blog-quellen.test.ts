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
 * in irgendeinem Auszug vorkommt, nicht, dass sie zur Aussage gehört (ein vertauschter Preis bleibt grün).
 * Für volle Daten gilt mehr: Tag, Monat und Jahr stehen zusammen in einem Auszug oder unter den Annahmen.
 * Ob ein Auszug die Aussage auch dem Sinn nach trägt, prüft vor jedem
 * Beitrag eine zweite Instanz gegen das Protokoll; das Ergebnis steht im Abschnitt „Gegenprüfung“.
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

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const ENGLISCH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Jedes volle Datum eines Texts als [Tag, Monat, Jahr]: „27. Januar 2027“ und „27.01.2027“. */
function datenIm(text: string): [number, number, number][] {
  const funde: [number, number, number][] = []
  for (const t of text.matchAll(new RegExp(`(?<![\\d.])(\\d{1,2})\\. (${MONATE.join('|')}) (\\d{4})(?!\\d)`, 'g'))) {
    funde.push([Number(t[1]), MONATE.indexOf(t[2]) + 1, Number(t[3])])
  }
  for (const t of text.matchAll(/(?<![\d.])(\d{1,2})\.(\d{1,2})\.(\d{4})(?!\d)/g)) {
    if (Number(t[2]) >= 1 && Number(t[2]) <= 12) funde.push([Number(t[1]), Number(t[2]), Number(t[3])])
  }
  return funde
}

/**
 * Daten des Beitrags, die in keinem Auszug und unter keiner Annahme als Ganzes stehen (Tag, Monat und Jahr zusammen).
 * Die Zahlenprobe zerlegt ein Datum in seine Teile und findet jeden Teil irgendwo; ein vertauschter Stichtag bleibt
 * dort grün. Hier muss das ganze Datum an einer Stelle stehen, in deutscher, numerischer oder englischer Schreibweise.
 */
function datenOhneBeleg(beitrag: string, protokoll: string): string[] {
  // Die Auszüge bleiben durch ein Zeichen getrennt, damit kein Datum aus dem Ende des einen und dem Anfang des nächsten entsteht
  const belegtext = (
    quellenDesProtokolls(protokoll)
      .flatMap((q) => q.auszuege)
      .join(' ¶ ') +
    ' ¶ ' +
    abschnitt(protokoll, 'Annahmen und eigene Rechnungen')
  ).replace(/\s+/g, ' ')
  const aussagen = beitrag.split(/^## Quellen\s*$/m)[0].replace(/\]\([^)]*\)/g, ']')
  const zz = (n: number) => String(n).padStart(2, '0')
  const ohne: string[] = []
  for (const [t, m, j] of datenIm(aussagen)) {
    const formen = [
      `${t}. ${MONATE[m - 1]} ${j}`,
      `${zz(t)}. ${MONATE[m - 1]} ${j}`,
      `${zz(t)}.${zz(m)}.${j}`,
      `${t}.${m}.${j}`,
      `${zz(t)}.${zz(m)}.${String(j).slice(2)}`,
      `${ENGLISCH[m - 1]} ${t}, ${j}`,
      `${t} ${ENGLISCH[m - 1]} ${j}`,
    ]
    const steht = formen.some((f) => new RegExp(`(?<![\\d.])${f.replace(/[.]/g, '\\.')}(?!\\d)`).test(belegtext))
    if (!steht) ohne.push(`${t}. ${MONATE[m - 1]} ${j}`)
  }
  return [...new Set(ohne)]
}

/**
 * Was nach „## Quellen“ stehen darf: Verweiszeilen und der Satz zum Abruftag. Wurde eine Quelle an einem zweiten Tag
 * nachgeholt, nennt der Satz sie: „Alle Dokumente abgerufen am 10. November 2026, die Mitteilung der X am 11. November 2026.“
 */
const NACH_QUELLEN_ERLAUBT =
  /^(- \[[^\]]+\]\(https:\/\/[^)\s]+\)|Alle (Seiten und )?Dokumente abgerufen am \d{1,2}\. [A-Za-zä]+ \d{4}(, [^.]{3,90} am \d{1,2}\. [A-Za-zä]+ \d{4})?\.)$/

/** Kopf jeder Zeile der Gegenprüfung: Datum, Art des Eintrags (Runde n, Vorprüfung …, Nachtrag …), dann der Text. */
const GEGENPRUEFUNG_KOPF = /^- \d{2}\.\d{2}\.\d{4}, (Runde [1-9]|Vorprüfung[^:]{0,60}|Nachtrag[^:]{0,80}): (.+)$/
/** Die Formel, mit der eine Runde die Zahl der geprüften Aussagen nennt; null und „0 von 80“ zählen nicht. */
const GEGENPRUEFUNG_ZAHL = /(?<!\d)(?<!von )[1-9]\d* (Aussagen|Stellen) geprüft/
/** Ein Eintrag, dessen Text mit einem Wort für „noch nicht fertig“ beginnt („Runde 2: offen“, „Nachtrag: folgt“). */
const EINTRAG_OFFEN = /^(noch )?(offen|in Arbeit|geplant|folgt|begonnen|ausstehend)(?![a-zäöü])|^(steht|läuft|kommt|fehlt) noch|^wird (noch )?(geprüft|nachgereicht)/i
/** Wendungen mitten im Text („Ergebnis steht noch aus.“); „besteht aus“, „steht aus Sicht“, „steht ausdrücklich“ treffen nicht. */
const GEGENPRUEFUNG_OFFEN = /(?<![a-zäöüß])steht (noch )?aus(?=\s*([.;,:)]|$))|ausstehend|läuft noch/im

/**
 * Formprüfung des Abschnitts „Gegenprüfung“ als Positivliste: Jede Zeile beginnt mit Datum und Art des Eintrags
 * („- 10.11.2026, Runde 1: …“, „Vorprüfung …“, „Nachtrag …“). Es gibt eine Runde 1, jede Runde nennt die Zahl der
 * geprüften Aussagen oder Stellen, und kein Eintrag ist als offen geführt. Ob die Prüfung stattfand und was sie
 * fand, prüft kein Test.
 */
function gegenpruefungFehler(text: string): string[] {
  const zeilen = text
    .split('\n')
    .map((z) => z.trim())
    .filter(Boolean)
  const fehler: string[] = []
  if (!zeilen.some((z) => /^- \d{2}\.\d{2}\.\d{4}, Runde 1: /.test(z))) fehler.push('keine Zeile „- TT.MM.JJJJ, Runde 1: …“')
  for (const z of zeilen) {
    const kurz = z.slice(0, 50)
    const kopf = z.match(GEGENPRUEFUNG_KOPF)
    if (!kopf) {
      fehler.push(`Form: ${kurz}`)
      continue
    }
    if (kopf[1].startsWith('Runde') && !GEGENPRUEFUNG_ZAHL.test(z)) fehler.push(`Runde ohne Zahl: ${kurz}`)
    if (EINTRAG_OFFEN.test(kopf[2]) || GEGENPRUEFUNG_OFFEN.test(z)) fehler.push(`offen: ${kurz}`)
  }
  return fehler
}

const mitProtokoll = DEMO_BLOG_POSTS.filter((p) => !OHNE_PROTOKOLL.includes(p.slug))
const meta = seitenMeta as Record<string, { title: string; description: string; ogType?: string }>
const inhalt = seitenInhalt as Record<string, { h1: string; absaetze: string[]; abschnitte: string[] }>

describe('Blog: Quellenprotokoll je Beitrag', () => {
  it('die Liste der Beiträge ohne Protokoll nennt nur vorhandene Beiträge', () => {
    const slugs = DEMO_BLOG_POSTS.map((p) => p.slug)
    expect(OHNE_PROTOKOLL.filter((s) => !slugs.includes(s))).toEqual([])
    // Die Liste der Altbeiträge wird nur kürzer; ein neuer Beitrag ohne Protokoll kommt nicht hinein
    expect(OHNE_PROTOKOLL.length).toBeLessThanOrEqual(6)
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
    // Jedes volle Datum steht als Ganzes in einem Auszug oder unter den Annahmen
    expect(datenOhneBeleg([post.title, post.excerpt, post.content].join('\n'), protokoll), 'Datum ohne ganzen Beleg').toEqual([])
    // Die Gegenprüfung ist abgeschlossen und nennt ihr Ergebnis; ein Protokoll mit offener Prüfung geht nicht hinaus
    expect(gegenpruefungFehler(abschnitt(protokoll, 'Gegenprüfung')), 'Gegenprüfung').toEqual([])
    // Nach der ersten Überschrift „## Quellen“ stehen nur der Satz zum Abruftag und Verweise, auch nach einer zweiten
    const nachQuellen = post.content
      .split(/^## Quellen\s*$/m)
      .slice(1)
      .join('\n## Quellen\n')
      .split('\n')
      .filter((z) => z.trim())
    expect(nachQuellen.filter((z) => !NACH_QUELLEN_ERLAUBT.test(z))).toEqual([])
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

  it('die Datumsprobe verlangt das ganze Datum an einer Stelle und erkennt einen vertauschten Stichtag', () => {
    const protokoll = [
      '# Quellenprotokoll: probe',
      '## Quellen',
      '### Q1 Veranstalter: Merkblatt',
      '- Adresse: https://example.org/merkblatt',
      '- Stand der Seite: 01.10.2026',
      '- Abgerufen: 10.11.2026 18:40',
      '- Auszug: „Standbaupläne sind bis spätestens 27. Januar 2027 einzureichen, der Aufbau beginnt am 14.03.2027.“',
      '- Auszug: „Set-up starts on January 4, 2027; dismantling 18.–22.06.2027, Anmeldung bis 05.02.27.“',
      '## Annahmen und eigene Rechnungen',
      '- Der 3. Mai 2027 ist sechs Wochen vor dem Aufbau, eigene Rechnung.',
      '## Gegenprüfung',
      '- 10.11.2026',
    ].join('\n')
    // belegt in deutscher, numerischer und englischer Schreibweise, im Zeitraum und unter den Annahmen
    const belegt = 'Pläne bis 27. Januar 2027, Aufbau ab 14. März 2027 und ab 04.01.2027, Abbau bis 22. Juni 2027, Anmeldung bis 5. Februar 2027, Frist 3. Mai 2027.'
    expect(datenOhneBeleg(belegt, protokoll)).toEqual([])
    // Die Zahlenprobe lässt vertauschte Stichtage durch, weil jeder Teil irgendwo vorkommt; die Datumsprobe nicht
    const vertauscht = 'Pläne bis 14. Januar 2027, Aufbau ab 27. März 2027.'
    expect(zahlenOhneBeleg(vertauscht, protokoll)).toEqual([])
    expect(datenOhneBeleg(vertauscht, protokoll)).toEqual(['14. Januar 2027', '27. März 2027'])
    // „7. Januar 2027“ ist nicht durch „27. Januar 2027“ belegt, der erste Tag eines Zeitraums nicht durch den letzten
    expect(datenOhneBeleg('Frist 7. Januar 2027, Abbau ab 18. Juni 2027.', protokoll)).toEqual(['7. Januar 2027', '18. Juni 2027'])
    // Ein Datum, das sich erst aus dem Ende eines Auszugs und dem Anfang des nächsten ergibt, ist nicht belegt
    const geteilt = protokoll.replace('bis spätestens 27. Januar 2027 einzureichen', 'bis spätestens 27.“\n- Auszug: „Januar 2027 einzureichen')
    expect(datenOhneBeleg('Pläne bis 27. Januar 2027.', geteilt)).toEqual(['27. Januar 2027'])
    // Ein numerisches Datum im Beitrag wird wie eines mit Monatsnamen gelesen
    expect(datenOhneBeleg('Aufbau ab 28.03.2027.', protokoll)).toEqual(['28. März 2027'])
    // Ein Datum ohne Jahr und ein Datum in der Quellenliste werden hier nicht geprüft
    expect(datenOhneBeleg('Am 9. März war Schluss.\n\n## Quellen\n\n- [Stand 9. März 2031](https://example.org/a)', protokoll)).toEqual([])
  })

  it('die Formprüfung der Gegenprüfung ist eine Positivliste: Kopf je Zeile, Zahl je Runde, kein offener Eintrag', () => {
    const gut = [
      '- 10.11.2026, Vorprüfung der Methode: Eine zweite Instanz hat Statistik und Folgerungen gelesen.',
      '- 10.11.2026, Runde 1: Jede Aussage gegen den Rohtext gehalten. 128 Aussagen geprüft, 111 trugen.',
      '- 10.11.2026, Runde 2: Die geänderten Stellen wurden erneut gelesen. 34 Stellen geprüft, 9 trugen nicht. Eine dritte Lesung gab es nicht.',
      '- 11.11.2026, Nachtrag nach der Prüfung der Rechnungen: 62 Zahlen im Auszug gelesen, ohne Abweichung.',
    ].join('\n')
    expect(gegenpruefungFehler(gut)).toEqual([])
    // Ehrliche Sätze im Text eines Eintrags bleiben grün
    for (const ehrlich of [
      'Alle 17 Funde sind berichtigt, kein Punkt ist noch offen.',
      'Die Prüfung besteht aus zwei Runden.',
      'Im Auszug steht ausdrücklich der Betrag.',
      'Das Ergebnis steht aus Sicht der zweiten Instanz fest.',
      'Zwei Auszüge wurden nachgereicht und gelesen.',
      'Auf Runde 2 folgt keine dritte Lesung.',
      'In Runde 2 offen geblieben ist nichts.',
      'Runde 1 geplant und am 10.11.2026 durchgeführt.',
    ]) {
      expect(gegenpruefungFehler(`${gut} ${ehrlich}`), ehrlich).toEqual([])
    }
    // Jede dieser Zeilen macht den Abschnitt rot: offene Runde in vielen Worten, Runde ohne Zahl, Zeile ohne Kopf
    for (const zeile of [
      '- 11.11.2026, Runde 3: steht aus.',
      '- 11.11.2026, Runde 3: 12 Stellen geprüft, das Ergebnis steht noch aus.',
      '- 11.11.2026, Runde 3: offen',
      '- 11.11.2026, Runde 3: in Arbeit',
      '- 11.11.2026, Runde 3: wird noch geprüft',
      '- 11.11.2026, Runde 3: begonnen',
      '- 11.11.2026, Runde 3: Die geänderten Stellen wurden gelesen.',
      '- 11.11.2026, Runde 3: 0 Aussagen geprüft',
      '- 11.11.2026, Runde 3: 0 von 80 Aussagen geprüft',
      '- 11.11.2026, Runde 3: Alle Aussagen geprüft',
      '- 11.11.2026, Nachtrag: offen',
      '- 11.11.2026, Nachtrag zur Rechtsprüfung: folgt',
      '- 11.11.2026, Gegenprüfung: offen',
      '- 11.11.2026, Zweite Runde: 12 Stellen geprüft',
      '- Runde 3: 12 Stellen geprüft',
      'Runde 3 läuft noch.',
      'Ergebnis: noch offen',
    ]) {
      expect(gegenpruefungFehler(`${gut}\n${zeile}`).length, zeile).toBeGreaterThan(0)
    }
    // Der Satz zum Abruftag darf eine nachgeholte Quelle mit ihrem Tag nennen, sonst nichts
    expect('Alle Dokumente abgerufen am 10. November 2026.').toMatch(NACH_QUELLEN_ERLAUBT)
    expect('Alle Dokumente abgerufen am 10. November 2026, die Mitteilung der Koelnmesse zur Finanzpressekonferenz am 11. November 2026.').toMatch(NACH_QUELLEN_ERLAUBT)
    expect('Alle Dokumente abgerufen am 10. November 2026. Die Abnahme kostet 9.999 Euro.').not.toMatch(NACH_QUELLEN_ERLAUBT)
    expect('Alle Dokumente abgerufen am 10. November 2026, die Abnahme kostet 9.999 Euro.').not.toMatch(NACH_QUELLEN_ERLAUBT)
    // Ohne Runde 1 und ohne Inhalt ist der Abschnitt nicht abgeschlossen
    expect(gegenpruefungFehler('- 10.11.2026, Runde 2: 30 Stellen geprüft.').length).toBe(1)
    expect(gegenpruefungFehler('').length).toBe(1)
    expect(gegenpruefungFehler('- Steht aus.').length).toBe(2)
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
      expect(datenOhneBeleg(vorab, protokolle[slug] ?? ''), 'Datum ohne ganzen Beleg').toEqual([])
    }
  })
})
