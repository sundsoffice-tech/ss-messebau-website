export function scrollToSection(sectionId: string, offset: number = 80) {
  const element = document.getElementById(sectionId)
  
  if (element) {
    const headerOffset = offset
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
    
    setTimeout(() => {
      element.focus({ preventScroll: true })
    }, prefersReducedMotion ? 0 : 300)
    
    return true
  }
  
  return false
}

export function scrollToTop(smooth: boolean = true) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  window.scrollTo({
    top: 0,
    behavior: (smooth && !prefersReducedMotion) ? 'smooth' : 'auto'
  })
}

export function parseHashWithSection(hash: string): { page: string; section?: string } {
  const cleanHash = hash.replace('#', '')
  
  if (cleanHash.includes('#')) {
    const [page, section] = cleanHash.split('#')
    return { page, section }
  }
  
  return { page: cleanHash }
}

export function smoothScrollToElement(element: HTMLElement, offset: number = 80) {
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

export function createSectionLink(page: string, section: string): string {
  return `#${page}#${section}`
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
          if (window.location.hash.includes(page)) {
            scrollToSection(section)
          } else {
            window.location.hash = href
          }
        }
      }
    })
  })
}

export function scrollToSectionWithRetry(sectionId: string, maxRetries: number = 5, delay: number = 100) {
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
