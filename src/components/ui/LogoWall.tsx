import { ForkKnife, ShieldCheck, Factory } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

const branchen = [
  { labelKey: 'logowall.food.label', detailKey: 'logowall.food.detail', sectionId: 'food', icon: ForkKnife },
  { labelKey: 'logowall.insurance.label', detailKey: 'logowall.insurance.detail', sectionId: 'versicherungen', icon: ShieldCheck },
  { labelKey: 'logowall.industry.label', detailKey: 'logowall.industry.detail', sectionId: 'industrie', icon: Factory },
]

export function LogoWall() {
  const { t } = useTranslation()
  return (
    <section className="section-tight bg-secondary border-y">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow block text-center mb-6 sm:mb-8">
          {t('logowall.title')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {branchen.map((branche) => {
            const Icon = branche.icon
            return (
              <a
                key={branche.sectionId}
                href={`/branchen#${branche.sectionId}`}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={26} weight="duotone" />
                </span>
                <span className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {t(branche.labelKey)}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    {t(branche.detailKey)}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
