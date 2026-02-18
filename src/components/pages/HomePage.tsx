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
import { DEMO_REFERENCES } from '@/lib/demo-references'
import { useTranslation } from '@/lib/i18n'
import { useDeepLinking, useSectionObserver } from '@/hooks/use-deep-linking'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { USPBadges } from '@/components/ui/USPBadge'
import { GuaranteeBanner } from '@/components/ui/GuaranteeBanner'
import { FactBar } from '@/components/ui/FactBar'
import { LogoWall } from '@/components/ui/LogoWall'
import { ProcessTimeline } from '@/components/ui/ProcessTimeline'
import { trackHeroCTAClick, trackReferenceDetailView } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking } from '@/hooks/use-analytics'
import { useUIStore } from '@/store/ui-store'

export function HomePage() {
  const { t } = useTranslation()
  const { openInquiry } = useUIStore()
  useDeepLinking('/')
  
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

  const getBrancheLabel = (branche: string) => {
    switch (branche) {
      case 'messebau': return t('referenzen.filter.messebau')
      case 'eventbau': return t('referenzen.filter.eventbau')
      case 'ladenbau': return t('referenzen.filter.ladenbau')
      case 'sport': return t('referenzen.filter.sport')
      default: return branche
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'messebau': return t('referenzen.filter.messebau')
      case 'eventbau': return t('referenzen.filter.eventbau')
      case 'ladenbau': return t('referenzen.filter.ladenbau')
      default: return type
    }
  }

  const handleServiceNavigation = (sectionId: string) => {
    window.location.hash = `/leistungen/${sectionId}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          alt={t('home.hero.alt')}
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
            <Badge className="mb-4 sm:mb-6 bg-accent text-accent-foreground text-sm">{t('home.hero.badge')}</Badge>
            <h1 id="hero-heading" className="font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>
              {t('home.hero.title')}
            </h1>
            <p className="text-white/90 mb-5 sm:mb-6 leading-relaxed max-w-2xl" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', lineHeight: '1.5' }}>
              {t('home.hero.subtitle')}
            </p>
            <div className="mb-5 sm:mb-6">
              <USPBadges />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                onClick={() => { trackHeroCTAClick('hero'); openInquiry() }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 sm:px-8 py-6 text-base sm:text-lg font-medium min-h-[48px]"
                aria-label={t('home.hero.ctaAria')}
              >
                {t('home.hero.cta')}
                <ArrowRight className="ml-2" aria-hidden="true" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleNavigation('/leistungen')}
                className="px-6 sm:px-8 py-6 text-base sm:text-lg font-medium bg-white/10 text-white border-white/30 hover:bg-white/20 min-h-[48px]"
                aria-label={t('home.hero.secondaryAria')}
              >
                {t('home.hero.secondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <GuaranteeBanner />

      <FactBar />

      <section id="services" className="py-12 sm:py-16 bg-muted" aria-labelledby="services-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="services-heading" className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('home.services.title')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('home.services.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Warehouse,
                title: t('home.services.messebau.title'),
                description: t('home.services.messebau.desc'),
                bullets: [
                  t('home.services.messebau.b1'),
                  t('home.services.messebau.b2'),
                  t('home.services.messebau.b3'),
                  t('home.services.messebau.b4')
                ],
                sectionId: 'messebau',
                image: '/images/deligreece-messestand-100qm-food.jpeg'
              },
              {
                icon: CalendarDot,
                title: t('home.services.touren.title'),
                description: t('home.services.touren.desc'),
                bullets: [
                  t('home.services.touren.b1'),
                  t('home.services.touren.b2'),
                  t('home.services.touren.b3'),
                  t('home.services.touren.b4')
                ],
                sectionId: 'touren',
                image: '/images/49546524-e641-43fd-8c29-79a94e05bf99.jpeg'
              },
              {
                icon: Storefront,
                title: t('home.services.showrooms.title'),
                description: t('home.services.showrooms.desc'),
                bullets: [
                  t('home.services.showrooms.b1'),
                  t('home.services.showrooms.b2'),
                  t('home.services.showrooms.b3'),
                  t('home.services.showrooms.b4')
                ],
                sectionId: 'showroom-ladenbau',
                image: '/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg'
              }
            ].map((service, index) => {
              const Icon = service.icon
              const isUnsplashImage = service.image.includes('unsplash.com')
              return (
                <Card 
                  key={index} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary" 
                  onClick={() => handleServiceNavigation(service.sectionId)}
                >
                  <div className="relative aspect-[25/16] overflow-hidden bg-muted">
                    <img 
                      src={isUnsplashImage ? `${service.image}&fm=webp&q=75` : service.image}
                      srcSet={isUnsplashImage ? `${service.image}&fm=webp&q=75&w=400 400w, ${service.image}&fm=webp&q=75&w=500 500w, ${service.image}&fm=webp&q=75&w=640 640w` : undefined}
                      sizes={isUnsplashImage ? "(max-width: 1023px) 100vw, 33vw" : undefined}
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
                      aria-label={`${t('home.services.moreAbout')} ${service.title}`}
                    >
                      <span>{t('home.services.more')}</span>
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
            <h2 className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('home.advantages.title')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('home.advantages.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: t('home.advantages.offer.title'),
                description: t('home.advantages.offer.desc')
              },
              {
                icon: Target,
                title: t('home.advantages.specialist.title'),
                description: t('home.advantages.specialist.desc')
              },
              {
                icon: Handshake,
                title: t('home.advantages.expert.title'),
                description: t('home.advantages.expert.desc')
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
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('home.references.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.references.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_REFERENCES.slice(0, 3).map((reference) => {
              const isUnsplashImage = reference.imageUrl.includes('unsplash.com')
              return (
                <Card 
                  key={reference.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary active:scale-[0.98]" 
                  onClick={() => { trackReferenceDetailView(reference.id); handleNavigation('/referenzen') }}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={isUnsplashImage ? `${reference.imageUrl}&fm=webp&q=75` : reference.imageUrl}
                      srcSet={isUnsplashImage ? `${reference.imageUrl}&fm=webp&q=75&w=400 400w, ${reference.imageUrl}&fm=webp&q=75&w=640 640w, ${reference.imageUrl}&fm=webp&q=75&w=800 800w` : undefined}
                      sizes={isUnsplashImage ? "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" : undefined}
                      alt={reference.title}
                      width="640"
                      height="360"
                      loading="lazy"
                      decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Badge className="absolute top-4 left-4 bg-background/95 text-foreground shadow-lg backdrop-blur-sm">
                    {reference.size}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium drop-shadow-lg flex items-center gap-2">
                      {t('referenzen.details')}
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{getBrancheLabel(reference.branche)}</Badge>
                    <Badge variant="outline">{getTypeLabel(reference.type)}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{reference.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{reference.description}</p>
                </CardContent>
              </Card>
            )
            })}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => handleNavigation('/referenzen')}>
              {t('home.references.viewAll').replace('{count}', String(DEMO_REFERENCES.length))}
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <ProcessTimeline />

      <LogoWall />

      <section id="testimonials" className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('home.testimonials.title')}</h2>
            <p className="text-lg text-muted-foreground mb-4">
              {t('home.testimonials.subtitle')}
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
                {t('home.testimonials.google')}
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: t('home.testimonials.t1.text'),
                author: t('home.testimonials.t1.author'),
                company: t('home.testimonials.t1.company'),
                rating: 5
              },
              {
                text: t('home.testimonials.t2.text'),
                author: t('home.testimonials.t2.author'),
                company: t('home.testimonials.t2.company'),
                rating: 5
              },
              {
                text: t('home.testimonials.t3.text'),
                author: t('home.testimonials.t3.author'),
                company: t('home.testimonials.t3.company'),
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
        title={t('home.links.title')}
        links={[
          { label: t('home.links.services.label'), description: t('home.links.services.desc'), hash: '/leistungen' },
          { label: t('home.links.branchen.label'), description: t('home.links.branchen.desc'), hash: '/branchen' },
          { label: t('home.links.references.label'), description: t('home.links.references.desc'), hash: '/referenzen' },
          { label: t('home.links.process.label'), description: t('home.links.process.desc'), hash: '/ablauf' },
          { label: t('home.links.sustainability.label'), description: t('home.links.sustainability.desc'), hash: '/nachhaltigkeit' },
          { label: t('home.links.about.label'), description: t('home.links.about.desc'), hash: '/ueber-uns' },
          { label: t('home.links.blog.label'), description: t('home.links.blog.desc'), hash: '/blog' },
          { label: t('home.links.banner.label'), description: t('home.links.banner.desc'), hash: '/bannerrahmen' },
          { label: t('home.links.contact.label'), description: t('home.links.contact.desc'), hash: '/kontakt' },
        ]}
      />

      <section id="cta" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('home.cta.title')}</h2>
          <p className="text-xl font-semibold mb-4 opacity-95">{t('home.cta.subtitle')}</p>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            {t('home.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => { trackHeroCTAClick('cta_section'); openInquiry() }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {t('home.cta.button')}
              <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => handleNavigation('/kontakt')}
              className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              {t('home.cta.contact')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
