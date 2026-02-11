import { parseSectionHash, createSectionHash } from './section-map'

export function scrollToSection(sectionId: string, offset: number = 100): boolean {
  const element = document.getElementById(sectionId)
  
  if (!element) {
    return false
  }
  
  const headerOffset = offset
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

export function smoothScrollToElement(element: HTMLElement, offset: number = 100) {
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

export function createSectionLink(page: string, section: string): string {
  return createSectionHash(page, section)
}

export function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href')
      if (href && href.includes('#')) {
        const parts = href.split('#').filter(Boolean)
        if (parts.length === 2) {
          e.preventDefault()
          const [page, section] = parts
          const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
          if (currentPage === page) {
            scrollToSection(section, 100)
          } else {
            window.location.hash = href
          }
        }
      }
    })
  })
}

export function scrollToSectionWithRetry(sectionId: string, maxRetries: number = 10, delay: number = 100) {
  let attempts = 0
  
  const tryScroll = () => {
    const success = scrollToSection(sectionId, 100)
    
    if (!success && attempts < maxRetries) {
      attempts++
      setTimeout(tryScroll, delay)
    }
  }
  
  tryScroll()
}
