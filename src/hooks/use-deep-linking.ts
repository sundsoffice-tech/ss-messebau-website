import { useEffect, useCallback } from 'react'
import { parseDeepLink, navigateToSection, navigateToPageAndSection, updateUrlWithSection, isValidDeepLink } from '@/lib/deep-linking'

export function useDeepLinking(currentPage: string) {
  useEffect(() => {
    const deepLink = parseDeepLink()

    if (!(deepLink.page === currentPage && deepLink.section)) return

    if (!isValidDeepLink(currentPage, deepLink.section)) {
      console.warn(`Invalid section "${deepLink.section}" for page "${currentPage}"`)
    }

    const timeoutId = setTimeout(() => {
      const success = navigateToSection(deepLink.section!)
      if (!success) {
        console.warn(`Failed to navigate to section "${deepLink.section}"`)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [currentPage])

  const navigateToSectionOnPage = useCallback((page: string, section: string) => {
    navigateToPageAndSection(page, section, {
      maxRetries: 15,
      retryDelay: 100
    })
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    const success = navigateToSection(sectionId)
    if (success) {
      updateUrlWithSection(sectionId, true)
    }
  }, [])

  return {
    navigateToSectionOnPage,
    scrollToSection
  }
}

export function useSectionObserver(sectionIds: string[], rootMargin: string = '-100px 0px -70% 0px') {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            const sectionId = entry.target.id
            if (sectionId) {
              updateUrlWithSection(sectionId, true)
            }
          }
        })
      },
      {
        rootMargin,
        threshold: [0, 0.1, 0.25, 0.5]
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
