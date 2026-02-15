import { Timer, Ruler, Certificate } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'

export function USPBadges() {
  const { t } = useTranslation()
  const badges = [
    { icon: Timer, labelKey: 'usp.48h' },
    { icon: Ruler, labelKey: 'usp.size' },
    { icon: Certificate, labelKey: 'usp.expert' },
  ]
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {badges.map((badge) => {
        const Icon = badge.icon
        return (
          <div key={badge.labelKey} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1.5 rounded-full border border-white/20">
            <Icon className="h-4 w-4" weight="bold" />
            <span>{t(badge.labelKey)}</span>
          </div>
        )
      })}
    </div>
  )
}
