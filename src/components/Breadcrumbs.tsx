import { ChevronRight, House } from '@phosphor-icons/react'
import { memo } from 'react'

interface BreadcrumbItem {
  label: string
  path?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export const Breadcrumbs = memo(function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  const handleNavigation = (path: string) => {
    window.location.hash = path
  }

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm px-1 py-0.5"
            aria-label="Zur Startseite"
          >
            <House className="h-4 w-4" weight="duotone" aria-hidden="true" />
            <span className="hidden sm:inline">Start</span>
          </button>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
              
              {isLast || !item.path ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path!)}
                  className="text-muted-foreground hover:text-primary transition-colors focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm px-1 py-0.5"
                >
                  {item.label}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
