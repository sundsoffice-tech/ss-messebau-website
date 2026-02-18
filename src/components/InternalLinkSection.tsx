import { memo } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { navigate } from '@/lib/deep-linking'

interface InternalLink {
  label: string
  description: string
  hash: string
}

interface InternalLinkSectionProps {
  title?: string
  links: InternalLink[]
}

export const InternalLinkSection = memo(function InternalLinkSection({ 
  title, 
  links 
}: InternalLinkSectionProps) {
  const { t } = useTranslation()
  const resolvedTitle = title || t('links.title')

  const handleNavigation = (hash: string, event: React.MouseEvent) => {
    event.preventDefault()
    navigate(hash)
  }

  return (
    <nav aria-label={resolvedTitle} className="py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6">{resolvedTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <a
              key={link.hash}
              href={`#${link.hash}`}
              onClick={(e) => handleNavigation(link.hash, e)}
              className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
})
