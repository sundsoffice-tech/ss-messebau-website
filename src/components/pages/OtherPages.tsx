import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, Leaf, Recycle, TrendUp, ArrowRight } from '@phosphor-icons/react'
import { useSectionObserver } from '@/hooks/use-deep-linking'
import { useTranslation } from '@/lib/i18n'
import { useUIStore } from '@/store/ui-store'

export { KIBeraterPage } from './KIBeraterPage'

export function UeberUnsPage() {
  useSectionObserver(['story', 'team', 'werte', 'arbeitsweise', 'vergleich'])
  const { t } = useTranslation()
  const { openInquiry } = useUIStore()

  return (
    <div>
      <section id="ueber-uns-hero" className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-bold mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>{t('about.hero.title')}</h1>
          <p className="text-base sm:text-lg opacity-90 max-w-3xl leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="story" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="font-bold mb-4 sm:mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.story.title')}</h2>
              <div className="space-y-4 text-base sm:text-lg text-muted-foreground">
                <p>
                  {t('about.story.p1')}
                </p>
                <p>
                  {t('about.story.p2')}
                </p>
                <p>
                  {t('about.story.p3')}
                </p>
              </div>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="/images/49546524-e641-43fd-8c29-79a94e05bf99.jpeg"
                alt="Einer unserer Event-Aufbauten – EuroHockey Championships Mönchengladbach"
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

      <section id="team" className="py-12 sm:py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.team.title')}</h2>
          <p className="text-base sm:text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            {t('about.team.desc')}
          </p>
        </div>
      </section>

      <section id="werte" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.werte.title')}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                { title: t('about.werte.v1.title'), desc: t('about.werte.v1.desc') },
                { title: t('about.werte.v2.title'), desc: t('about.werte.v2.desc') },
                { title: t('about.werte.v3.title'), desc: t('about.werte.v3.desc') }
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

      <section id="arbeitsweise" className="py-12 sm:py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.arbeitsweise.title')}</h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { title: t('about.arbeitsweise.w1.title'), desc: t('about.arbeitsweise.w1.desc') },
                { title: t('about.arbeitsweise.w2.title'), desc: t('about.arbeitsweise.w2.desc') },
                { title: t('about.arbeitsweise.w3.title'), desc: t('about.arbeitsweise.w3.desc') },
                { title: t('about.arbeitsweise.w4.title'), desc: t('about.arbeitsweise.w4.desc') },
                { title: t('about.arbeitsweise.w5.title'), desc: t('about.arbeitsweise.w5.desc') }
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

      <section id="vergleich" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.compare.title')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">{t('about.compare.aspect')}</th>
                    <th className="text-left p-4 font-semibold bg-primary/5">{t('about.compare.ss')}</th>
                    <th className="text-left p-4 font-semibold">{t('about.compare.competition')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r1.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r1.ss')}</td>
                    <td className="p-4">{t('about.compare.r1.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r2.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r2.ss')}</td>
                    <td className="p-4">{t('about.compare.r2.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r3.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r3.ss')}</td>
                    <td className="p-4">{t('about.compare.r3.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r4.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r4.ss')}</td>
                    <td className="p-4">{t('about.compare.r4.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r5.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r5.ss')}</td>
                    <td className="p-4">{t('about.compare.r5.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r6.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r6.ss')}</td>
                    <td className="p-4">{t('about.compare.r6.competition')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('about.compare.r7.aspect')}</td>
                    <td className="p-4 bg-primary/5">{t('about.compare.r7.ss')}</td>
                    <td className="p-4">{t('about.compare.r7.competition')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('about.cta.title')}</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            {t('about.cta.text')}
          </p>
          <Button 
            size="lg"
            onClick={openInquiry}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {t('about.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function AblaufPage() {
  const { t } = useTranslation()
  const { openInquiry } = useUIStore()
  return (
    <div>
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-bold mb-4 sm:mb-6 leading-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>{t('ablauf.hero.title')}</h1>
          <p className="text-base sm:text-lg opacity-90 max-w-3xl leading-relaxed">
            {t('ablauf.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="timeline" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {[
              { 
                step: '1', 
                title: t('ablauf.step1.title'), 
                desc: t('ablauf.step1.desc') 
              },
              { 
                step: '2', 
                title: t('ablauf.step2.title'), 
                desc: t('ablauf.step2.desc') 
              },
              { 
                step: '3', 
                title: t('ablauf.step3.title'), 
                desc: t('ablauf.step3.desc') 
              },
              { 
                step: '4', 
                title: t('ablauf.step4.title'), 
                desc: t('ablauf.step4.desc') 
              },
              { 
                step: '5', 
                title: t('ablauf.step5.title'), 
                desc: t('ablauf.step5.desc') 
              },
              { 
                step: '6', 
                title: t('ablauf.step6.title'), 
                desc: t('ablauf.step6.desc') 
              },
              { 
                step: '7', 
                title: t('ablauf.step7.title'), 
                desc: t('ablauf.step7.desc') 
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg sm:text-xl">
                    {item.step}
                  </div>
                  {index < 6 && <div className="w-0.5 h-full bg-border mt-2" />}
                </div>
                <div className="pb-6 sm:pb-8">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 sm:py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('ablauf.faq.title')}</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: t('ablauf.faq.q1'),
                  a: t('ablauf.faq.a1')
                },
                {
                  q: t('ablauf.faq.q2'),
                  a: t('ablauf.faq.a2')
                },
                {
                  q: t('ablauf.faq.q3'),
                  a: t('ablauf.faq.a3')
                },
                {
                  q: t('ablauf.faq.q4'),
                  a: t('ablauf.faq.a4')
                },
                {
                  q: t('ablauf.faq.q5'),
                  a: t('ablauf.faq.a5')
                },
                {
                  q: t('ablauf.faq.q6'),
                  a: t('ablauf.faq.a6')
                },
                {
                  q: t('ablauf.faq.q7'),
                  a: t('ablauf.faq.a7')
                },
                {
                  q: t('ablauf.faq.q8'),
                  a: t('ablauf.faq.a8')
                },
                {
                  q: t('ablauf.faq.q9'),
                  a: t('ablauf.faq.a9')
                },
                {
                  q: t('ablauf.faq.q10'),
                  a: t('ablauf.faq.a10')
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

      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('ablauf.cta.title')}</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('ablauf.cta.text')}
          </p>
          <Button size="lg" onClick={openInquiry} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {t('ablauf.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function NachhaltigkeitPage() {
  const { t } = useTranslation()
  const { openInquiry } = useUIStore()
  return (
    <div>
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Leaf className="h-10 w-10 sm:h-12 sm:w-12" />
            <h1 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>{t('nachhaltigkeit.hero.title')}</h1>
          </div>
          <p className="text-base sm:text-lg opacity-90 max-w-3xl leading-relaxed">
            {t('nachhaltigkeit.hero.subtitle')}
          </p>
        </div>
      </section>

      <section id="systeme" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
            {[
              {
                icon: Recycle,
                title: t('nachhaltigkeit.systeme.title1'),
                desc: t('nachhaltigkeit.systeme.desc1')
              },
              {
                icon: TrendUp,
                title: t('nachhaltigkeit.systeme.title2'),
                desc: t('nachhaltigkeit.systeme.desc2')
              },
              {
                icon: CheckCircle,
                title: t('nachhaltigkeit.systeme.title3'),
                desc: t('nachhaltigkeit.systeme.desc3')
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

      <section id="partnernetzwerk" className="py-12 sm:py-16 bg-muted scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="font-bold mb-4 sm:mb-6" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('nachhaltigkeit.business.title')}</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                {t('nachhaltigkeit.business.subtitle')}
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">{t('nachhaltigkeit.business.first.title')}</h4>
                  <p className="text-muted-foreground">{t('nachhaltigkeit.business.first.price')}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <h4 className="font-semibold mb-2">{t('nachhaltigkeit.business.second.title')}</h4>
                  <p className="text-muted-foreground">{t('nachhaltigkeit.business.second.price')}</p>
                  <p className="text-sm text-primary font-semibold mt-2">{t('nachhaltigkeit.business.second.savings')}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                  <h4 className="font-semibold mb-2">{t('nachhaltigkeit.business.third.title')}</h4>
                  <p className="text-muted-foreground">{t('nachhaltigkeit.business.third.price')}</p>
                </div>
              </div>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="/images/03e69940-1b4a-4555-9c29-e3bb8c2564b3.jpeg" 
                alt={t('nachhaltigkeit.business.imageAlt')}
                width="800"
                height="800"
                className="object-cover w-full h-full"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="vorteile" className="py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold mb-6 sm:mb-8 text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('nachhaltigkeit.measures.title')}</h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                t('nachhaltigkeit.measures.m1'),
                t('nachhaltigkeit.measures.m2'),
                t('nachhaltigkeit.measures.m3'),
                t('nachhaltigkeit.measures.m4'),
                t('nachhaltigkeit.measures.m5'),
                t('nachhaltigkeit.measures.m6'),
                t('nachhaltigkeit.measures.m7'),
                t('nachhaltigkeit.measures.m8')
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <CheckCircle className="h-6 w-6 text-primary shrink-0" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: '1.2' }}>{t('nachhaltigkeit.cta.title')}</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('nachhaltigkeit.cta.text')}
          </p>
          <Button size="lg" onClick={openInquiry} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {t('nachhaltigkeit.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}

export function ImpressumPage() {
  const { t } = useTranslation()
  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-bold mb-6 sm:mb-8" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: '1.2' }}>{t('imprint.title')}</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('imprint.tmg')}</h2>
            <p>
              {t('imprint.address').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('imprint.partners.title')}</h2>
            <p>
              {t('imprint.partners.names').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('imprint.contact.title')}</h2>
            <p>
              {t('imprint.contact.details').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('imprint.vat.title')}</h2>
            <p>
              {t('imprint.vat.text').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('imprint.liability.title')}</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">{t('imprint.liability.subtitle')}</h3>
            <p className="mb-4">
              {t('imprint.liability.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DatenschutzPage() {
  const { t } = useTranslation()
  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-bold mb-6 sm:mb-8" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: '1.2' }}>{t('privacy.title')}</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('privacy.s1.title')}</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">{t('privacy.s1.subtitle')}</h3>
            <p>
              {t('privacy.s1.text')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('privacy.s2.title')}</h2>
            <h3 className="font-semibold text-foreground mt-4 mb-2">{t('privacy.s2.subtitle')}</h3>
            <p className="mb-4">
              {t('privacy.s2.text1')}
            </p>
            <p>
              {t('privacy.s2.text2')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('privacy.s3.title')}</h2>
            <p className="mb-4">
              {t('privacy.s3.text1')}
            </p>
            <p>
              {t('privacy.s3.text2')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('privacy.s4.title')}</h2>
            <p>
              {t('privacy.s4.text').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
