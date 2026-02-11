import { validateSectionExists, parseSectionHash, createSectionHash } from './section-map'

export interface DeepLinkConfig {
  page: string
  section?: string
}

export const HEADER_OFFSET = 100

export function parseDeepLink(hash: string): DeepLinkConfig {
  return parseSectionHash(hash)
}

export function createDeepLink(page: string, section?: string): string {
  return createSectionHash(page, section)
}

export function normalizePagePath(page: string): string {
  if (!page || page === '') return '/'
  if (!page.startsWith('/')) return `/${page}`
  return page
}

export function navigateToSection(sectionId: string, headerOffset: number = HEADER_OFFSET): boolean {
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

export function scrollToSectionWithRetry(
  sectionId: string,
  options: { maxRetries?: number; retryDelay?: number; headerOffset?: number } = {}
): void {
  const { maxRetries = 20, retryDelay = 150, headerOffset = HEADER_OFFSET } = options
  
  let attempts = 0
  
  const tryScroll = () => {
    const element = document.getElementById(sectionId)
    
    if (element) {
      navigateToSection(sectionId, headerOffset)
      return
    }
    
    if (attempts >= maxRetries) {
      console.warn(`Section "${sectionId}" not found after ${maxRetries} attempts`)
      return
    }
    
    attempts++
    setTimeout(tryScroll, retryDelay)
  }
  
  setTimeout(tryScroll, 200)
}

export function navigateToPageAndSection(
  page: string,
  section: string,
  options: { maxRetries?: number; retryDelay?: number; headerOffset?: number } = {}
): void {
  const { maxRetries = 20, retryDelay = 150, headerOffset = HEADER_OFFSET } = options
  
  if (!validateSectionExists(page, section)) {
    console.warn(`Section "${section}" not found in page "${page}" configuration`)
  }
  
  const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
  
  if (currentPage === page) {
    navigateToSection(section, headerOffset)
  } else {
    window.location.hash = createDeepLink(page, section)
    scrollToSectionWithRetry(section, { maxRetries, retryDelay, headerOffset })
  }
}

export function updateUrlWithSection(section: string, replaceState: boolean = true): void {
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

export function getCurrentDeepLink(): DeepLinkConfig {
  return parseDeepLink(window.location.hash)
}
