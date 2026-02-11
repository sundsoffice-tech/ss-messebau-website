import { useEffect, useCallback } from 'react'
import { parseDeepLink, navigateToSection, navigateToPageAndSection, updateUrlWithSection } from '@/lib/deep-linking'

export function useDeepLinking(currentPage: string) {
  useEffect(() => {
    const deepLink = parseDeepLink(window.location.hash)
    
    if (deepLink.page === currentPage && deepLink.section) {
      const timeoutId = setTimeout(() => {
        navigateToSection(deepLink.section!)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentPage])

  const navigateToSectionOnPage = useCallback((page: string, section: string) => {
    navigateToPageAndSection(page, section)
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    navigateToSection(sectionId)
    updateUrlWithSection(sectionId)
  }, [])

  return {
    navigateToSectionOnPage,
    scrollToSection
  }
}

export function useSectionObserver(sectionIds: string[], rootMargin: string = '-80px 0px -80% 0px') {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            const sectionId = entry.target.id
            if (sectionId) {
              updateUrlWithSection(sectionId)
            }
          }
        })
      },
      {
        rootMargin,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    )

    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    elements.forEach(el => observer.observe(el))

    return () => {
      elements.forEach(el => observer.unobserve(el))
    }
  }, [sectionIds, rootMargin])
}
