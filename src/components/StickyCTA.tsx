import { Button } from '@/components/ui/button'
import { PaperPlaneRight, WhatsappLogo } from '@phosphor-icons/react'
import { trackWhatsAppClick, trackHeroCTAClick } from '@/lib/analytics'
import { useTranslation } from '@/lib/i18n'

interface StickyCTAProps {
  onClick: () => void
}

const WHATSAPP_NUMBER = '4915140368754'

export function StickyCTA({ onClick }: StickyCTAProps) {
  const { t } = useTranslation()

  const openWhatsApp = (source: string) => {
    trackWhatsAppClick(source)
    const encodedMessage = encodeURIComponent(t('sticky.whatsappMessage'))
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:flex hidden flex-col gap-3" role="group" aria-label={t('sticky.contactOptions')}>
      <Button
        size="lg"
        onClick={() => openWhatsApp('sticky_desktop')}
        className="border-2 border-[#25D366] bg-transparent text-[#25D366] hover:bg-[#25D366]/10 shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2 group"
        aria-label={t('sticky.whatsappAria')}
      >
        <WhatsappLogo className="h-5 w-5 group-hover:animate-pulse" weight="fill" aria-hidden="true" />
        <span>{t('sticky.whatsapp')}</span>
      </Button>
      <Button
        size="lg"
        onClick={() => { trackHeroCTAClick('sticky_desktop'); onClick() }}
        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2"
        aria-label={t('sticky.inquiryAria')}
      >
        <PaperPlaneRight className="h-5 w-5" aria-hidden="true" />
        <span>{t('sticky.inquiry')}</span>
      </Button>
    </div>
  )
}

export function MobileStickyCTA({ onClick }: StickyCTAProps) {
  const { t } = useTranslation()

  const openWhatsApp = (source: string) => {
    trackWhatsAppClick(source)
    const encodedMessage = encodeURIComponent(t('sticky.whatsappMessage'))
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t shadow-lg pb-safe" 
      role="group" 
      aria-label={t('sticky.contactOptions')}
      style={{ contain: 'layout style' }}
    >
      <div className="flex gap-3 p-3">
        <Button
          size="lg"
          onClick={() => openWhatsApp('sticky_mobile')}
          className="flex-1 border-2 border-[#25D366] bg-transparent text-[#25D366] hover:bg-[#25D366]/10 gap-2 min-h-[44px] text-base font-medium"
          aria-label={t('sticky.whatsappAria')}
        >
          <WhatsappLogo className="h-5 w-5" weight="fill" aria-hidden="true" />
          <span>{t('sticky.whatsapp')}</span>
        </Button>
        <Button
          size="lg"
          onClick={() => { trackHeroCTAClick('sticky_mobile'); onClick() }}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 min-h-[44px] text-base font-medium"
          aria-label={t('sticky.inquiryAria')}
        >
          <PaperPlaneRight className="h-5 w-5" aria-hidden="true" />
          <span>{t('sticky.inquiry')}</span>
        </Button>
      </div>
    </div>
  )
}
