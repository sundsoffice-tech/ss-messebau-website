import { navigateToPageAndSection } from '@/lib/deep-linking'
import { createSectionHash } from '@/lib/section-map'

interface SectionLinkProps {
  page: string
  section?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
}

export function SectionLink({ 
  page, 
  section, 
  children, 
  className, 
  onClick,
  'aria-label': ariaLabel
}: SectionLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (section) {
      navigateToPageAndSection(page, section, {
        maxRetries: 15,
        retryDelay: 100,
        headerOffset: 100
      })
    } else {
      window.location.hash = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    onClick?.()
  }

  const href = createSectionHash(page, section)

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
