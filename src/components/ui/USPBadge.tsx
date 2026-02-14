import { Timer, Ruler, Certificate } from '@phosphor-icons/react'

export function USPBadges() {
  const badges = [
    { icon: Timer, label: '48h Angebot' },
    { icon: Ruler, label: '20–200 m²' },
    { icon: Certificate, label: 'Branchenexperte' },
  ]
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {badges.map((badge) => {
        const Icon = badge.icon
        return (
          <div key={badge.label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1.5 rounded-full border border-white/20">
            <Icon className="h-4 w-4" weight="bold" />
            <span>{badge.label}</span>
          </div>
        )
      })}
    </div>
  )
}
