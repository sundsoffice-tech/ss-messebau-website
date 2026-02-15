import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Package, Truck, Shield, Wrench } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

interface BannerrahmenPageProps {
  onOpenInquiry: () => void
}

export function BannerrahmenPage({ onOpenInquiry }: BannerrahmenPageProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
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
                onClick={() => window.location.hash = '/banner-bestellen'}
                className="bg-white text-primary hover:bg-white/90"
              >
                {t('bannerrahmen.hero.configureCta')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenInquiry}
                className="border-white text-white hover:bg-white/10"
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
              <div className="h-48 bg-secondary rounded-lg mb-4 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
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

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{t('bannerrahmen.cta.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('bannerrahmen.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.hash = '/banner-bestellen'}
            >
              {t('bannerrahmen.cta.configureCta')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenInquiry}
            >
              {t('bannerrahmen.cta.consultationCta')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
