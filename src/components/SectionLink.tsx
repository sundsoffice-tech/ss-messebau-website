import { navigateToPageAndSection } from '@/lib/deep-linking'

interface SectionLinkProps {
  page: string
  section?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function SectionLink({ page, section, children, className, onClick }: SectionLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (section) {
      navigateToPageAndSection(page, section)
    } else {
      window.location.hash = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    onClick?.()
  }

  const href = section ? `#${page}#${section}` : `#${page}`

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
}
