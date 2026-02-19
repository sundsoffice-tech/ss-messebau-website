import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Package, Truck, Shield, Wrench, Star, ArrowRight } from '@phosphor-icons/react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useTranslation } from '@/lib/i18n'
import { navigate } from '@/lib/deep-linking'
import { useUIStore } from '@/store/ui-store'

export function BannerrahmenPage() {
  const { t } = useTranslation()
  const { openInquiry } = useUIStore()

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <Breadcrumbs items={[
          { label: 'Leistungen', path: '/leistungen' },
          { label: 'Bannerrahmen', current: true },
        ]} />
      </div>
      <section className="hero-gradient text-white py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-bold mb-6" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: '1.2' }}>
              {t('bannerrahmen.hero.title')}
            </h1>
            <p className="text-xl mb-8 text-white/90">
              {t('bannerrahmen.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/banner-bestellen')}
                className="bg-white text-primary hover:bg-white/80"
              >
                {t('bannerrahmen.hero.configureCta')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={openInquiry}
                className="bg-transparent border-white text-white hover:bg-white/25"
              >
                {t('bannerrahmen.hero.consultationCta')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="p-4 text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{t('bannerrahmen.badges.delivery.title')}</p>
              <p className="text-xs text-muted-foreground">{t('bannerrahmen.badges.delivery.subtitle')}</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{t('bannerrahmen.badges.nationwide.title')}</p>
              <p className="text-xs text-muted-foreground">{t('bannerrahmen.badges.nationwide.subtitle')}</p>
            </Card>
            <Card className="p-4 text-center">
              <Check className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{t('bannerrahmen.badges.quality.title')}</p>
              <p className="text-xs text-muted-foreground">{t('bannerrahmen.badges.quality.subtitle')}</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{t('bannerrahmen.badges.certified.title')}</p>
              <p className="text-xs text-muted-foreground">{t('bannerrahmen.badges.certified.subtitle')}</p>
            </Card>
            <Card className="p-4 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{t('bannerrahmen.badges.fullService.title')}</p>
              <p className="text-xs text-muted-foreground">{t('bannerrahmen.badges.fullService.subtitle')}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-center mb-12" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('bannerrahmen.systems.title')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('bannerrahmen.systems.hanging.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('bannerrahmen.systems.hanging.description')}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.hanging.feature1')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.hanging.feature2')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.hanging.feature3')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/b0f59ab1-307b-4e5c-8d15-63eb0d5ae122.jpeg"
                  alt="Standrahmen-System – freistehender Bannerrahmen"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('bannerrahmen.systems.standing.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('bannerrahmen.systems.standing.description')}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.standing.feature1')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.standing.feature2')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.standing.feature3')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('bannerrahmen.systems.cladding.title')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('bannerrahmen.systems.cladding.description')}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.cladding.feature1')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.cladding.feature2')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('bannerrahmen.systems.cladding.feature3')}</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-center mb-12" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('bannerrahmen.materials.title')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('bannerrahmen.materials.frontlit.title')}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('bannerrahmen.materials.frontlit.weight')}</p>
              <p className="text-sm">
                {t('bannerrahmen.materials.frontlit.description')}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('bannerrahmen.materials.blockout.title')}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('bannerrahmen.materials.blockout.weight')}</p>
              <p className="text-sm">
                {t('bannerrahmen.materials.blockout.description')}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('bannerrahmen.materials.mesh.title')}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('bannerrahmen.materials.mesh.weight')}</p>
              <p className="text-sm">
                {t('bannerrahmen.materials.mesh.description')}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">{t('bannerrahmen.materials.backlit.title')}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('bannerrahmen.materials.backlit.weight')}</p>
              <p className="text-sm">
                {t('bannerrahmen.materials.backlit.description')}
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">{t('bannerrahmen.materials.options.title')}</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t('bannerrahmen.materials.options.fireProtection')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t('bannerrahmen.materials.options.ledLighting')}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>{t('bannerrahmen.materials.options.graphicService')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-center mb-12" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Häufige Fragen zu Bannerrahmen</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: 'Welche Größen sind bei Bannerrahmen möglich?', a: 'Unsere Bannerrahmen sind in nahezu allen Größen erhältlich – von kompakten 0,5 × 1 m bis zu großflächigen Formaten wie 5 × 3 m. Sondermaße realisieren wir auf Anfrage.' },
              { q: 'Wie schnell kann ein Bannerrahmen geliefert werden?', a: 'Standardformate liefern wir innerhalb von 5–7 Werktagen. Bei Eilaufträgen sind Express-Lieferungen innerhalb von 48 Stunden möglich.' },
              { q: 'Sind die Bannerrahmen für den Außenbereich geeignet?', a: 'Ja, wir bieten wetterfeste Bannerrahmen und Materialien, die speziell für den Outdoor-Einsatz konzipiert sind – inklusive Windschlitzen und UV-beständigem Druck.' },
              { q: 'Kann ich nur das Banner oder auch den Rahmen einzeln bestellen?', a: 'Beides ist möglich. Sie können komplette Sets oder einzelne Banner zum Wechseln bestellen – ideal für wechselnde Kampagnen und Messen.' },
              { q: 'Bieten Sie auch Montage-Service an?', a: 'Ja, unser Full-Service umfasst bundesweite Montage, Demontage und bei Bedarf auch die Einlagerung Ihrer Bannerrahmen-Systeme.' }
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Kundenstimmen */}
      <section className="py-12 sm:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-center mb-12" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>Das sagen unsere Kunden</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { text: 'Die Bannerrahmen von S&S sind top verarbeitet und lassen sich supereinfach montieren. Wir nutzen sie auf allen unseren Messen.', author: 'Thomas K.', role: 'Marketing-Leiter, Food-Branche' },
              { text: 'Schnelle Lieferung, perfekte Qualität und ein Grafikservice, der mitdenkt. Unser Go-to-Partner für alle Bannerprojekte.', author: 'Sandra M.', role: 'Eventmanagerin, Versicherungsbranche' },
              { text: 'Wir haben die Bannerrahmen mit LED-Hinterleuchtung bestellt – der Wow-Effekt auf der Messe war enorm. Klare Empfehlung!', author: 'Michael R.', role: 'Geschäftsführer, Industrieunternehmen' }
            ].map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-500" weight="fill" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">„{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Links / Verwandte Bereiche */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-center mb-8" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', lineHeight: '1.2' }}>Verwandte Leistungsbereiche</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <button onClick={() => navigate('/leistungen/messebau')} className="group text-left">
              <Card className="p-5 h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                <Package className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Messebau</h3>
                <p className="text-xs text-muted-foreground">Professionelle Messestände – individuell geplant</p>
              </Card>
            </button>
            <button onClick={() => navigate('/leistungen/boeden-ausstattung')} className="group text-left">
              <Card className="p-5 h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                <Wrench className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Böden & Ausstattung</h3>
                <p className="text-xs text-muted-foreground">Premium-Bodenbeläge und Möblierung</p>
              </Card>
            </button>
            <button onClick={() => navigate('/banner-bestellen')} className="group text-left">
              <Card className="p-5 h-full transition-all group-hover:border-primary group-hover:shadow-lg border-primary/50">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Banner bestellen</h3>
                <p className="text-xs text-muted-foreground">Jetzt Banner online konfigurieren</p>
              </Card>
            </button>
            <button onClick={() => navigate('/leistungen')} className="group text-left">
              <Card className="p-5 h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                <ArrowRight className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-1">Alle Leistungen</h3>
                <p className="text-xs text-muted-foreground">Übersicht aller Leistungsbereiche</p>
              </Card>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('bannerrahmen.cta.title')}</h2>
          <p className="text-lg mb-8 opacity-90">
            {t('bannerrahmen.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/banner-bestellen')}
              className="bg-white text-primary hover:bg-white/80"
            >
              {t('bannerrahmen.cta.configureCta')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={openInquiry}
              className="bg-transparent border-white text-white hover:bg-white/25"
            >
              {t('bannerrahmen.cta.consultationCta')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
