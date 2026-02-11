import { ComponentProps, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { VariantProps } from 'class-variance-authority'
import { navigateToPageAndSection } from '@/lib/deep-linking'
import { scrollToSection } from '@/lib/scroll-utils'

const buttonVariants = {} as any

interface SectionLinkButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  page?: string
  section: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const SectionLinkButton = forwardRef<HTMLButtonElement, SectionLinkButtonProps>(
  ({ page, section, children, onClick, variant, size, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      
      if (page) {
        const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
        if (currentPage === page) {
          scrollToSection(section)
        } else {
          navigateToPageAndSection(page, section)
        }
      } else {
        scrollToSection(section)
      }
      
      onClick?.(e)
    }

    return (
      <Button ref={ref} onClick={handleClick} variant={variant} size={size} {...props}>
        {children}
      </Button>
    )
  }
)

SectionLinkButton.displayName = 'SectionLinkButton'

interface SectionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  page?: string
  section: string
  children: React.ReactNode
}

export function SectionLink({ page, section, children, onClick, className, ...props }: SectionLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    if (page) {
      const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
      if (currentPage === page) {
        scrollToSection(section)
      } else {
        navigateToPageAndSection(page, section)
      }
    } else {
      scrollToSection(section)
    }
    
    onClick?.(e)
  }

  const href = page ? `#${page}#${section}` : `#${section}`

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
