import { validateSectionExists, parseCurrentLocation, createSectionHash } from './section-map'

export interface DeepLinkConfig {
  page: string
  section?: string
}

export const HEADER_OFFSET = 100

export function getHeaderHeight(): number {
  const header = document.querySelector('header')
  if (!header) return HEADER_OFFSET

  const rect = header.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(header)
  const position = computedStyle.position

  if (position === 'fixed' || position === 'sticky') {
    return rect.height + 20
  }

  return HEADER_OFFSET
}

/**
 * Navigate to a clean URL path using History API.
 * Dispatches a popstate event so the App listener picks up the change.
 */
export function navigate(path: string): void {
  if (path === window.location.pathname + window.location.hash) return
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Parse the current browser location (pathname + optional hash anchor).
 * Also handles legacy hash-based URLs (#/page#section) for backward compat.
 */
export function parseDeepLink(_hash?: string): DeepLinkConfig {
  // Support legacy hash-based routing: #/page or #/page#section
  const hash = window.location.hash
  if (hash && hash.startsWith('#/')) {
    const cleanHash = hash.slice(1) // remove leading #
    const parts = cleanHash.split('#')
    return {
      page: parts[0] || '/',
      section: parts[1] || undefined
    }
  }

  // Clean URL mode: pathname + optional #section anchor
  return parseCurrentLocation()
}

export function createDeepLink(page: string, section?: string): string {
  return createSectionHash(page, section)
}

export function normalizePagePath(page: string): string {
  if (!page || page === '') return '/'
  if (!page.startsWith('/')) return `/${page}`
  return page
}

export function navigateToSection(sectionId: string, headerOffset?: number): boolean {
  const element = document.getElementById(sectionId)

  if (!element) {
    return false
  }

  const offset = headerOffset ?? getHeaderHeight()
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })

  const focusDelay = prefersReducedMotion ? 50 : 400
  setTimeout(() => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    element.focus({ preventScroll: true })

    element.setAttribute('aria-live', 'polite')
    setTimeout(() => element.removeAttribute('aria-live'), 1000)
  }, focusDelay)

  return true
}

export function scrollToSectionWithRetry(
  sectionId: string,
  options: { maxRetries?: number; retryDelay?: number; headerOffset?: number } = {}
): void {
  const { maxRetries = 20, retryDelay = 150, headerOffset } = options

  let attempts = 0

  const tryScroll = () => {
    const element = document.getElementById(sectionId)

    if (element) {
      const offset = headerOffset ?? getHeaderHeight()
      navigateToSection(sectionId, offset)
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
  const { maxRetries = 20, retryDelay = 150, headerOffset } = options

  if (!validateSectionExists(page, section)) {
    console.warn(`Section "${section}" not found in page "${page}" configuration`)
  }

  const currentPage = window.location.pathname || '/'

  if (currentPage === page) {
    const offset = headerOffset ?? getHeaderHeight()
    navigateToSection(section, offset)
  } else {
    navigate(createDeepLink(page, section))
    scrollToSectionWithRetry(section, { maxRetries, retryDelay, headerOffset })
  }
}

export function updateUrlWithSection(section: string, replaceState: boolean = true): void {
  const currentPage = window.location.pathname || '/'
  const newUrl = createDeepLink(currentPage, section)

  if (replaceState) {
    window.history.replaceState(null, '', newUrl)
  } else {
    window.history.pushState(null, '', newUrl)
  }
}

export function isValidDeepLink(page: string, section?: string): boolean {
  if (!section) return true
  return validateSectionExists(page, section)
}

export function getCurrentDeepLink(): DeepLinkConfig {
  return parseDeepLink()
}
