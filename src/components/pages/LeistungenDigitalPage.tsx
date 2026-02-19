import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  DeviceMobile,
  ArrowRight,
  Phone,
  CheckCircle,
  Star,
  Users,
  Lightning,
  Eye,
  Brain,
  ChartLine,
  Sparkle,
  CubeTransparent,
} from '@phosphor-icons/react'
import { navigate } from '@/lib/deep-linking'
import { useUIStore } from '@/store/ui-store'

export function LeistungenDigitalPage() {
  const { openInquiry } = useUIStore()
  const processSteps = [
    {
      step: 1,
      title: 'Anforderungsanalyse',
      desc: 'Wir analysieren Ihre Messeziele, Zielgruppe und bestehende Infrastruktur. Gemeinsam definieren wir, welche digitalen Lösungen den größten Mehrwert für Ihren Messeauftritt bieten.',
    },
    {
      step: 2,
      title: 'Technologieauswahl',
      desc: 'Basierend auf Ihren Anforderungen empfehlen wir die passenden Technologien – von AR/VR über Touchscreens bis hin zu Lead-Tracking-Systemen. Immer mit Fokus auf ROI und Besuchererlebnis.',
    },
    {
      step: 3,
      title: 'Entwicklung & Integration',
      desc: 'Unsere Entwickler setzen die digitalen Lösungen um und integrieren sie nahtlos in Ihr Standkonzept. Individuelle Programmierung, Content-Erstellung und Hardware-Setup inklusive.',
    },
    {
      step: 4,
      title: 'Testing & Qualitätssicherung',
      desc: 'Umfangreiche Tests aller digitalen Komponenten unter realen Bedingungen. Wir stellen sicher, dass alles reibungslos funktioniert – auch bei hoher Besucherfrequenz.',
    },
    {
      step: 5,
      title: 'Live-Support & Betreuung',
      desc: 'Während der Messe steht Ihnen unser technisches Team zur Verfügung. Echtzeit-Monitoring, sofortige Fehlerbehebung und Datenauswertung in Echtzeit.',
    },
  ]

  const techAreas = [
    {
      icon: CubeTransparent,
      title: 'AR/VR & Virtual Showrooms',
      desc: 'Immersive Markenerlebnisse mit Augmented und Virtual Reality. Virtuelle Produktdemos, 360°-Showrooms und interaktive 3D-Welten für unvergessliche Messeauftritte.',
    },
    {
      icon: DeviceMobile,
      title: 'Interaktive Displays & Touchscreens',
      desc: 'Großformatige Touchscreens, Multi-Touch-Tische und interaktive Videowände. Intuitive Benutzerführung für Produktpräsentationen und Katalogbrowsing.',
    },
    {
      icon: CheckCircle,
      title: 'Digitale Lead-Erfassung',
      desc: 'Automatisierte Besuchererfassung per QR-Code, NFC oder Badge-Scanner. Direkte CRM-Integration und Echtzeit-Auswertung Ihrer Messekontakte.',
    },
    {
      icon: Users,
      title: 'Social-Media-Integration',
      desc: 'Live Social-Media-Walls, Hashtag-Kampagnen und interaktive Fotostationen. Steigern Sie Ihre Reichweite und generieren Sie User-Generated-Content direkt auf der Messe.',
    },
    {
      icon: Eye,
      title: '3D-Konfiguratoren',
      desc: 'Lassen Sie Besucher Ihre Produkte in Echtzeit konfigurieren. Farben, Materialien und Optionen interaktiv erleben – direkt am Messestand.',
    },
    {
      icon: ChartLine,
      title: 'Datenanalyse & Reporting',
      desc: 'Umfassende Besucheranalysen, Heatmaps und Engagement-Metriken. Messen Sie den Erfolg Ihres digitalen Messeauftritts mit aussagekräftigen KPIs.',
    },
  ]

  const faqs = [
    {
      q: 'Welche digitalen Technologien eignen sich für Messestände?',
      a: 'Die Auswahl hängt von Ihren Zielen ab. Für Produktpräsentationen eignen sich interaktive Touchscreens und AR/VR-Lösungen. Für Lead-Generierung empfehlen wir digitale Erfassungssysteme mit CRM-Anbindung. Social-Media-Walls steigern die Reichweite. Wir beraten Sie individuell zur optimalen Technologiekombination.',
    },
    {
      q: 'Was kostet eine digitale Messelösung?',
      a: 'Einfache Touchscreen-Lösungen beginnen ab ca. 2.500 €. AR/VR-Erlebnisse starten bei ca. 5.000 €, umfassende Digital-Experience-Pakete mit Lead-Tracking ab ca. 8.000 €. Wir erstellen Ihnen ein individuelles Angebot basierend auf Ihren Anforderungen.',
    },
    {
      q: 'Funktionieren die digitalen Lösungen auch ohne stabiles WLAN auf der Messe?',
      a: 'Ja, unsere Lösungen sind für Messeumgebungen optimiert. Kernfunktionen laufen offline auf lokalen Systemen. Für Online-Features bringen wir bei Bedarf eigene Netzwerk-Infrastruktur mit – inklusive LTE-Backup.',
    },
    {
      q: 'Wie werden die gewonnenen Leads verarbeitet?',
      a: 'Alle erfassten Leads werden in Echtzeit in Ihr CRM-System übertragen. Wir unterstützen gängige Systeme wie Salesforce, HubSpot und Microsoft Dynamics. Nach der Messe erhalten Sie einen detaillierten Report mit allen Kontaktdaten und Interaktionsdaten.',
    },
    {
      q: 'Können bestehende Messestände mit digitalen Elementen nachgerüstet werden?',
      a: 'Absolut. Wir integrieren digitale Lösungen in bestehende Standkonzepte – vom einzelnen Touchscreen bis zur kompletten Digital-Experience. Eine Vorab-Begehung hilft uns, die optimale Integration zu planen.',
    },
    {
      q: 'Bieten Sie technischen Support während der Messe?',
      a: 'Ja, unser technisches Team ist während der gesamten Messelaufzeit vor Ort oder per Remote-Zugriff erreichbar. Wir überwachen alle Systeme in Echtzeit und reagieren sofort bei technischen Störungen.',
    },
  ]

  const testimonials = [
    {
      text: 'Die AR-Produktvisualisierung von S&S hat unseren Messestand zur Attraktion der gesamten Halle gemacht. Die Besucherverweildauer hat sich verdreifacht und wir haben 40% mehr Leads generiert als im Vorjahr.',
      author: 'Thomas Richter',
      company: 'AutoTech Innovations GmbH',
      rating: 5,
    },
    {
      text: 'Das digitale Lead-Tracking-System war ein Gamechanger. Alle Kontakte direkt im CRM, mit Gesprächsnotizen und Interessenprofil. Die Nachbearbeitung nach der Messe war so effizient wie nie zuvor.',
      author: 'Sandra Klein',
      company: 'PharmaCare AG',
      rating: 5,
    },
    {
      text: 'Die interaktive Social-Media-Wall hat für enormes Engagement gesorgt. Über 500 Posts mit unserem Hashtag während der drei Messetage – unbezahlbare Reichweite für unsere Marke.',
      author: 'Florian Hartmann',
      company: 'DigitalBrands GmbH',
      rating: 5,
    },
  ]

  const relatedPages = [
    { label: 'Messebau & Standkonzepte', hash: '/leistungen/messebau' },
    { label: 'Eventbau & Veranstaltungen', hash: '/leistungen/eventbau' },
    { label: 'Showroom & Ladenbau', hash: '/leistungen/showroom-ladenbau' },
    { label: 'Bannerrahmen-Systeme', hash: '/bannerrahmen' },
    { label: 'Alle Leistungen im Überblick', hash: '/leistungen' },
    { label: 'Kontakt & Beratung', hash: '/kontakt' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Digital Experience', current: true },
        ]} />
      </div>
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-primary text-white py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-bold mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}
            >
              Digital Experience – Technologie trifft Markenerlebnis
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Digitale Innovation für Ihren Messeauftritt: Von AR/VR-Erlebnissen über interaktive
              Touchscreens bis hin zu intelligentem Lead-Tracking – wir machen Ihre Messe
              zum digitalen Erlebnis mit messbarem Erfolg.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openInquiry}
                className="bg-white text-primary hover:bg-white/80"
              >
                Digitale Messelösung anfragen
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

      {/* USP Badge Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <CubeTransparent className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">AR/VR-Erlebnisse</p>
              <p className="text-xs text-muted-foreground">Immersive Technologie</p>
            </Card>
            <Card className="p-4 text-center">
              <DeviceMobile className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Interaktive Displays</p>
              <p className="text-xs text-muted-foreground">Touch & Gesture</p>
            </Card>
            <Card className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Lead-Tracking</p>
              <p className="text-xs text-muted-foreground">Automatisierte Erfassung</p>
            </Card>
            <Card className="p-4 text-center">
              <ChartLine className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Datenanalyse</p>
              <p className="text-xs text-muted-foreground">Echtzeit-Reporting</p>
            </Card>
            <Card className="p-4 text-center">
              <Lightning className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Zukunftstechnologie</p>
              <p className="text-xs text-muted-foreground">Innovative Lösungen</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leistungsübersicht Section */}
      <section id="leistungen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Digitale Messelösungen – Unsere Leistungen
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Wir verbinden modernste Technologie mit kreativem Messedesign. Unsere digitalen
            Lösungen machen Ihren Messestand zum interaktiven Erlebnis und liefern
            messbare Ergebnisse für Ihren Vertrieb.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: CubeTransparent,
                title: 'AR/VR-Lösungen',
                desc: 'Augmented und Virtual Reality für beeindruckende Produkterlebnisse. Virtuelle Showrooms, 3D-Produktdemos und immersive Markenwelten direkt am Messestand.',
              },
              {
                icon: DeviceMobile,
                title: 'Interaktive Touchscreens',
                desc: 'Großformatige Multi-Touch-Displays für Produktkataloge, Konfiguratoren und Präsentationen. Intuitive Bedienung für selbstgesteuerte Besuchererlebnisse.',
              },
              {
                icon: Brain,
                title: 'Digitale Besucherführung',
                desc: 'Intelligente Wegführung per App, Beacon-Technologie oder Digital Signage. Leiten Sie Besucher gezielt zu Ihren Highlights und optimieren Sie den Standfluss.',
              },
              {
                icon: CheckCircle,
                title: 'Lead-Capturing',
                desc: 'Digitale Kontakterfassung per QR-Code, NFC oder Badge-Scan. Automatische CRM-Synchronisation und Echtzeit-Benachrichtigung für Ihr Vertriebsteam.',
              },
              {
                icon: Sparkle,
                title: 'Social-Media-Walls',
                desc: 'Live-Feeds, Hashtag-Kampagnen und interaktive Fotostationen. Steigern Sie die Online-Reichweite Ihres Messeauftritts mit User-Generated-Content.',
              },
              {
                icon: Eye,
                title: '3D-Visualisierungen',
                desc: 'Fotorealistische 3D-Darstellungen und Echtzeit-Konfiguratoren. Besucher erleben Ihre Produkte interaktiv in allen Varianten und Perspektiven.',
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

      {/* Technologie-Bereiche Section */}
      <section id="technologien" className="py-12 sm:py-16 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Unsere Technologie-Bereiche
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Sechs Kernbereiche digitaler Messetechnologie – individuell kombinierbar
            für Ihren optimalen digitalen Messeauftritt.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {techAreas.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
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
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Ihr Weg zur digitalen Messelösung
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            In fünf Schritten zur maßgeschneiderten Digital Experience –
            von der Analyse bis zum Live-Support auf der Messe.
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
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Häufige Fragen zu digitalen Messelösungen
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Antworten auf die wichtigsten Fragen rund um Digital Experience, Kosten und Technologien.
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

      {/* Kundenstimmen Section */}
      <section id="referenzen" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Das sagen unsere Kunden
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-3xl mx-auto">
            Erfahrungen von Unternehmen, die mit unseren digitalen Messelösungen begeistern.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500" weight="fill" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <Separator className="my-4" />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interne Verlinkung Section */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            className="font-bold text-center mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
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
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2
            className="font-bold mb-6"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}
          >
            Bereit für die digitale Messe-Revolution?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam Ihren digitalen Messeauftritt planen. Kontaktieren Sie uns
            für eine unverbindliche Beratung und erfahren Sie, wie Technologie Ihren Messeerfolg steigert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={openInquiry}>
              <Lightning className="mr-2" />
              Digital-Paket anfragen
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
