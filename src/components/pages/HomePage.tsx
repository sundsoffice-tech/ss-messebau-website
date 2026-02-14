import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Warehouse, 
  CalendarDot, 
  Storefront, 
  CheckCircle,
  ArrowRight,
  Star,
  Handshake,
  Target
} from '@phosphor-icons/react'
import { DEMO_REFERENCES } from '@/lib/demo-data'
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { USPBadges } from '@/components/ui/USPBadge'
import { GuaranteeBanner } from '@/components/ui/GuaranteeBanner'
import { FactBar } from '@/components/ui/FactBar'
import { LogoWall } from '@/components/ui/LogoWall'
import { ProcessTimeline } from '@/components/ui/ProcessTimeline'
import { trackHeroCTAClick, trackReferenceDetailView } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking } from '@/hooks/use-analytics'

interface HomePageProps {
  onOpenInquiry: () => void
}

export function HomePage({ onOpenInquiry }: HomePageProps) {
  const { navigateToSectionOnPage } = useDeepLinking('/')
  
  useSectionObserver([
    'hero',
    'services',
    'advantages',
    'references',
    'process',
    'testimonials',
    'cta'
  ])

  useScrollDepthTracking('home')
  useDwellTimeTracking('home')

  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSectionNavigation = (sectionId: string) => {
    navigateToSectionOnPage('/leistungen', sectionId)
  }

  return (
    <div>
      <section 
        id="hero"
        className="relative min-h-[500px] sm:min-h-[600px] flex items-center hero-gradient overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 hero-overlay" />
        <img
          src="/images/hero-messebau-startseite.jpg"
          alt="Professioneller Messebau von S&S Messebau – Messestände, Events und Ladenbau aus Mönchengladbach"
          width="1920"
          height="1080"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{ objectPosition: 'center 25%' }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4 sm:mb-6 bg-accent text-accent-foreground text-sm">S&S Messebau – Ihr Messestand-Partner aus NRW</Badge>
            <h1 id="hero-heading" className="font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>
              Messestände 20–200 m², die Ihre Marke verkaufen.
            </h1>
            <p className="text-white/90 mb-5 sm:mb-6 leading-relaxed max-w-2xl" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', lineHeight: '1.5' }}>
              S&S Messebau – 48h-Angebot mit 3D-Visualisierung. Full-Service Messebau, Eventbau & Showrooms für Food, Finance und Industrie – bundesweit aus NRW.
            </p>
            <div className="mb-5 sm:mb-6">
              <USPBadges />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                onClick={() => { trackHeroCTAClick('hero'); onOpenInquiry() }}
                className="bg-accent hover:bg-accent/90 px-6 sm:px-8 py-6 text-base sm:text-lg font-medium min-h-[48px]"
                aria-label="Projekt anfragen - Formular öffnen"
              >
                Projekt anfragen
                <ArrowRight className="ml-2" aria-hidden="true" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleNavigation('/leistungen')}
                className="px-6 sm:px-8 py-6 text-base sm:text-lg font-medium bg-white/10 text-white border-white/30 hover:bg-white/20 min-h-[48px]"
                aria-label="Zu den Leistungen navigieren"
              >
                Leistungen entdecken
              </Button>
            </div>
          </div>
        </div>
      </section>

      <GuaranteeBanner onOpenInquiry={onOpenInquiry} />

      <FactBar />

      <section id="services" className="py-12 sm:py-16 bg-muted" aria-labelledby="services-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="services-heading" className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Unsere Leistungen</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Drei Leistungsbereiche, ein Ansprechpartner: Full-Service Messebau als Kernleistung, skalierbare Tourenlösungen für wiederkehrende Auftritte und professionelle Showrooms & Brand Spaces – alles kostenoptimiert aus einer Hand.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Warehouse,
                title: 'Full-Service Messebau',
                description: 'Ihre Kernleistung aus einer Hand – von der ersten Idee über Produktion und Logistik bis zur Lagerung für den nächsten Einsatz.',
                bullets: [
                  'Planung, Entwurf und 3D-Visualisierung',
                  'Produktion, Logistik, Aufbau & Abbau',
                  'Lagerung und Wiederverwendung von Standbauteilen',
                  'Technische Betreuung und Service vor Ort'
                ],
                sectionId: 'messebau',
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=320&fit=crop'
              },
              {
                icon: CalendarDot,
                title: 'Touren & wiederkehrende Messeauftritte',
                description: 'Skalierbare Systemlösungen für viele kleine Messen und Roadshows – zentral koordiniert ab NRW, bundesweit verfügbar.',
                bullets: [
                  'Zentrale Logistik ab NRW – kurze Wege, schnelle Reaktion',
                  'Wiederverwendbare Systemstände, mehrfach einsetzbar',
                  'Kostenoptimierte Routen- und Aufbauplanung',
                  'Skalierbare Pakete für die gesamte DACH-Region'
                ],
                sectionId: 'touren',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=320&fit=crop'
              },
              {
                icon: Storefront,
                title: 'Showrooms & Brand Spaces',
                description: 'Showrooms, Markenerlebnisräume und Brand Spaces – Planung und Ausführung mit demselben Facharbeiter-Team, das Sie aus dem Messebau kennen.',
                bullets: [
                  'Showrooms, Brand Spaces und Erlebnisräume',
                  'Planung und Ausführung aus einer Hand',
                  'Einsatz desselben Monteur-Teams wie im Messebau',
                  'Langfristig effiziente und kostenoptimierte Lösungen'
                ],
                sectionId: 'showrooms',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=320&fit=crop'
              }
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <Card 
                  key={index} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary" 
                  onClick={() => handleSectionNavigation(service.sectionId)}
                >
                  <div className="relative aspect-[25/16] overflow-hidden bg-muted">
                    <img 
                      src={`${service.image}&fm=webp&q=75`}
                      srcSet={`${service.image}&fm=webp&q=75&w=400 400w, ${service.image}&fm=webp&q=75&w=500 500w, ${service.image}&fm=webp&q=75&w=640 640w`}
                      sizes="(max-width: 1023px) 100vw, 33vw"
                      alt=""
                      role="presentation"
                      width="500"
                      height="320"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary shadow-lg">
                        <Icon className="h-6 w-6" weight="duotone" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <h3 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)' }}>
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      {service.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" weight="fill" />
                          <span className="text-sm leading-relaxed">{bullet}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group/btn hover:bg-primary/5 mt-2"
                      aria-label={`Mehr erfahren über ${service.title}`}
                    >
                      <span>Mehr erfahren</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="advantages" className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Warum S&S Messebau?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Drei entscheidende Vorteile, die uns zum idealen Partner für Ihren Messeauftritt machen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: '48h-Angebot mit 3D-Visualisierung',
                description: 'Innerhalb von 48 Stunden erhalten Sie ein kalkuliertes Angebot inklusive 3D-Visualisierung Ihres Messestands – für schnelle Entscheidungen.'
              },
              {
                icon: Target,
                title: 'Spezialist für 20–200 m²',
                description: 'Fokussiert auf Messestände für mittelständische Unternehmen. Perfekt für Food, Finance und Industriebranchen – ohne Agentur-Overhead.'
              },
              {
                icon: Handshake,
                title: 'Branchenexperte mit Netzwerk',
                description: 'Tiefe Branchenkenntnis in Food (Anuga, ISM), Versicherungen (DKM) und Industrie (Hannover Messe) – plus starkes Partnernetzwerk für beste Qualität.'
              }
            ].map((advantage, index) => {
              const Icon = advantage.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" weight="fill" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="references" className="py-12 sm:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Referenzen</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ausgewählte Projekte aus Food, Finance & Industrie – von 20 bis 200 m².
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_REFERENCES.slice(0, 3).map((reference) => (
              <Card 
                key={reference.id} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary" 
                onClick={() => { trackReferenceDetailView(reference.id); handleNavigation('/referenzen') }}
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={`${reference.imageUrl}&fm=webp&q=75`}
                    srcSet={`${reference.imageUrl}&fm=webp&q=75&w=400 400w, ${reference.imageUrl}&fm=webp&q=75&w=640 640w, ${reference.imageUrl}&fm=webp&q=75&w=800 800w`}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    alt={reference.title}
                    width="640"
                    height="360"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Badge className="absolute top-4 left-4 bg-background/95 text-foreground shadow-lg">
                    {reference.size}
                  </Badge>
                  {reference.messe && (
                    <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground shadow-lg text-xs">
                      {reference.messe}
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium drop-shadow-lg">Mehr erfahren →</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{reference.branche === 'food' ? 'Food & Feinkost' : reference.branche === 'versicherungen' ? 'Versicherungen' : 'Industrie'}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{reference.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{reference.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => handleNavigation('/referenzen')}>
              Alle {DEMO_REFERENCES.length} Referenzen ansehen
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <ProcessTimeline onOpenInquiry={onOpenInquiry} />

      <LogoWall />

      <section id="testimonials" className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Das sagen unsere Kunden</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Echte Bewertungen von echten Kunden
            </p>
            <Button 
              variant="outline" 
              asChild
              className="gap-2"
            >
              <a 
                href="https://www.google.com/search?q=sundsmessebau" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Star className="h-4 w-4 text-yellow-500" weight="fill" />
                Alle Google-Bewertungen ansehen
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: 'Perfekter Stand, pünktlich aufgebaut und sehr professionell. Die Zusammenarbeit war unkompliziert und das Ergebnis überzeugt uns und unsere Messebesucher.',
                author: 'M. S.',
                company: 'Lebensmittelbranche',
                rating: 5
              },
              {
                text: 'S&S Messebau hat uns von der ersten Planung bis zum Abbau begleitet. Absolut empfehlenswert für alle, die Wert auf Qualität und persönliche Betreuung legen.',
                author: 'J. B.',
                company: 'Versicherungsbranche',
                rating: 5
              },
              {
                text: 'Faire Preise, kreative Lösungen und ein Team, das mitdenkt. Unser Showroom ist genau so geworden, wie wir ihn uns vorgestellt haben.',
                author: 'T. W.',
                company: 'Industrieunternehmen',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500" weight="fill" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
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

      <InternalLinkSection
        title="Alles über S&S Messebau"
        links={[
          { label: 'Leistungen im Detail', description: 'Messebau, Eventbau, Showrooms & Brand Spaces – alle Services.', hash: '/leistungen' },
          { label: 'Branchen-Expertise', description: 'Spezialisiert auf Food, Finance & Industrie.', hash: '/branchen' },
          { label: 'Referenzen ansehen', description: 'Realisierte Projekte von 20–200 m² im Überblick.', hash: '/referenzen' },
          { label: 'Unser Ablauf', description: 'Vom Erstgespräch bis zum Abbau – so arbeiten wir.', hash: '/ablauf' },
          { label: 'Nachhaltiger Messebau', description: 'Systembau und Wiederverwendung für die Umwelt.', hash: '/nachhaltigkeit' },
          { label: 'Über S&S Messebau', description: 'Inhabergeführt, persönlich, bundesweit.', hash: '/ueber-uns' },
          { label: 'Blog & Ratgeber', description: 'Tipps und Insights rund um den Messeauftritt.', hash: '/blog' },
          { label: 'Kontakt aufnehmen', description: '48h-Angebot mit 3D-Visualisierung anfordern.', hash: '/kontakt' },
        ]}
      />

      <section id="cta" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Kontakt</h2>
          <p className="text-xl font-semibold mb-4 opacity-95">Bereit für Ihren perfekten Messeauftritt?</p>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Kontaktieren Sie uns für ein unverbindliches Erstgespräch. Wir beraten Sie gerne zu Ihrem Projekt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => { trackHeroCTAClick('cta_section'); onOpenInquiry() }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Jetzt Projekt anfragen
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => handleNavigation('/kontakt')}
              className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              Kontakt aufnehmen
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
