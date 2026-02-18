import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_REFERENCES } from '@/lib/demo-references'
import { Reference } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { InternalLinkSection } from '@/components/InternalLinkSection'
import { useTranslation } from '@/lib/i18n'
import { useUIStore } from '@/store/ui-store'

export function ReferenzenPage() {
  const { openInquiry } = useUIStore()
  const { t } = useTranslation()
  const [selectedBranche, setSelectedBranche] = useState<string>('alle')
  const [selectedType, setSelectedType] = useState<string>('alle')
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null)

  const filteredReferences = DEMO_REFERENCES.filter((ref) => {
    if (selectedBranche !== 'alle' && ref.branche !== selectedBranche) return false
    if (selectedType !== 'alle' && ref.type !== selectedType) return false
    return true
  })

  const getBrancheLabel = (branche: string) => {
    switch (branche) {
      case 'messebau': return t('referenzen.filter.messebau')
      case 'eventbau': return t('referenzen.filter.eventbau')
      case 'ladenbau': return t('referenzen.filter.ladenbau')
      case 'sport': return t('referenzen.filter.sport')
      case 'kleidung': return t('referenzen.filter.kleidung')
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

  return (
    <div>
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t('referenzen.hero.title')}</h1>
          <p className="text-base sm:text-xl opacity-90 max-w-3xl">
            {t('referenzen.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-8 lg:py-12 border-b bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">{t('referenzen.filter.branche')}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'alle', label: t('referenzen.filter.allBranchen') },
                  { value: 'messebau', label: t('referenzen.filter.messebau') },
                  { value: 'eventbau', label: t('referenzen.filter.eventbau') },
                  { value: 'ladenbau', label: t('referenzen.filter.ladenbau') },
                  { value: 'sport', label: t('referenzen.filter.sport') },
                  { value: 'kleidung', label: t('referenzen.filter.kleidung') }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedBranche === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBranche(option.value)}
                    className="h-9 text-xs sm:text-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">{t('referenzen.filter.type')}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'alle', label: t('referenzen.filter.allTypes') },
                  { value: 'messebau', label: t('referenzen.filter.messebau') },
                  { value: 'eventbau', label: t('referenzen.filter.eventbau') },
                  { value: 'ladenbau', label: t('referenzen.filter.ladenbau') }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(option.value)}
                    className="h-9 text-xs sm:text-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredReferences.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                {t('referenzen.empty')}
              </p>
              <Button onClick={openInquiry} className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 sm:h-10">
                {t('referenzen.emptyCta')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredReferences.map((reference) => (
                <Card 
                  key={reference.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary active:scale-[0.98]"
                  onClick={() => setSelectedReference(reference)}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={reference.imageUrl}
                      alt={reference.title}
                      width="640"
                      height="360"
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-background/95 text-foreground shadow-lg backdrop-blur-sm text-xs sm:text-sm">
                      {reference.size}
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg flex items-center gap-2">
                        {t('referenzen.details')}
                        <ArrowRight className="h-4 w-4" />
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">{getBrancheLabel(reference.branche)}</Badge>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">{getTypeLabel(reference.type)}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">{reference.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{reference.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedReference} onOpenChange={(open) => !open && setSelectedReference(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedReference && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl pr-8">{selectedReference.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={selectedReference.imageUrl} 
                    alt={selectedReference.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge className="text-xs">{getBrancheLabel(selectedReference.branche)}</Badge>
                  <Badge variant="outline" className="text-xs">{getTypeLabel(selectedReference.type)}</Badge>
                  <Badge variant="secondary" className="text-xs">{selectedReference.size}</Badge>
                </div>

                {(selectedReference.kunde || selectedReference.zielsetzung) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
                    {selectedReference.kunde && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">{t('referenzen.detail.kunde')}</p>
                        <p className="text-sm font-semibold">{selectedReference.kunde}</p>
                      </div>
                    )}
                    {selectedReference.zielsetzung && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">{t('referenzen.detail.goal')}</p>
                        <p className="text-sm font-semibold">{selectedReference.zielsetzung}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{t('referenzen.detail.challenge')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{selectedReference.challenge}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{t('referenzen.detail.solution')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{selectedReference.solution}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{t('referenzen.detail.result')}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{selectedReference.result}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3">{t('referenzen.detail.facts')}</h3>
                  <div className="space-y-2">
                    {selectedReference.keyfacts.map((fact, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" weight="fill" />
                        <span className="text-xs sm:text-sm leading-relaxed">{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Button onClick={() => {
                    setSelectedReference(null)
                    openInquiry()
                  }} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 sm:h-10">
                    {t('referenzen.detail.cta')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <section className="py-12 sm:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t('referenzen.cta.title')}</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('referenzen.cta.subtitle')}
          </p>
          <Button size="lg" onClick={openInquiry} className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 sm:h-11">
            {t('referenzen.cta.button')}
          </Button>
        </div>
      </section>

      <InternalLinkSection
        title={t('referenzen.links.title')}
        links={[
          { label: t('referenzen.links.services.label'), description: t('referenzen.links.services.desc'), hash: '/leistungen' },
          { label: t('referenzen.links.branchen.label'), description: t('referenzen.links.branchen.desc'), hash: '/branchen' },
          { label: t('referenzen.links.process.label'), description: t('referenzen.links.process.desc'), hash: '/ablauf' },
          { label: t('referenzen.links.sustainability.label'), description: t('referenzen.links.sustainability.desc'), hash: '/nachhaltigkeit' },
          { label: t('referenzen.links.about.label'), description: t('referenzen.links.about.desc'), hash: '/ueber-uns' },
          { label: t('referenzen.links.contact.label'), description: t('referenzen.links.contact.desc'), hash: '/kontakt' },
        ]}
      />
    </div>
  )
}
