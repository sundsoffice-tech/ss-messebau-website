import { describe, it, expect } from 'vitest'
import de from '@/locales/de.json'
import en from '@/locales/en.json'
import seitenInhalt from '../../../scripts/seiten-inhalt.json'
import startseite from '../../../index.html?raw'
import { DEMO_BLOG_POSTS } from '../demo-blog-posts'
import messeDaten from '../messe-data.ts?raw'
import seitenMeta from '../seiten-meta.json'
import seitenMetaEn from '../seiten-meta-en.json'

/**
 * Umwelt- und Zahlenaussagen, die das Haus nicht belegen kann, bleiben draußen
 * (Prüfung Wettbewerbsrecht 10.11.2026, Funde A12 bis A16): Für CO₂-Ausgleich und FSC
 * liegt weder Zertifikat noch Lizenz vor, die Einsparzahlen stammen aus keinem Projekt.
 * Wer eine dieser Wendungen wieder einführt, braucht zuerst den Beleg und nimmt sie
 * dann hier aus der Liste.
 *
 * Seit der Prüfung von PR #252 (Abschnitte 3.5 und 4.1) laufen auch der Blogbeitrag
 * „nachhaltiger-messebau“, die Meldungen, die Seitentitel sowie Kopf und Fuß der Seite mit.
 */

const deutsch = de as Record<string, string>
const englisch = en as Record<string, string>

