import React from 'react'
import { scrollToSection } from '@/lib/scroll-utils'
import { createSectionHash } from '@/lib/section-map'
import { navigateToPageAndSection, navigate } from '@/lib/deep-linking'

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
      const currentPage = window.location.pathname || '/'
      
      if (currentPage === to) {
        scrollToSection(section, 100)
      } else {
        navigateToPageAndSection(to, section, {
          maxRetries: 15,
          retryDelay: 100,
          headerOffset: 100
        })
      }
    } else {
      navigate(to)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    onClick?.()
  }

  const href = section ? createSectionHash(to, section) : to

  return (
    <a 
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  )
}
