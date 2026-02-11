import React from 'react'

interface RouterLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
}

export function RouterLink({ 
  to, 
  children, 
  className, 
  onClick,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent
}: RouterLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.location.hash = to
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onClick?.()
  }

  return (
    <a 
      href={`#${to}`}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  )
}