// Jede Seite unter src/components/pages als Quelltext, ohne die Tests daneben; dazu Kopf und Fuß.
const seiten = import.meta.glob(
  ['../../components/pages/**/*.tsx', '../../components/Header.tsx', '../../components/Footer.tsx', '!**/__tests__/**'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
) as Record<string, string>

// Vom Blog läuft nur dieser eine Beitrag mit, abgegrenzt über seinen Slug: Die übrigen Beiträge sind
// redaktionelle Texte mit eigenen Zahlen und nicht geprüft; sie würden den Test rot machen.
const BLOG_SLUG = 'nachhaltiger-messebau'
const BLOG = `src/lib/demo-blog-posts.ts (${BLOG_SLUG})`
const beitrag = DEMO_BLOG_POSTS.find((p) => p.slug === BLOG_SLUG)
const beitragText = beitrag ? [beitrag.title, beitrag.excerpt, beitrag.category, beitrag.content].join('\n') : ''

/** Geprüft wird der Text, den Besucher und Suchmaschinen bekommen; Schlüsselnamen zählen nicht. */
// Die vorab gebauten Blogtexte laufen als eigene Quelle, damit eine Ausnahme nur sie trifft.
const inhalt = seitenInhalt as Record<string, unknown>
const inhaltOhneBlog = Object.fromEntries(Object.entries(inhalt).filter(([pfad]) => !pfad.startsWith('/blog/')))
const inhaltBlog = Object.fromEntries(Object.entries(inhalt).filter(([pfad]) => pfad.startsWith('/blog/')))

const quellen: Array<[string, string]> = [
  ['src/locales/de.json', Object.values(deutsch).join('\n')],
  ['src/locales/en.json', Object.values(englisch).join('\n')],
  ['scripts/seiten-inhalt.json', JSON.stringify(inhaltOhneBlog, null, 1)],
  ['scripts/seiten-inhalt.json (Blog)', JSON.stringify(inhaltBlog, null, 1)],
  ['index.html', startseite],
  [BLOG, beitragText],
  ['src/lib/messe-data.ts', messeDaten],
  ['src/lib/seiten-meta.json', JSON.stringify(seitenMeta, null, 1)],
  ['src/lib/seiten-meta-en.json', JSON.stringify(seitenMetaEn, null, 1)],
  ...Object.entries(seiten).map(([pfad, text]): [string, string] => [pfad.replace(/^(\.\.\/)+/, 'src/'), text]),
]

const verboten: Array<[string, RegExp]> = [
  // A12: Ausgleich und CO₂-Wirkung ohne Vertrag und Zertifikat
  ['CO₂-Aussage', /\bCO[₂2]/gi],
  ['klimaneutral, klimabewusst', /klimaneutral|klimabewusst|climate[- ](neutral|conscious)|carbon[- ]neutral/gi],
  // A13: FSC ist eine Marke, Werbung damit braucht Lizenz und Lieferbeleg
  ['FSC', /\bFSC\b/g],
  // A14: absolute und allgemeine Umweltaussagen
  ['keine Teile landen im Müll', /landen im Müll|end up in the trash/gi],
  ['kein Einweg, keine Verschwendung', /kein Einweg|keine Verschwendung|no disposables|no waste\b/gi],
  ['Nachhaltigkeit als Standard', /Nachhaltigkeit ist bei uns Standard|Sustainability Is Our Standard/gi],
  ['jeder Stand ein Nachhaltigkeitsprojekt', /Stand ein Nachhaltigkeitsprojekt|stand (is )?a sustainability project/gi],
  ['ressourcenschonend', /ressourcenschonend|schont Ressourcen|resource-efficiently by default/gi],
  ['Verweis auf Zertifikate', /(Fakten|Details) und Zertifikate|facts and certificates/gi],
  [
    'Wirkung auf die Umwelt',
    /schon(en|t) (wir |gleichzeitig )?(die )?Umwelt|Umwelt und Budget|gut für (die )?Umwelt|für die Umwelt|protect(ing)? the environment|(good )?for the environment/gi,
  ],
  ['umweltbewusst', /umweltbewusst|environmentally conscious|eco-conscious/gi],
  // Nachzug nach der Prüfung von PR #252: Zusagen und Merkmale, für die kein Beleg vorliegt
  ['Herkunftsnachweis', /Herkunftsnachweis|proof of origin/gi],
  ['recycelbar', /recycelbar|recyclable/gi],
  ['papierlos', /papierlos|paperless/gi],
  ['ökologisch', /ökologisch|ecological/gi],
  // Blogbeitrag (Prüfung 3.5): eigene Fälle ohne Projekt, Fahrzeuge der Partner, Rat zum ESG-Profil
  ['Praxisbeispiele aus unserem Alltag', /Praxisbeispiele aus unserem Alltag/gi],
  ['Wir bauten', /\bWir bauten\b/gi],
  ['CNG', /\bCNG\b/g],
  ['ESG', /\bESG\b/g],
  ['amortisier', /amortisier|amorti[sz](e[sd]?|ing|ation)\b/gi],
  // A15: Einsparzahlen ohne Projektbeleg
  ['bis zu 60 % Material', /bis zu 60 ?%|up to 60 ?%/gi],
  ['73 % als Tatsache', /73 ?% (Ersparnis|savings)/gi],
  ['LED 90 % weniger Strom', /90 ?% (weniger Stromverbrauch|less power)/gi],
  ['bis zu 30 % Kostenersparnis', /bis zu 30 ?% Kostenersparnis|up to 30 ?% cost savings/gi],
  ['30 bis 50 % der Gesamtkosten', /30\s?[–-]\s?50 ?% der Gesamtkosten/gi],
  ['bis 50 % sparen', /bis (zu )?50 ?% sparen/gi],
  ['Amortisation ab der 2. Messe', /nachhaltige Systeme amortisieren|sustainable systems pay for themselves/gi],
  // A16: Ergebniszahlen und eigene Produkte in den Beispielkästen
  ['Use Case', /Use Case/gi],
  ['40 % mehr qualifizierte Leads', /40 ?% (mehr qualifizierte Leads|more qualified leads)/gi],
  ['+55 % mehr Interaktionen', /\+ ?55 ?%/g],
  ['Effizienz +65 %', /\+ ?65 ?%/g],
  [
    'VR-Showroom, Heatmap-Analyse, KI-Chatbot als eigenes Produkt',
    /unseren VR-Showroom|unsere Heatmap-Analyse|unseren KI-Chatbot|our VR showroom|our heatmap analysis|our AI chatbot/gi,
  ],
]

/**
 * Bekannte Reste als Quelle, Wendung und Zahl der Stellen, alle im Blogbeitrag „nachhaltiger-messebau“.
 * Die Zahl hält die Ausnahme eng: Kommt eine Stelle dazu oder fällt eine weg, wird der Test rot.
 * Trifft eine Ausnahme nichts mehr: die Zeile hier entfernen.
 */
const ausnahmen: Array<[string, string, number]> = [
  // Urteil „bleibt“ (Prüfung 3.5): Allgemeinwissen über Transport und Aluminium, keine Aussage über das Haus
  // („Wege und CO₂ reduzieren“, „spart Transport-CO₂“, „Das unterschätzte CO₂-Potenzial“, „= mehr CO₂“,
  // „Zu fast 100 % recycelbar“).
  [BLOG, 'CO₂-Aussage', 4],
  [BLOG, 'recycelbar', 1],
  // Urteil „bleibt“ (Prüfung des Blog-Stands, 10.11.2026): „Die Investition amortisiert sich über nur eine Messe“
  // ist eine Wertung über eine Bauart, keine Zusage des Hauses.
  [BLOG, 'amortisier', 1],
]
const istAusnahme = (datei: string, name: string) => ausnahmen.some(([d, n]) => d === datei && n === name)

describe('Umwelt- und Zahlenaussagen ohne Beleg (A12 bis A16)', () => {
  it('prüft die Sprachdateien, die vorab gebauten Texte und alle Seiten', () => {
    const namen = quellen.map(([datei]) => datei)
    expect(namen).toContain('src/components/pages/OtherPages.tsx')
    expect(namen).toContain('src/components/pages/LeistungenTourenPage.tsx')
    expect(namen).toContain('src/components/Header.tsx')
    expect(namen).toContain('src/components/Footer.tsx')
    expect(namen).toContain(BLOG)
    expect(namen).toContain('src/lib/messe-data.ts')
    expect(namen).toContain('src/lib/seiten-meta.json')
    expect(namen).toContain('src/lib/seiten-meta-en.json')
    expect(namen.filter((n) => n.includes('__tests__'))).toEqual([])
    expect(quellen.length).toBeGreaterThan(20)
    for (const [datei, text] of quellen) expect(text.length, datei).toBeGreaterThan(100)
  })

  it('keine der gestrichenen Wendungen steht wieder da', () => {
    const funde = quellen.flatMap(([datei, text]) =>
      verboten
        .filter(([name]) => !istAusnahme(datei, name))
        .flatMap(([name, muster]) => (text.match(muster) || []).map((treffer) => `${datei}: ${name}: „${treffer}“`))
    )
    expect(funde).toEqual([])
  })

  it('jede Ausnahme wird noch gebraucht und trifft nur ihre bekannten Stellen', () => {
    const abweichend = ausnahmen
      .map(([datei, name, erwartet]) => {
        const text = quellen.find(([d]) => d === datei)?.[1] ?? ''
        const muster = verboten.find(([n]) => n === name)?.[1]
        const gefunden = muster ? (text.match(new RegExp(muster.source, muster.flags)) || []).length : 0
        return `${datei}: ${name}: erwartet ${erwartet}, gefunden ${gefunden}`
      })
      .filter((zeile) => !/erwartet (\d+), gefunden \1$/.test(zeile) || / gefunden 0$/.test(zeile))
    expect(abweichend).toEqual([])
  })

  it('die Liste erkennt jede Wendung am alten Wortlaut', () => {
    // Gegenprobe: Die Muster müssen die Sätze treffen, wie sie bis 10.11.2026 auf der Seite standen.
    const alt = [
      'Unsere Transportfahrten gleichen wir mit zertifiziertem CO₂-Ausgleich aus – für einen klimabewussten Messeauftritt.',
      'Das spart CO2 und Kosten.',
      'FSC-zertifiziertes Holz aus nachhaltiger Forstwirtschaft',
      'Unser Team tankt mit CO₂-Ausgleich, keine Teile landen im Müll',
      'kein Einweg, keine Verschwendung.',
      'Nachhaltigkeit ist bei uns Standard',
      'Bei S&S Messebau ist jeder Stand ein Nachhaltigkeitsprojekt.',
      'wir bauen standardmäßig ressourcenschonend.',
      'Das spart Kosten und schont Ressourcen.',
      'Details, Fakten und Zertifikate zu unserem nachhaltigen Ansatz',
      'und schonen gleichzeitig die Umwelt.',
      'für umweltbewusste Auftritte.',
      'spart bis zu 60 % Material.',
      '→ 73% Ersparnis!',
      'LED-Beleuchtung (90% weniger Stromverbrauch)',
      'Bis zu 30% Kostenersparnis',
      'durchschnittlich 30–50 % der Gesamtkosten',
      'Bis 50 % sparen',
      'Holzwerkstoffe mit Herkunftsnachweis auf Wunsch',
      'Wood-based materials with proof of origin on request',
      'Recycelbare Materialien wo immer möglich',
      'Recyclable materials wherever possible',
      'Digitale Planungsprozesse (papierlos)',
      'Digital planning processes (paperless)',
      'Nachhaltige Messestände sind nicht nur ökologisch sinnvoll',
      'Nachhaltige Systeme amortisieren sich ab der 2. Messe deutlich.',
      '## Praxisbeispiele aus unserem Alltag',
      'Wir bauten einen modularen Stand, der bei der großen Messe 6x6m ist',
      'Wir nutzen Logistik-Partner mit modernen Fahrzeugen (CNG, elektrifiziert)',
      'Euer ESG-Profil verbessert sich (wichtig für große Unternehmen)',
      'Amortisiert sich über 2–3 Messeauftritte',
      'The system amortizes after three shows',
      '💡 Use Case: VR-Showroom für internationales Publikum',
      'Ergebnis: 40% mehr qualifizierte Leads',
      'Nach Layout-Anpassung: +55% mehr Interaktionen',
      'Effizienz +65%.',
      'setzte unseren KI-Chatbot ein',
      'no parts end up in the trash',
      'This saves our clients up to 60% of materials – while protecting the environment.',
      'Find details, facts and certificates about our sustainable approach',
    ]
    const durchgerutscht = alt.filter((satz) => !verboten.some(([, muster]) => new RegExp(muster.source, muster.flags).test(satz)))
    expect(durchgerutscht).toEqual([])
    // Die fünf Muster zum Blogbeitrag treffen je ihren eigenen alten Satz, nicht nur ein Nachbarmuster.
    const eigene: Array<[string, string]> = [
      ['Praxisbeispiele aus unserem Alltag', '## Praxisbeispiele aus unserem Alltag'],
      ['Wir bauten', 'Wir bauten einen modularen Stand'],
      ['CNG', 'modernen Fahrzeugen (CNG, elektrifiziert)'],
      ['ESG', 'Euer ESG-Profil verbessert sich'],
      ['amortisier', 'Amortisiert sich über 2–3 Messeauftritte'],
    ]
    for (const [name, satz] of eigene) {
      const muster = verboten.find(([n]) => n === name)?.[1]
      expect(muster && new RegExp(muster.source, muster.flags).test(satz), name).toBe(true)
    }
  })

  it('der Blogbeitrag führt seine Zahlen als Rechenbeispiele und rechnet sie aus der eigenen Preisangabe', () => {
    const text = beitrag?.content ?? ''
    const euro = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    // Preisangabe des Hauses: individuelle Stände 600 bis 1.200 €/qm (Sprachdatei, FAQ zum Ablauf).
    expect(deutsch['ablauf.faq.a1']).toContain('600-1.200 €/qm')
    const [von, bis, qm, messen] = [600, 1200, 3 * 3, 5]
    expect(text).toContain('**Rechenbeispiel mit angenommenen Preisen (3x3m Stand, 9 qm, 5 Messen):**')
    expect(text).toContain(`kostet ${euro(von)} bis ${euro(bis)} € je qm`)
    expect(text).toContain(`${qm} qm × ${euro(von)} € = ${euro(qm * von)} €`)
    expect(text).toContain(`${qm} qm × ${euro(bis)} € = ${euro(qm * bis)} €`)
    expect(text).toContain(`Systemstand = 8.000 € + ${messen} × 2.000 € = ${euro(8000 + messen * 2000)} €`)
    expect(text).toContain(
      `Individualstand = ${messen} × ${euro(qm * von)} € bis ${messen} × ${euro(qm * bis)} € = ${euro(messen * qm * von)} € bis ${euro(messen * qm * bis)} €`
    )
    // Die alte Preisbehauptung der Stelle und der Ersatz, der an einer Bestätigung des Inhabers hängt, stehen nicht da.
    expect(text).not.toMatch(/15\.000 € pro Messe|75\.000 €|ca\. 9\.000 € pro Messe|~45\.000 €/)

    // Die drei Beispiele: Überschrift, Annahme im Präsens, nachgerechnete Summen.
    const von2 = text.indexOf('## Drei Rechenbeispiele')
    const bis2 = text.indexOf('## Die häufigsten Einwände')
    expect(von2).toBeGreaterThan(0)
    expect(bis2).toBeGreaterThan(von2)
    const beispiele = text.slice(von2, bis2)
    expect(beispiele.match(/^Angenommen, ein /gm)).toHaveLength(3)
    expect(beispiele).not.toMatch(/\b(wollte|hatte vorher|bauten|wurden|Unser nachhaltiger Ansatz)\b/)
    expect(beispiele).toContain(`**Ersparnis im Beispiel:** ${euro(4 * 18000 - (12000 + 4 * 2500))} € im ersten Jahr`)
    const [banner, led] = [4 * 3000 + 500, 4 * 500]
    expect(beispiele).toContain(`Bannerdruck ${euro(banner)} €, LED-Wand ${euro(12000 + led)} € (12.000 € + ${euro(led)} €)`)
    expect(beispiele).toContain(
      `Bannerdruck ${euro(2 * banner)} €, LED-Wand ${euro(12000 + 2 * led)} € – ${euro(2 * banner - 12000 - 2 * led)} € weniger`
    )
    expect(beispiele).toContain('**Ergebnis:** ein Stand statt zwei, eine Lagerung, weniger Abfall.')
  })

  it('der vorab gebaute Blogtext trägt die Überschriften und den ersten Absatz des Beitrags', () => {
    const vorab = inhalt[`/blog/${BLOG_SLUG}`] as { absaetze: string[]; abschnitte: string[] }
    const ueberschriften = (beitrag?.content ?? '').match(/^## .+$/gm)?.map((z) => z.slice(3)) ?? []
    expect(ueberschriften).toContain('Drei Rechenbeispiele')
    expect(vorab.abschnitte.filter((a) => a !== 'Verwandte Artikel')).toEqual(ueberschriften)
    for (const absatz of vorab.absaetze) expect(beitrag?.content, absatz).toContain(absatz)
  })

  it.each([
    ['de', deutsch],
    ['en', englisch],
  ])('%s: der Verweis auf die Nachhaltigkeits-Seite und die Seite selbst nennen kein Zertifikat', (_sprache, texte) => {
    const stellen = Object.entries(texte)
      .filter(([schluessel]) => schluessel === 'leistungen.sustainability.outro' || schluessel.startsWith('nachhaltigkeit.'))
      .filter(([, text]) => /zertifi|certif/i.test(text))
      .map(([schluessel]) => schluessel)
    expect(stellen).toEqual([])
    expect(texte['leistungen.sustainability.outro']).toBeTruthy()
  })

  it('die 73 Prozent stehen als Rechenbeispiel mit beiden Beträgen da', () => {
    const erste = 30000
    const zweite = 8000
    expect(Math.round(((erste - zweite) / erste) * 100)).toBe(73)
    expect(deutsch['nachhaltigkeit.business.first.price']).toContain('30.000')
    expect(deutsch['nachhaltigkeit.business.second.price']).toContain('8.000')
    expect(deutsch['nachhaltigkeit.business.second.savings']).toMatch(/^Rechenbeispiel: 73 % weniger/)
    expect(deutsch['nachhaltigkeit.business.second.savings']).toContain('8.000 €')
    expect(deutsch['nachhaltigkeit.business.second.savings']).toContain('30.000 €')
    expect(englisch['nachhaltigkeit.business.first.price']).toContain('30,000')
    expect(englisch['nachhaltigkeit.business.second.price']).toContain('8,000')
    expect(englisch['nachhaltigkeit.business.second.savings']).toMatch(/^Sample calculation: 73% less/)
    expect(englisch['nachhaltigkeit.business.second.savings']).toContain('€8,000')
    expect(englisch['nachhaltigkeit.business.second.savings']).toContain('€30,000')
  })

  it.each(['arvr', 'tracking', 'interactive'])('Beispielkasten %s heißt Beispielszenario und nennt keine Ergebniszahl', (bereich) => {
    expect(deutsch[`leistungen.digital.${bereich}.useCaseTitle`]).toContain('Beispielszenario:')
    expect(englisch[`leistungen.digital.${bereich}.useCaseTitle`]).toContain('Example Scenario:')
    for (const texte of [deutsch, englisch]) {
      expect(texte[`leistungen.digital.${bereich}.useCaseText`]).not.toMatch(/\d\s?%/)
      expect(texte[`leistungen.digital.${bereich}.useCaseText`]).not.toMatch(/\b(unser|our)/i)
    }
  })
})
