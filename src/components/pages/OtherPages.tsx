import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, Leaf, Recycle, TrendUp, ArrowRight } from '@phosphor-icons/react'
import { useSectionObserver } from '@/hooks/use-deep-linking'

export { KIBeraterPage } from './KIBeraterPage'

export function UeberUnsPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  useSectionObserver(['story', 'team', 'werte', 'arbeitsweise', 'vergleich'])

  return (
    <div>
      <section id="ueber-uns-hero" className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Über S&S Messebau – Ihr Partner aus NRW</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Seit vielen Jahren realisieren wir Messestände mit Leidenschaft und Präzision. 
            Als inhabergeführte GbR aus Mönchengladbach verbinden wir persönliche Betreuung mit professionellem Service.
          </p>
        </div>
      </section>

      <section id="story" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Unsere Geschichte</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Was als kleines Messebau-Unternehmen begann, ist heute ein etablierter 
                  Full-Service-Anbieter für Messebau, Eventbau und Ladenbau im gesamten Bundesgebiet.
                </p>
                <p>
                  Als GbR setzen wir auf kurze Entscheidungswege und persönliche Betreuung. Bei uns spricht 
                  Ihr Ansprechpartner direkt mit den Geschäftsführern – keine langen Hierarchien, keine Verzögerungen.
                </p>
                <p>
                  Durch ein starkes Netzwerk von langjährigen Partnern in Produktion, Logistik und Technik 
                  bieten wir die Professionalität großer Messebauer zu fairen Mittelstands-Konditionen.
                </p>
              </div>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&fm=webp&q=75"
                alt="Team"
                width="800"
                height="450"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Unser Team</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Als inhabergeführte GbR sind Fabrice Noel Schippers und Parampuneet Singh Ihre direkten Ansprechpartner 
            für alle Projektphasen – von der ersten Idee bis zum Abbau.
          </p>
        </div>
      </section>

      <section id="werte" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Unsere Werte</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Fairness',
                  desc: 'Transparente Preise, ehrliche Beratung, zuverlässige Umsetzung.'
                },
                {
                  title: 'Nachhaltigkeit',
                  desc: 'Wiederverwendbare Systeme, lokale Partner, langlebige Qualität.'
                },
                {
                  title: 'Partnerschaft',
                  desc: 'Langfristige Kundenbeziehungen statt einmaliger Transaktionen.'
                }
              ].map((value, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-xl mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </section>

      <section id="arbeitsweise" className="py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">So arbeiten wir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Persönlich', desc: 'Ein fester Ansprechpartner für Ihr gesamtes Projekt' },
                { title: 'Flexibel', desc: 'Anpassungsfähig auf Änderungen und besondere Wünsche' },
                { title: 'Zuverlässig', desc: 'Termingerechte Lieferung und professionelle Umsetzung' },
                { title: 'Transparent', desc: 'Klare Kommunikation über Kosten, Zeitpläne und Prozesse' },
                { title: 'Qualitätsorientiert', desc: 'Hochwertige Materialien und sorgfältige Verarbeitung' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" weight="fill" />
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section id="vergleich" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">S&S Messebau vs. Größere Konkurrenz</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Aspekt</th>
                    <th className="text-left p-4 font-semibold bg-primary/5">S&S Messebau</th>
                    <th className="text-left p-4 font-semibold">Größere Konkurrenz</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Angebots-Tempo</td>
                    <td className="p-4 bg-primary/5">48h-Angebot mit 3D-Visualisierung</td>
                    <td className="p-4">Oft 1–2 Wochen Wartezeit</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Spezialisierung</td>
                    <td className="p-4 bg-primary/5">Branchenexperte 20–200 m² (Food, Finance, Industrie)</td>
                    <td className="p-4">Alle Größen, Fokus auf Konzerne</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Struktur</td>
                    <td className="p-4 bg-primary/5">Inhabergeführt, kurze Wege</td>
                    <td className="p-4">GmbHs mit komplexen Teams</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Betreuung</td>
                    <td className="p-4 bg-primary/5">Ein fester Ansprechpartner</td>
                    <td className="p-4">Wechselnde Projektmanager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Preis-Leistung</td>
                    <td className="p-4 bg-primary/5">Effizient durch starkes Partnernetzwerk</td>
                    <td className="p-4">Hohe Kapazität, großer Fuhrpark, höhere Kosten</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Nachhaltigkeit</td>
                    <td className="p-4 bg-primary/5">Wiederverwendbare Systeme, 98% Termintreue</td>
                    <td className="p-4">Oft Einweg-Lösungen, variable Qualität</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Erfahrung</td>
                    <td className="p-4 bg-primary/5">Branchenübergreifende Erfahrung, bundesweit aktiv</td>
                    <td className="p-4">Große Portfolios, aber weniger persönliche Betreuung</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lernen Sie uns kennen</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Kontaktieren Sie uns für ein unverbindliches Kennenlerngespräch.
          </p>
          <Button 
            size="lg"
            onClick={onOpenInquiry}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Jetzt Kontakt aufnehmen
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function AblaufPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Ablauf – So entsteht Ihr Messestand</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Von der ersten Idee bis zur Nachsorge – so läuft ein Messeprojekt mit S&S Messebau ab.
          </p>
        </div>
      </section>

      <section id="timeline" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {[
              { 
                step: '1', 
                title: 'Erstgespräch & Briefing', 
                desc: 'Wir lernen Ihre Anforderungen, Ziele und Ihr Budget kennen. Gemeinsam definieren wir den Rahmen Ihres Projekts.' 
              },
              { 
                step: '2', 
                title: 'Konzept & Design', 
                desc: 'Unsere Designer entwickeln erste Entwürfe und 3D-Visualisierungen. Sie erhalten mehrere Varianten zur Auswahl.' 
              },
              { 
                step: '3', 
                title: 'Angebot & Planung', 
                desc: 'Sie erhalten ein detailliertes Angebot mit allen Positionen. Nach Freigabe starten wir die technische Detailplanung.' 
              },
              { 
                step: '4', 
                title: 'Produktion', 
                desc: 'Unsere Partner produzieren Ihren Stand mit hochwertigen Materialien. Sie erhalten regelmäßige Updates.' 
              },
              { 
                step: '5', 
                title: 'Logistik & Aufbau', 
                desc: 'Pünktlicher Transport zur Messe und professioneller Aufbau durch unser erfahrenes Team.' 
              },
              { 
                step: '6', 
                title: 'Betreuung & Service', 
                desc: 'Während der Messetage stehen wir bei technischen Fragen zur Verfügung.' 
              },
              { 
                step: '7', 
                title: 'Abbau & Nachsorge', 
                desc: 'Professioneller Abbau und optional Lagerung für die nächste Messe. Gemeinsame Auswertung des Messeerfolgs.' 
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    {item.step}
                  </div>
                  {index < 6 && <div className="w-0.5 h-full bg-border mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-lg text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Häufige Fragen</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: 'Was kostet ein Messestand?',
                  a: 'Die Kosten variieren je nach Größe und Ausstattung. Ein 50 qm Systemstand liegt bei ca. 25.000-35.000 €, individuelle Stände bei 600-1.200 €/qm. Kontaktieren Sie uns für ein individuelles Angebot.'
                },
                {
                  q: 'Wie lange dauert die Planung und Produktion?',
                  a: 'Von Briefing bis Fertigstellung rechnen Sie mit 8-12 Wochen. Bei Eilprojekten können wir auch schneller arbeiten.'
                },
                {
                  q: 'Bauen Sie auch im Ausland auf?',
                  a: 'Ja, wir realisieren Projekte bundesweit und in ganz Europa. Durch unser Partnernetzwerk sind auch internationale Projekte möglich.'
                },
                {
                  q: 'Können wir den Stand mehrfach verwenden?',
                  a: 'Absolut! Unsere Systeme sind für Mehrfachnutzung konzipiert. Wir lagern Ihre Elemente und passen sie für Folgemessen an.'
                },
                {
                  q: 'Was passiert, wenn während der Messe etwas kaputt geht?',
                  a: 'Wir bieten Service vor Ort und stehen bei technischen Problemen zur Verfügung. Kleinere Reparaturen führen wir sofort durch.'
                },
                {
                  q: 'Bieten Sie auch nur Teilleistungen an?',
                  a: 'Ja, Sie können einzelne Leistungen buchen – z.B. nur Design, nur Aufbau, oder nur Möbel. Wir sind flexibel.'
                },
                {
                  q: 'Welche Zahlungsbedingungen gelten?',
                  a: 'Üblicherweise 50% Anzahlung bei Auftragserteilung, 40% vor Messestart, 10% nach Abbau. Individuelle Vereinbarungen sind möglich.'
                },
                {
                  q: 'Können wir den Stand vorher sehen?',
                  a: 'Sie erhalten 3D-Visualisierungen. Bei größeren Projekten können wir auch Musteraufbauten in unserer Partnerwerkstatt organisieren.'
                },
                {
                  q: 'Was ist im Aufbau enthalten?',
                  a: 'Kompletter Aufbau inklusive Möbel, Beleuchtung, Technik. Nicht enthalten: Messeanschlüsse (Strom, Internet), Catering.'
                },
                {
                  q: 'Wie nachhaltig sind Ihre Stände?',
                  a: 'Wir setzen auf wiederverwendbare Systeme, lokale Partner und langlebige Materialien. Details finden Sie auf unserer Nachhaltigkeits-Seite.'
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit, Ihr Projekt zu starten?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lassen Sie uns über Ihr nächstes Messeprojekt sprechen.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Erstgespräch vereinbaren
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function NachhaltigkeitPage({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Leaf className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Nachhaltiger Messebau – Systembau & Wiederverwendung</h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">
            Messebau muss nicht Wegwerfkultur sein. Mit wiederverwendbaren Systemen, 
            lokalem Partnernetzwerk und intelligenter Planung schonen wir Umwelt und Budget.
          </p>
        </div>
      </section>

      <section id="systeme" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Recycle,
                title: 'Wiederverwendbare Systeme',
                desc: 'Unsere modularen Standsysteme werden mehrfach genutzt. Nach der Messe lagern wir Ihre Elemente für den nächsten Einsatz.'
              },
              {
                icon: TrendUp,
                title: 'Lokales Partnernetzwerk',
                desc: 'Kurze Transportwege durch regionale Partner in NRW und bundesweit. Das spart CO2 und Kosten.'
              },
              {
                icon: CheckCircle,
                title: 'Langlebige Qualität',
                desc: 'Hochwertige Materialien, die viele Messeeinsätze überstehen. Keine Billig-Lösungen für einmaligen Gebrauch.'
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" weight="fill" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="partnernetzwerk" className="py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Der Business-Vorteil</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Nachhaltigkeit rechnet sich – und zwar schnell.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Erste Messe (Neuanschaffung)</h4>
                  <p className="text-muted-foreground">50 qm System: ca. 30.000 €</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <h4 className="font-semibold mb-2">Zweite Messe (Wiederverwendung)</h4>
                  <p className="text-muted-foreground">Nur Logistik & Anpassungen: ca. 8.000 €</p>
                  <p className="text-sm text-primary font-semibold mt-2">→ 73% Ersparnis!</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <h4 className="font-semibold mb-2">Dritte+ Messe</h4>
                  <p className="text-muted-foreground">Weiterhin nur 6.000-8.000 € pro Messe</p>
                </div>
              </div>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800" 
                alt="Nachhaltigkeit"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="vorteile" className="py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Unsere nachhaltigen Maßnahmen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'FSC-zertifiziertes Holz aus nachhaltiger Forstwirtschaft',
                'LED-Beleuchtung (90% weniger Stromverbrauch)',
                'Recycelbare Materialien wo immer möglich',
                'Optimierte Transportplanung für weniger Fahrten',
                'Professionelle Lagerung statt Entsorgung',
                'Reparatur statt Neukauf bei Beschädigungen',
                'Digitale Planungsprozesse (papierlos)',
                'Lokale Lieferanten bevorzugt'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nachhaltig UND wirtschaftlich</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lassen Sie sich von uns zeigen, wie nachhaltige Messebau-Lösungen Ihr Budget schonen.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Nachhaltige Lösung anfragen
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function ImpressumPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Angaben gemäß § 5 TMG</h2>
            <p>
              S&S Messebau GbR<br />
              Fabrice Noel Schippers & Parampuneet Singh<br />
              Bonnenbroicherstraße 93<br />
              41238 Mönchengladbach<br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Vertretungsberechtigte Gesellschafter</h2>
            <p>
              Fabrice Noel Schippers<br />
              Parampuneet Singh
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Kontakt</h2>
            <p>
              Telefon: +49 176 31570041<br />
              E-Mail: sunds-messebau@gmx.de<br />
              Internet: www.sundsmessebau.de
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
              Wird auf Anfrage mitgeteilt
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Haftungsausschluss</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">Haftung für Inhalte</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DatenschutzPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Datenschutz auf einen Blick</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
              persönlich identifiziert werden können.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Datenerfassung auf dieser Website</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">Kontaktformular</h3>
            <p className="mb-4">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular 
              inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall 
              von Anschlussfragen bei uns gespeichert.
            </p>
            <p>
              Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Ihre Rechte</h2>
            <p className="mb-4">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, 
              deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder 
              Löschung dieser Daten.
            </p>
            <p>
              Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der 
              im Impressum angegebenen Adresse an uns wenden.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Kontakt</h2>
            <p>
              Verantwortlicher für die Datenverarbeitung:<br />
              S&S Messebau GbR<br />
              Fabrice Noel Schippers & Parampuneet Singh<br />
              Bonnenbroicherstraße 93<br />
              41238 Mönchengladbach<br />
              E-Mail: sunds-messebau@gmx.de
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
