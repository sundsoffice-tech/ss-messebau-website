import React from 'react'
import { scrollToSection } from '@/lib/scroll-utils'

interface RouterLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  section?: string
}

export function RouterLink({ 
  to, 
  children, 
  className, 
  onClick,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  section
}: RouterLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    if (section) {
      const [page, sectionId] = section.includes('#') ? section.split('#') : [to, section]
      
      if (window.location.hash.replace('#', '') === page) {
        scrollToSection(sectionId)
      } else {
        window.location.hash = `${page}#${sectionId}`
      }
    } else {
      window.location.hash = to
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    onClick?.()
  }

  return (
    <a 
      href={section ? `#${section}` : `#${to}`}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  )
}
