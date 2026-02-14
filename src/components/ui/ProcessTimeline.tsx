import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'

interface ProcessTimelineProps {
  onOpenInquiry: () => void
}

const steps = [
  { title: 'Anfrage', desc: 'Ihr Projekt anfragen – per Formular, Telefon oder WhatsApp.' },
  { title: '48h Angebot', desc: 'Innerhalb von 48h erhalten Sie ein kalkuliertes Angebot.' },
  { title: '3D-Entwurf', desc: 'Fotorealistische 3D-Visualisierung Ihres Messestands.' },
  { title: 'Produktion', desc: 'Hochwertige Fertigung mit bewährten Partnern.' },
  { title: 'Aufbau', desc: 'Professioneller Aufbau vor Ort – termingerecht.' },
  { title: 'Lagerung', desc: 'Einlagerung für den nächsten Einsatz – kosteneffizient.' },
]

export function ProcessTimeline({ onOpenInquiry }: ProcessTimelineProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-bold mb-3 sm:mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>
            So läuft Ihr Projekt ab
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Von der ersten Anfrage bis zur Einlagerung – transparent und planbar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              <div className="flex items-center justify-center mx-auto mb-3 h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-primary/20" />
              )}
              <h3 className="font-semibold text-sm sm:text-base mb-1">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Button onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Jetzt Projekt starten
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
