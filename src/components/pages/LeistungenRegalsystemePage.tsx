import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowRight,
  Phone,
  Envelope,
  CheckCircle,
  Star,
  Shield,
  Package,
  PaintBrush,
  Ruler,
  Stack,
  Storefront,
  Wrench,
} from '@phosphor-icons/react'
import { navigate } from '@/lib/deep-linking'
import { useUIStore } from '@/store/ui-store'

export function LeistungenRegalsystemePage() {
  const { openInquiry } = useUIStore()

  const processSteps = [
    {
      step: 1,
      title: 'Anfrage & Beratung',
      desc: 'Sie schildern uns Ihre Anforderungen – Verkaufsraum, Ausstellung oder Lager. Wir beraten Sie zu Maßen, Materialien, Oberflächen und Traglasten.',
    },
    {
      step: 2,
      title: 'Maßaufnahme & Konzeption',
      desc: 'Wir nehmen die Räumlichkeiten auf und entwerfen Ihr Regalsystem passgenau – abgestimmt auf Sortiment, Warenpräsentation und Corporate Design.',
    },
    {
      step: 3,
      title: 'Individuelle Fertigung',
      desc: 'Ihr Regalsystem entsteht in Maßanfertigung: stabile Metallkonstruktionen, präzise gefertigt und vorbereitet für Ihre Wunschoberfläche.',
    },
    {
      step: 4,
      title: 'Oberfläche & Holzausbau',
      desc: 'Lackierung in Ihrer Wunschfarbe und hochwertige Holzverkleidungen bzw. Holzböden verleihen dem System seinen edlen, wertigen Charakter.',
    },
    {
      step: 5,
      title: 'Lieferung & Montage',
      desc: 'Wir liefern und montieren Ihr Regalsystem termingerecht vor Ort – sauber, sicher und einbaufertig, auf Wunsch inklusive Warenpräsentation.',
    },
  ]

  const systemTypes = [
    {
      title: 'Verkaufsregale',
      features: ['Edle lackierte Rahmen', 'Holzböden & -verkleidung', 'Warenträger nach Bedarf', 'Passend zum Ladendesign'],
    },
    {
      title: 'Präsentationsregale',
      features: ['Für Showroom & Ausstellung', 'Integrierbare Beleuchtung', 'Hochwertige Oberflächen', 'Flexibel bestückbar'],
    },
    {
      title: 'Wandregalsysteme',
      features: ['Raumhoch oder modular', 'Individuelle Rastermaße', 'Stabile Wandmontage', 'Holz-, Glas- oder Metallböden'],
    },
    {
      title: 'Mittelraum-Gondeln',
      features: ['Beidseitig nutzbar', 'Frei im Raum platzierbar', 'Auf Wunsch mobil (Rollen)', 'Kopfregale möglich'],
    },
    {
      title: 'Lager- & Schwerlastregale',
      features: ['Individuelle Maßanfertigung', 'Hohe Traglasten', 'An Raum & Ware angepasst', 'Robust & langlebig'],
    },
    {
      title: 'Sonderkonstruktionen',
      features: ['Freie Formen & Maße', 'Kombination Metall + Holz', 'Einzelstücke & Kleinserien', 'Nach Ihrer Idee gefertigt'],
    },
  ]

  const faqs = [
    {
      q: 'Was unterscheidet Ihre Regalsysteme von Standardregalen aus dem Handel?',
      a: 'Unsere Regalsysteme werden individuell für Sie geplant und gefertigt – millimetergenau auf Ihren Raum, Ihr Sortiment und Ihr Design abgestimmt. Statt Standardmaßen und Katalogoptik erhalten Sie ein Unikat: stabile Metallkonstruktionen, veredelt mit Lackierung in Wunschfarbe und hochwertigen Holzelementen.',
    },
    {
      q: 'Für welche Einsatzbereiche eignen sich die Regalsysteme?',
      a: 'Der Schwerpunkt liegt auf hochwertigen Regalen für Ladenbau, Showrooms und Ausstellungen – überall dort, wo Ware edel präsentiert werden soll. Darüber hinaus fertigen wir auch individuelle Lager- und Schwerlastregale, wenn Standardsysteme nicht passen.',
    },
    {
      q: 'Welche Materialien und Oberflächen sind möglich?',
      a: 'Die Tragkonstruktion besteht in der Regel aus Metall, lackiert in nahezu jeder RAL-Farbe – matt, seidenmatt oder glänzend. Kombiniert wird sie mit Holzböden und -verkleidungen in verschiedenen Holzarten und Dekoren. Auch Glasböden, LED-Beleuchtung und Rückwände sind möglich.',
    },
    {
      q: 'Können die Regale an unser Corporate Design angepasst werden?',
      a: 'Ja, das ist unsere Kernkompetenz. Farben, Materialien, Proportionen und Details stimmen wir vollständig auf Ihren Markenauftritt ab – vom Farbton der Lackierung bis zur Holzart der Böden. So fügt sich das Regalsystem nahtlos in Ihr Laden- oder Ausstellungskonzept ein.',
    },
    {
      q: 'Übernehmen Sie auch Lieferung und Montage?',
      a: 'Selbstverständlich. Wir liefern Ihr Regalsystem termingerecht und montieren es fachgerecht vor Ort – ob einzelnes Präsentationsregal oder komplette Ladeneinrichtung. Auf Wunsch kümmern wir uns auch um Demontage und Umbau bestehender Systeme.',
    },
    {
      q: 'Sind auch Einzelanfertigungen oder kleine Stückzahlen möglich?',
      a: 'Ja. Ob ein einzelnes Ausstellungsregal, eine Kleinserie für mehrere Filialen oder die komplette Regalausstattung eines Verkaufsraums – wir fertigen ab Stückzahl eins, individuell nach Ihren Anforderungen.',
    },
  ]

  const relatedPages = [
    { label: 'Showroom & Ladenbau', hash: '/leistungen/showroom-ladenbau' },
    { label: 'Messebau & Standgestaltung', hash: '/leistungen/messebau' },
    { label: 'Böden & Ausstattung', hash: '/leistungen/boeden-ausstattung' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Regalsysteme & Sonderbau', current: true },
        ]} />
      </div>
      {/* Hero Section */}
      <section id="hero" className="hero-gradient text-white py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6 heading-1"
            >
              Regalsysteme & Sonderbau – Maßgefertigte Regale für Laden, Ausstellung & Lager
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Edle, lackierte Regalsysteme mit hochwertigen Holzböden und -verkleidungen –
              individuell geplant und gefertigt für Verkaufsräume, Showrooms und Ausstellungen.
              Auf Wunsch auch maßgeschneiderte Lager- und Warensysteme. Vom Einzelstück bis
              zur kompletten Ladeneinrichtung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openInquiry}
                className="bg-white text-primary hover:bg-white/80"
              >
                Jetzt Regalsystem anfragen
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openInquiry}
                className="bg-transparent border-white text-white hover:bg-white/25"
              >
                <Phone className="mr-2" />
                Kostenlose Beratung
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bildgalerie – Regalsysteme */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="group rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary sm:row-span-2">
              <img
                src="/images/regalsysteme/regalsysteme-vierkant-regal-komplett.jpg"
                alt="Freistehendes maßgefertigtes Regalsystem mit Vierkantrohr-Stahlrahmen in Schwarz und massiven Holzböden – Komplettansicht"
                width="640"
                height="960"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full aspect-[2/3] sm:aspect-auto group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="group rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
              <img
                src="/images/regalsysteme/regalsysteme-vierkantrohr-stahl-holz.jpg"
                alt="Detail: geschweißter Vierkantrohr-Stahlrahmen in Schwarz mit massiver Holzbohle"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full aspect-video group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="group rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 hover:border-primary">
              <img
                src="/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg"
                alt="Display-Regal mit LED-Beleuchtung – Ladenbau-Projekt von S&S Messebau"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                className="object-cover w-full h-full aspect-video group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* USP Badge Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <Ruler className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Maßanfertigung</p>
              <p className="text-xs text-muted-foreground">Millimetergenau geplant</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-primary" weight="fill" />
              <p className="font-semibold text-sm">Edle Oberflächen</p>
              <p className="text-xs text-muted-foreground">Lackierung & Holz</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Eigene Fertigung</p>
              <p className="text-xs text-muted-foreground">Qualität aus einer Hand</p>
            </Card>
            <Card className="p-4 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Lieferung & Montage</p>
              <p className="text-xs text-muted-foreground">Einbaufertig vor Ort</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Langlebig & robust</p>
              <p className="text-xs text-muted-foreground">Stabile Konstruktionen</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leistungsübersicht Section */}
      <section id="leistungen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4 heading-2"
          >
            Regalsysteme & Sonderbau – Unsere Leistungen im Detail
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Vom edlen Präsentationsregal für Ihren Verkaufsraum bis zum maßgeschneiderten
            Lagersystem – wir planen, fertigen und montieren Regalsysteme, die exakt zu
            Ihrem Raum, Ihrer Ware und Ihrer Marke passen.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Storefront,
                title: 'Ladenbau-Regale',
                desc: 'Hochwertige Verkaufs- und Warenregale für Einzelhandel und Filialen – lackierte Konstruktionen mit edlen Holzböden, abgestimmt auf Ihr Ladenkonzept.',
              },
              {
                icon: Star,
                title: 'Ausstellungs- & Präsentationsregale',
                desc: 'Regalsysteme für Showrooms, Ausstellungen und Messestände, die Ihre Produkte perfekt in Szene setzen – auf Wunsch mit integrierter Beleuchtung.',
              },
              {
                icon: Stack,
                title: 'Individuelle Warensysteme',
                desc: 'Maßgeschneiderte Systeme für die strukturierte Warenpräsentation und -lagerung – angepasst an Sortiment, Abläufe und verfügbare Fläche.',
              },
              {
                icon: Package,
                title: 'Lager- & Schwerlastregale',
                desc: 'Wenn Standardregale nicht passen: individuell gefertigte Lagerregale mit hohen Traglasten – exakt auf Raum, Ware und Logistik zugeschnitten.',
              },
              {
                icon: PaintBrush,
                title: 'Oberflächen & Holzausbau',
                desc: 'Lackierung in nahezu allen RAL-Farben, kombiniert mit Holzböden und -verkleidungen in verschiedenen Holzarten – für einen wertigen Auftritt.',
              },
              {
                icon: Ruler,
                title: 'Sonderkonstruktionen',
                desc: 'Freie Formen, ungewöhnliche Maße, besondere Ideen – wir entwickeln und fertigen Sonderlösungen vom Einzelstück bis zur Kleinserie.',
              },
            ].map((item, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System-Typen Section */}
      <section id="systeme" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4 heading-2"
          >
            Regaltypen im Überblick
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Für jeden Einsatzzweck das passende System – vom repräsentativen
            Verkaufsregal bis zur robusten Lagerlösung.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {systemTypes.map((type, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">{type.title}</h3>
                  <ul className="space-y-2">
                    {type.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" weight="fill" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf/Prozess Section */}
      <section id="prozess" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4 heading-2"
          >
            Ihr Weg zum maßgefertigten Regalsystem
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf Schritten von der Idee zum fertig montierten Regalsystem –
            persönlich betreut von der Beratung bis zur Übergabe.
          </p>

          <div className="max-w-4xl mx-auto space-y-6">
            {processSteps.map((item, index) => (
              <div key={item.step} className="flex gap-4 sm:gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg sm:text-xl">
                    {item.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-6 sm:pb-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4 heading-2"
          >
            Häufige Fragen zu Regalsystemen & Sonderbau
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um maßgefertigte Regal- und Warensysteme.
          </p>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Interne Verlinkung Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4 heading-2"
          >
            Weitere Leistungen entdecken
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Entdecken Sie unser gesamtes Leistungsspektrum für Ihren Markenauftritt.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {relatedPages.map((page, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-between min-h-[48px]"
                onClick={() => navigate(page.hash)}
              >
                {page.label}
                <ArrowRight className="ml-2 shrink-0" />
              </Button>
            ))}
            <Button
              variant="ghost"
              className="justify-between min-h-[48px] text-muted-foreground"
              onClick={() => navigate('/leistungen')}
            >
              ← Zurück zur Übersicht
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2
            className="font-bold mb-6 heading-2"
          >
            Bereit für Ihr maßgefertigtes Regalsystem?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam das perfekte Regal- oder Warensystem für Ihren
            Verkaufsraum, Ihre Ausstellung oder Ihr Lager entwickeln. Kontaktieren Sie
            uns für eine unverbindliche Beratung und ein individuelles Angebot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={openInquiry}>
              <Envelope className="mr-2" />
              Angebot anfordern
            </Button>
            <Button size="lg" variant="outline" onClick={openInquiry}>
              <Phone className="mr-2" />
              Rückruf vereinbaren
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
