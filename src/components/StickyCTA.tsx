import { Button } from '@/components/ui/button'
import { PaperPlaneRight, WhatsappLogo } from '@phosphor-icons/react'

interface StickyCTAProps {
  onClick: () => void
}

const WHATSAPP_NUMBER = '4915140368754'
const WHATSAPP_MESSAGE = 'Hallo S&S Messebau Team, ich interessiere mich für Ihre Leistungen und möchte gerne mehr erfahren.'

const openWhatsApp = () => {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
}

export function StickyCTA({ onClick }: StickyCTAProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 lg:flex hidden flex-col gap-3" role="group" aria-label="Kontaktoptionen">
      <Button
        size="lg"
        onClick={openWhatsApp}
        className="bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2 group"
        aria-label="Per WhatsApp kontaktieren unter +49 1514 0368754 (öffnet externe App)"
      >
        <WhatsappLogo className="h-5 w-5 group-hover:animate-pulse" weight="fill" aria-hidden="true" />
        <span>WhatsApp</span>
      </Button>
      <Button
        size="lg"
        onClick={onClick}
        className="bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2"
        aria-label="Projekt anfragen - Formular öffnen"
      >
        <PaperPlaneRight className="h-5 w-5" aria-hidden="true" />
        <span>Projekt anfragen</span>
      </Button>
    </div>
  )
}

export function MobileStickyCTA({ onClick }: StickyCTAProps) {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t shadow-lg pb-safe" 
      role="group" 
      aria-label="Kontaktoptionen"
      style={{ contain: 'layout style' }}
    >
      <div className="flex gap-3 p-3">
        <Button
          size="lg"
          onClick={openWhatsApp}
          className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 min-h-[44px] text-base font-medium"
          aria-label="Per WhatsApp kontaktieren unter +49 1514 0368754 (öffnet externe App)"
        >
          <WhatsappLogo className="h-5 w-5" weight="fill" aria-hidden="true" />
          <span>WhatsApp</span>
        </Button>
        <Button
          size="lg"
          onClick={onClick}
          className="flex-1 bg-accent hover:bg-accent/90 gap-2 min-h-[44px] text-base font-medium"
          aria-label="Projekt anfragen - Formular öffnen"
        >
          <PaperPlaneRight className="h-5 w-5" aria-hidden="true" />
          <span>Anfragen</span>
        </Button>
      </div>
    </div>
  )
}
