import { SECTION_MAP } from './section-map'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateSectionMap(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const seenIds = new Set<string>()

  for (const [page, sections] of Object.entries(SECTION_MAP)) {
    if (sections.length === 0) {
      warnings.push(`Page "${page}" has no sections defined`)
    }

    for (const section of sections) {
      if (!section.id) {
        errors.push(`Section missing ID on page "${page}"`)
        continue
      }

      if (!section.id.match(/^[a-z0-9]+(-[a-z0-9]+)*$/)) {
        errors.push(
          `Invalid section ID "${section.id}" on page "${page}". ` +
          `Use kebab-case only (lowercase letters, numbers, hyphens).`
        )
      }

      const fullId = `${page}#${section.id}`
      if (seenIds.has(fullId)) {
        errors.push(`Duplicate section ID "${section.id}" on page "${page}"`)
      }
      seenIds.add(fullId)

      if (!section.label) {
        warnings.push(`Section "${section.id}" on page "${page}" has no label`)
      }

      if (section.page !== page) {
        errors.push(
          `Section "${section.id}" has mismatched page property. ` +
          `Expected "${page}", got "${section.page}"`
        )
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateSectionExists(page: string, sectionId: string): boolean {
  const sections = SECTION_MAP[page]
  if (!sections) return false
  return sections.some(s => s.id === sectionId)
}

export function validateAllSectionsInDOM(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const [page, sections] of Object.entries(SECTION_MAP)) {
    for (const section of sections) {
      const element = document.getElementById(section.id)
      if (!element) {
        warnings.push(
          `Section "${section.id}" defined for page "${page}" but not found in DOM. ` +
          `This is expected if you're not on that page.`
        )
      } else {
        const hasScrollMargin = window.getComputedStyle(element).scrollMarginTop !== '0px'
        if (!hasScrollMargin) {
          warnings.push(
            `Section "${section.id}" on page "${page}" has no scroll-margin-top. ` +
            `Consider adding scroll-mt-* Tailwind class.`
          )
        }

        const isAccessible = 
          element.hasAttribute('tabindex') || 
          ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
        
        if (!isAccessible) {
          warnings.push(
            `Section "${section.id}" on page "${page}" is not focusable. ` +
            `Consider adding tabindex="-1" for accessibility.`
          )
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function logValidationResults() {
  console.group('🔍 Deep-Linking Validation')
  
  const mapValidation = validateSectionMap()
  
  if (mapValidation.isValid) {
    console.log('✅ Section Map is valid')
  } else {
    console.error('❌ Section Map has errors:')
    mapValidation.errors.forEach(error => console.error(`  - ${error}`))
  }
  
  if (mapValidation.warnings.length > 0) {
    console.warn('⚠️ Section Map warnings:')
    mapValidation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  
  const domValidation = validateAllSectionsInDOM()
  
  if (domValidation.warnings.length > 0) {
    console.warn('⚠️ DOM validation warnings:')
    domValidation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  
  console.groupEnd()
  
  return {
    mapValidation,
    domValidation
  }
}

if (import.meta.env.DEV) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        logValidationResults()
      }, 1000)
    })
  }
}
