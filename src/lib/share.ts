/**
 * Social Sharing Utilities
 *
 * Provides URL construction with UTM parameters, platform-specific share URLs,
 * Web Share API integration, and clipboard operations.
 */

export type SharePlatform =
  | 'linkedin'
  | 'whatsapp'
  | 'email'
  | 'x'
  | 'facebook'
  | 'copy'
  | 'native'

export interface ShareData {
  url: string
  title: string
  description?: string
}

const SITE_URL = 'https://sunds-messebau.de'

/** Build a share URL with UTM tracking parameters */
export function buildShareUrl(
  path: string,
  platform: SharePlatform,
  campaign = 'website_share',
): string {
  const base = `${SITE_URL}${path === '/' ? '' : path}`
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: campaign,
  })
  return `${base}?${params.toString()}`
}

/** LinkedIn share intent URL */
export function getLinkedInShareUrl(shareUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
}

/** WhatsApp share (opens wa.me with text, not a phone number) */
export function getWhatsAppShareUrl(shareUrl: string, title: string): string {
  const text = `${title} ${shareUrl}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Email mailto link with subject and body */
export function getEmailShareUrl(
  shareUrl: string,
  title: string,
  description?: string,
): string {
  const body = description ? `${description}\n\n${shareUrl}` : shareUrl
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
}

/** X (Twitter) share intent URL */
export function getXShareUrl(shareUrl: string, title: string): string {
  return `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
}

/** Facebook share dialog URL */
export function getFacebookShareUrl(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
}

/** Check if the browser supports the Web Share API */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/** Trigger the native share dialog (mobile). Returns false if unavailable or cancelled. */
export async function triggerNativeShare(data: ShareData): Promise<boolean> {
  if (!canUseNativeShare()) return false
  try {
    await navigator.share({
      title: data.title,
      text: data.description,
      url: data.url,
    })
    return true
  } catch (e) {
    if (e instanceof Error && e.name !== 'AbortError') {
      console.warn('Native share failed:', e)
    }
    return false
  }
}

/** Copy text to clipboard with fallback for older browsers */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  } catch {
    return false
  }
}

/** Read the current page title from <title> */
export function getCurrentPageTitle(): string {
  return document.title
}

/** Read the current page description from meta[name="description"] */
export function getCurrentPageDescription(): string {
  const meta = document.querySelector('meta[name="description"]')
  return meta?.getAttribute('content') || ''
}

/** Open a centered popup window for social share dialogs */
export function openShareWindow(url: string, platform: SharePlatform): void {
  if (platform === 'email') {
    window.location.href = url
    return
  }
  const width = 600
  const height = 500
  const left = (window.innerWidth - width) / 2 + window.screenX
  const top = (window.innerHeight - height) / 2 + window.screenY
  window.open(
    url,
    `share_${platform}`,
    `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`,
  )
}
