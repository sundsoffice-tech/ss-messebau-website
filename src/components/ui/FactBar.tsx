import { useTranslation } from '@/lib/i18n'

interface Fact {
  value: string
  labelKey: string
}

// Die Zahlen stehen fest da und zählen nicht hoch: Wer schnell rollt, las sonst Zwischenwerte.
// Keine Kachel mit der Kennzahl „1“ (Fabrice 10.11.2026): Eine Eins macht keinen Eindruck; was sich nicht
// als starke, belegbare Zahl sagen lässt, steht als Aussage ohne Ziffer da.
const facts: Fact[] = [
  { value: '48h', labelKey: 'facts.48h' },
  { value: '200m²', labelKey: 'facts.200m' },
  { value: '3', labelKey: 'facts.3sectors' },
  { value: 'A–Z', labelKey: 'facts.fullservice' },
]

export function FactBar() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-surface-deep text-primary-foreground py-10 sm:py-12">
      <div
        className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center lg:divide-x lg:divide-white/10">
          {facts.map((fact) => (
            <div key={fact.labelKey} className="lg:px-4">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">{fact.value}</p>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-on-deep-muted">{t(fact.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
