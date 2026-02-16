import { Card, CardContent } from '@/components/ui/card'
import { Sparkle, Calculator, ClockClockwise, Lightbulb, CheckCircle, Microphone } from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from '@/lib/i18n'

interface KIBeraterPageProps {
  onOpenInquiry: () => void
}

export function KIBeraterPage({ onOpenInquiry }: KIBeraterPageProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <Sparkle className="h-9 w-9" weight="fill" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('advisor.title')}</h1>
              <p className="text-xl opacity-90">
                {t('advisor.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-6 lg:px-8">
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('advisor.intro')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                    <Calculator className="h-7 w-7 text-primary" weight="duotone" />
                  </div>
                  <h3 className="font-bold text-lg">{t('advisor.budget.title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('advisor.budget.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                    <ClockClockwise className="h-7 w-7 text-primary" weight="duotone" />
                  </div>
                  <h3 className="font-bold text-lg">{t('advisor.timeline.title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('advisor.timeline.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                    <Lightbulb className="h-7 w-7 text-primary" weight="duotone" />
                  </div>
                  <h3 className="font-bold text-lg">{t('advisor.material.title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('advisor.material.description')}
                </p>
              </CardContent>
            </Card>
          </div>

          {isVoiceSupported && (
            <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-primary/5 border-2 border-accent/30 mb-16 overflow-hidden shadow-xl">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-white shadow-xl">
                    <Microphone className="h-10 w-10" weight="fill" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">{t('advisor.voice.title')}</h3>
                      <span className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-bold tracking-wide">{t('advisor.voice.badge')}</span>
                    </div>
                    <p className="text-muted-foreground mb-5 text-base leading-relaxed">
                      {t('advisor.voice.description')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
                        <CheckCircle className="h-5 w-5 text-accent shrink-0" weight="fill" />
                        <span className="font-semibold text-sm">{t('advisor.voice.feature1')}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
                        <CheckCircle className="h-5 w-5 text-accent shrink-0" weight="fill" />
                        <span className="font-semibold text-sm">{t('advisor.voice.feature2')}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
                        <CheckCircle className="h-5 w-5 text-accent shrink-0" weight="fill" />
                        <span className="font-semibold text-sm">{t('advisor.voice.feature3')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50 border-border/50 mb-12">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-primary" weight="duotone" />
                </div>
                <h3 className="font-bold text-xl">{t('advisor.examples.title')}{isVoiceSupported && ` (${t('advisor.examples.voiceHint')})`}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q1')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q2')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q3')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q4')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q5')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background hover:shadow-md transition-all duration-200 border border-border/50">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm leading-relaxed font-medium">
                    {t('advisor.examples.q6')}
                  </p>
                </div>
              </div>
              {isVoiceSupported && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-4 bg-accent/5 rounded-xl p-5 border border-accent/20">
                    <Microphone className="h-6 w-6 text-accent shrink-0 mt-0.5" weight="fill" />
                    <div>
                      <p className="text-sm font-bold mb-2">{t('advisor.voiceTip.title')}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('advisor.voiceTip.description')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-8 md:p-10">
              <h3 className="font-bold text-xl mb-6">{t('advisor.howItWorks.title')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('advisor.howItWorks.step1.title')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('advisor.howItWorks.step1.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('advisor.howItWorks.step2.title')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('advisor.howItWorks.step2.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('advisor.howItWorks.step3.title')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('advisor.howItWorks.step3.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('advisor.howItWorks.step4.title')}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('advisor.howItWorks.step4.description')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
