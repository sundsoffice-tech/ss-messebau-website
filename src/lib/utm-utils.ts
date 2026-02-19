/**
 * UTM Parameter Utilities
 * Extracts and persists UTM parameters from URL for lead attribution.
 * UTM params are stored in sessionStorage so they survive SPA navigation.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const UTM_STORAGE_KEY = 'ss_utm_params'

type UtmParams = Partial<Record<typeof UTM_KEYS[number], string>>

/**
 * Extract UTM parameters from the current URL and persist them.
 * Called on page load to capture landing page UTM params.
 */
export function captureUtmParams(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const utm: UtmParams = {}
    let hasAny = false

    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) {
        utm[key] = value
        hasAny = true
      }
    }

    if (hasAny) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm))
    }
  } catch { /* ignore */ }
}

/**
 * Get persisted UTM parameters (from landing page).
 * Returns only non-empty values suitable for inclusion in form submissions.
 */
export function getUtmParams(): UtmParams {
  try {
    // First check current URL
    const params = new URLSearchParams(window.location.search)
    const fromUrl: UtmParams = {}
    let hasFromUrl = false

    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) {
        fromUrl[key] = value
        hasFromUrl = true
      }
    }
    if (hasFromUrl) return fromUrl

    // Fall back to stored params from landing page
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

// Auto-capture UTM params on module load
if (typeof window !== 'undefined') {
  captureUtmParams()
}
