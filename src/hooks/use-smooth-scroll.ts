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
    if (!sectionId) return
    const timeoutId = setTimeout(() => {
      scrollToSection(sectionId, offset)
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [sectionId, offset])
}

export function useSmoothScrollLinks() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href*="#"]') as HTMLAnchorElement

      if (anchor && anchor.hash) {
        const sectionId = anchor.hash.slice(1) // remove # prefix

        if (sectionId) {
          const element = document.getElementById(sectionId)
          if (element) {
            e.preventDefault()
            scrollToSection(sectionId)
          }
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
