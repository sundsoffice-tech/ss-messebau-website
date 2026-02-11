import { useEffect, useCallback } from 'react'
import { scrollToSection } from '@/lib/scroll-utils'

export function useSmoothScroll() {
  const scrollTo = useCallback((sectionId: string, offset?: number) => {
    scrollToSection(sectionId, offset)
  }, [])

  const scrollToWithDelay = useCallback((sectionId: string, delay: number = 100, offset?: number) => {
    setTimeout(() => {
      scrollToSection(sectionId, offset)
    }, delay)
  }, [])

  return {
    scrollTo,
    scrollToWithDelay
  }
}

export function useSmoothScrollOnMount(sectionId?: string, offset?: number) {
  useEffect(() => {
    if (sectionId) {
      const timeoutId = setTimeout(() => {
        scrollToSection(sectionId, offset)
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [sectionId, offset])
}

export function useSmoothScrollLinks() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href*="#"]') as HTMLAnchorElement
      
      if (anchor && anchor.hash) {
        const hash = anchor.hash.slice(1)
        const parts = hash.split('#')
        
        if (parts.length >= 2) {
          e.preventDefault()
          const [page, section] = parts
          const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
          
          if (currentPage === page && section) {
            scrollToSection(section)
          } else if (section) {
            window.location.hash = anchor.hash
          }
        } else if (parts.length === 1 && parts[0]) {
          const element = document.getElementById(parts[0])
          if (element) {
            e.preventDefault()
            scrollToSection(parts[0])
          }
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
