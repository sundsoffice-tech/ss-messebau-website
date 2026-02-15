import { useTranslation } from '@/lib/i18n'

const branchen = [
  { labelKey: 'logowall.food.label', detailKey: 'logowall.food.detail', sectionId: 'food' },
  { labelKey: 'logowall.insurance.label', detailKey: 'logowall.insurance.detail', sectionId: 'versicherungen' },
  { labelKey: 'logowall.industry.label', detailKey: 'logowall.industry.detail', sectionId: 'industrie' },
]

export function LogoWall() {
  const { t } = useTranslation()
  return (
    <section className="py-8 sm:py-10 bg-muted/50 border-y">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
          {t('logowall.title')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12">
          {branchen.map((branche) => (
            <a
              key={branche.sectionId}
              href={`#/branchen#${branche.sectionId}`}
              className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">{t(branche.labelKey)}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{t(branche.detailKey)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
