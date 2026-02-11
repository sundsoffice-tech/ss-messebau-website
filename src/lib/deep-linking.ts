export interface DeepLinkConfig {
  page: string
  section?: string
}

export function parseDeepLink(hash: string): DeepLinkConfig {
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash
  const [page, section] = cleanHash.split('#')
  
  return {
    page: page || '/',
    section: section || undefined
  }
}

export function createDeepLink(page: string, section?: string): string {
  if (section) {
    return `#${page}#${section}`
  }
  return `#${page}`
}

export function navigateToSection(sectionId: string, headerOffset: number = 80) {
  const element = document.getElementById(sectionId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    element.focus({ preventScroll: true })
    
    return true
  }
  return false
}

export function navigateToPageAndSection(page: string, section: string, maxRetries: number = 10) {
  const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
  
  if (currentPage === page) {
    navigateToSection(section)
  } else {
    window.location.hash = createDeepLink(page, section)
    
    let attempts = 0
    const checkAndScroll = () => {
      if (navigateToSection(section) || attempts >= maxRetries) {
        return
      }
      attempts++
      setTimeout(checkAndScroll, 100)
    }
    
    setTimeout(checkAndScroll, 300)
  }
}

export function getCurrentDeepLink(): DeepLinkConfig {
  return parseDeepLink(window.location.hash)
}

export function updateUrlWithSection(section: string) {
  const currentPage = window.location.hash.slice(1).split('#')[0] || '/'
  const newHash = createDeepLink(currentPage, section)
  
  window.history.replaceState(null, '', newHash)
}
