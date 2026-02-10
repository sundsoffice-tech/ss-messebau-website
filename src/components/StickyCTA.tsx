import { Button } from '@/components/ui/button'
import { PaperPlaneRight } from '@phosphor-icons/react'

interface StickyCTAProps {
  onClick: () => void
}

export function StickyCTA({ onClick }: StickyCTAProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 lg:block hidden">
      <Button
        size="lg"
        onClick={onClick}
        className="bg-accent hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 gap-2"
      >
        <PaperPlaneRight className="h-5 w-5" />
        Projekt anfragen
      </Button>
    </div>
  )
}

export function MobileStickyCTA({ onClick }: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t p-4 shadow-lg">
      <Button
        size="lg"
        onClick={onClick}
        className="w-full bg-accent hover:bg-accent/90 gap-2"
      >
        <PaperPlaneRight className="h-5 w-5" />
        Projekt anfragen
      </Button>
    </div>
  )
}
