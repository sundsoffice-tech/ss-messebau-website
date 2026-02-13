import { parseSectionHash, createSectionHash } from './section-map'

export function getHeaderHeight(): number {
  const header = document.querySelector('header')
  if (!header) return 100
  
  const rect = header.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(header)
  const position = computedStyle.position
  
  if (position === 'fixed' || position === 'sticky') {
    return rect.height + 20
  }
  
  return 100
}

export function scrollToSection(sectionId: string, offset?: number): boolean {
  const element = document.getElementById(sectionId)
  
  if (!element) {
    return false
  }
  
  const headerOffset = offset ?? getHeaderHeight()
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

export function scrollToTop(smooth: boolean = true) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  window.scrollTo({
    top: 0,
    behavior: (smooth && !prefersReducedMotion) ? 'smooth' : 'auto'
  })
}

export function parseHashWithSection(hash: string): { page: string; section?: string } {
  return parseSectionHash(hash)
}

export function smoothScrollToElement(element: HTMLElement, offset?: number) {
  const headerOffset = offset ?? getHeaderHeight()
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

export function createSectionLink(page: string, section: string): string {
  return createSectionHash(page, section)
}

export function scrollToSectionWithRetry(sectionId: string, maxRetries: number = 10, delay: number = 100) {
  let attempts = 0
  
  const tryScroll = () => {
    const success = scrollToSection(sectionId)
    
    if (!success && attempts < maxRetries) {
      attempts++
      setTimeout(tryScroll, delay)
    }
  }
  
  tryScroll()
}
