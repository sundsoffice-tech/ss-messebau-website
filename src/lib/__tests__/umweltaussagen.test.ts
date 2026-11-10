import { describe, it, expect } from 'vitest'
import de from '@/locales/de.json'
import en from '@/locales/en.json'
import seitenInhalt from '../../../scripts/seiten-inhalt.json'
import startseite from '../../../index.html?raw'

/**
 * Umwelt- und Zahlenaussagen, die das Haus nicht belegen kann, bleiben draußen
 * (Prüfung Wettbewerbsrecht 10.11.2026, Funde A12 bis A16): Für CO₂-Ausgleich und FSC
 * liegt weder Zertifikat noch Lizenz vor, die Einsparzahlen stammen aus keinem Projekt.
 * Wer eine dieser Wendungen wieder einführt, braucht zuerst den Beleg und nimmt sie
 * dann hier aus der Liste.
 */

const deutsch = de as Record<string, string>
const englisch = en as Record<string, string>

// Jede Seite unter src/components/pages als Quelltext, ohne die Tests daneben.
const seiten = import.meta.glob(['../../components/pages/**/*.tsx', '!**/__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Geprüft wird der Text, den Besucher und Suchmaschinen bekommen; Schlüsselnamen zählen nicht. */
const quellen: Array<[string, string]> = [
  ['src/locales/de.json', Object.values(deutsch).join('\n')],
  ['src/locales/en.json', Object.values(englisch).join('\n')],
  ['scripts/seiten-inhalt.json', JSON.stringify(seitenInhalt, null, 1)],
  ['index.html', startseite],
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

describe('Umwelt- und Zahlenaussagen ohne Beleg (A12 bis A16)', () => {
  it('prüft die Sprachdateien, die vorab gebauten Texte und alle Seiten', () => {
    const namen = quellen.map(([datei]) => datei)
    expect(namen).toContain('src/components/pages/OtherPages.tsx')
    expect(namen).toContain('src/components/pages/LeistungenTourenPage.tsx')
    expect(namen.filter((n) => n.includes('__tests__'))).toEqual([])
    expect(quellen.length).toBeGreaterThan(20)
    for (const [datei, text] of quellen) expect(text.length, datei).toBeGreaterThan(100)
  })

  it('keine der gestrichenen Wendungen steht wieder da', () => {
    const funde = quellen.flatMap(([datei, text]) =>
      verboten.flatMap(([name, muster]) => (text.match(muster) || []).map((treffer) => `${datei}: ${name}: „${treffer}“`))
    )
    expect(funde).toEqual([])
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
      'Nachhaltige Systeme amortisieren sich ab der 2. Messe deutlich.',
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
