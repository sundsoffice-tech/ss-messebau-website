import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Warehouse, 
  CalendarDot, 
  Storefront, 
  Armchair,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Handshake,
  Target
} from '@phosphor-icons/react'
import { DEMO_REFERENCES } from '@/lib/demo-data'

interface HomePageProps {
  onOpenInquiry: () => void
}

export function HomePage({ onOpenInquiry }: HomePageProps) {
  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <section className="relative min-h-[600px] flex items-center hero-gradient overflow-hidden">
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600')] bg-cover bg-center opacity-20" />
        
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent text-accent-foreground">Full-Service Messebau mit Erfahrung</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Messestände, die verkaufen.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              S&S Messebau – Full-Service von Idee bis Abbau. Bundesweiter Messebau, Eventbau, Ladenbau – Planung, Logistik, Aufbau aus einer Hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onOpenInquiry}
                className="bg-accent hover:bg-accent/90 text-lg px-8 py-6"
              >
                Projekt anfragen
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleNavigation('/leistungen')}
                className="text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                Leistungen entdecken
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Warehouse,
                title: 'Messebau',
                description: 'Von Systemständen bis zu individuellen Konstruktionen – professionell und termingerecht.',
                link: '/leistungen'
              },
              {
                icon: CalendarDot,
                title: 'Eventbau',
                description: 'Bühnen, Präsentationsflächen und Eventausstattung für beeindruckende Veranstaltungen.',
                link: '/leistungen'
              },
              {
                icon: Storefront,
                title: 'Ladenbau',
                description: 'Showrooms und Verkaufsflächen, die Ihre Produkte optimal in Szene setzen.',
                link: '/leistungen'
              },
              {
                icon: Armchair,
                title: 'Böden & Möbel',
                description: 'Hochwertige Ausstattung: Messeboden, Möblierung, Beleuchtung und Technik.',
                link: '/leistungen'
              }
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation(service.link)}>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Warum S&S Messebau?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Drei entscheidende Vorteile, die uns zum idealen Partner für Ihren Messeauftritt machen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Full-Service aus einer Hand',
                description: 'Von der ersten Skizze über Produktion und Logistik bis zum kompletten Auf- und Abbau. Sie haben einen Ansprechpartner für alles.'
              },
              {
                icon: Handshake,
                title: 'Starkes Partnernetzwerk',
                description: 'Durch langjährige Kooperationen mit Logistikern, Materiallieferanten und Technikern bieten wir beste Qualität zu fairen Preisen.'
              },
              {
                icon: Target,
                title: 'Fokus auf Mittelstand',
                description: 'Spezialisiert auf 20-200 qm für mittelständische Unternehmen. Perfekt für Food, Versicherungen und Industriebetriebe.'
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

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Erfolgreiche Projekte</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Einige unserer realisierten Messestände und Eventbauten für zufriedene Kunden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_REFERENCES.map((reference) => (
              <Card key={reference.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNavigation('/referenzen')}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={reference.imageUrl} 
                    alt={reference.title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                    {reference.size}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{reference.branche === 'food' ? 'Food & Feinkost' : reference.branche === 'versicherungen' ? 'Versicherungen' : 'Industrie'}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{reference.title}</h3>
                  <p className="text-sm text-muted-foreground">{reference.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => handleNavigation('/referenzen')}>
              Alle Referenzen ansehen
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Das sagen unsere Kunden</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: 'Perfekter Stand, pünktlich aufgebaut und sehr professionell. Die Zusammenarbeit war unkompliziert und das Ergebnis überzeugt uns und unsere Messebesucher.',
                author: 'Michael Schmidt',
                company: 'Feinkost Meyer GmbH',
                rating: 5
              },
              {
                text: 'S&S Messebau hat uns von der ersten Planung bis zum Abbau begleitet. Absolut empfehlenswert für alle, die Wert auf Qualität und persönliche Betreuung legen.',
                author: 'Julia Bergmann',
                company: 'Allianz Regional',
                rating: 5
              },
              {
                text: 'Faire Preise, kreative Lösungen und ein Team, das mitdenkt. Unser Showroom ist genau so geworden, wie wir ihn uns vorgestellt haben.',
                author: 'Thomas Weber',
                company: 'TechnoPlast GmbH',
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

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit für Ihren perfekten Messeauftritt?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Kontaktieren Sie uns für ein unverbindliches Erstgespräch. Wir beraten Sie gerne zu Ihrem Projekt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onOpenInquiry}
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
