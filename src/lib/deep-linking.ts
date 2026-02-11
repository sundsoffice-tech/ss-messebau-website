import { validateSectionExists, parseSectionHash, createSectionHash } from './section-map'

export interface DeepLinkConfig {
  page: string
  section?: string
}

export function parseDeepLink(hash: string): DeepLinkConfig {
  return parseSectionHash(hash)
}

export function createDeepLink(page: string, section?: string): string {
  return createSectionHash(page, section)
}

export function navigateToSection(sectionId: string, headerOffset: number = 100): boolean {
  const element = document.getElementById(sectionId)
  
  if (!element) {
    return false
  }
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset
  
  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
  
  setTimeout(() => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    element.focus({ preventScroll: true })
  }, prefersReducedMotion ? 0 : 400)
  
  return true
}

export function navigateToPageAndSection(
  page: string, 
  section: string, 
  options: { maxRetries?: number; retryDelay?: number; headerOffset?: number } = {}
) {
  const { maxRetries = 15, retryDelay = 100, headerOffset = 100 } = options
  
  if (!validateSectionExists(page, section)) {
    console.warn(`Section "${section}" not found in page "${page}" configuration`)
  }
  
  const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
  
  if (currentPage === page) {
    navigateToSection(section, headerOffset)
  } else {
    window.location.hash = createDeepLink(page, section)
    
    let attempts = 0
    const checkAndScroll = () => {
      const element = document.getElementById(section)
      
      if (element) {
        navigateToSection(section, headerOffset)
        return
      }
      
      if (attempts >= maxRetries) {
        console.warn(`Failed to find section "${section}" after ${maxRetries} attempts`)
        return
      }
      
      attempts++
      setTimeout(checkAndScroll, retryDelay)
    }
    
    setTimeout(checkAndScroll, 400)
  }
}

export function getCurrentDeepLink(): DeepLinkConfig {
  return parseDeepLink(window.location.hash)
}

export function updateUrlWithSection(section: string, replaceState: boolean = true) {
  const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
  const newHash = createDeepLink(currentPage, section)
  
  if (window.history) {
    if (replaceState) {
      window.history.replaceState(null, '', newHash)
    } else {
      window.history.pushState(null, '', newHash)
    }
  } else {
    window.location.hash = newHash
  }
}

export function isValidDeepLink(page: string, section?: string): boolean {
  if (!section) return true
  return validateSectionExists(page, section)
}

export function normalizePagePath(page: string): string {
  if (!page || page === '') return '/'
  if (!page.startsWith('/')) return `/${page}`
  return page
}
