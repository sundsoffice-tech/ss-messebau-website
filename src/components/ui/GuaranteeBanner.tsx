import { Button } from '@/components/ui/button'
import { Lightning, ArrowRight } from '@phosphor-icons/react'
import { track48hBannerClick } from '@/lib/analytics'

interface GuaranteeBannerProps {
  onOpenInquiry: () => void
}

export function GuaranteeBanner({ onOpenInquiry }: GuaranteeBannerProps) {
  return (
    <section className="bg-accent text-accent-foreground py-4 sm:py-5">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Lightning className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" weight="fill" />
            <div>
              <p className="font-bold text-sm sm:text-base">48h-Angebotsgarantie – schnell und verbindlich</p>
              <p className="text-xs sm:text-sm opacity-80">Unverbindliche Erstberatung – persönlich und transparent</p>
            </div>
          </div>
          <Button
            onClick={() => { track48hBannerClick(); onOpenInquiry() }}
            variant="outline"
            size="sm"
            className="border-accent-foreground/30 bg-accent-foreground/15 text-accent-foreground hover:bg-accent-foreground/25 whitespace-nowrap"
          >
            Jetzt Angebot anfordern
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
