import { useState, useCallback } from 'react'
import {
  ShareNetwork,
  WhatsappLogo,
  LinkedinLogo,
  XLogo,
  FacebookLogo,
  EnvelopeSimple,
  LinkSimple,
  Check,
} from '@phosphor-icons/react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useTranslation } from '@/lib/i18n'
import { trackEvent } from '@/lib/analytics'

const SITE_URL = 'https://sunds-messebau.de'

interface ShareButtonProps {
  title?: string
  description?: string
  variant?: 'icon' | 'button'
  className?: string
}

export function ShareButton({
  title,
  description,
  variant = 'icon',
  className = '',
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const getShareUrl = useCallback(() => {
    return SITE_URL + window.location.pathname
  }, [])

  const getShareTitle = useCallback(() => {
    return title || document.title
  }, [title])

  const handleNativeShare = useCallback(async () => {
    const url = getShareUrl()
    const shareTitle = getShareTitle()
    try {
      await navigator.share({
        title: shareTitle,
        text: description || shareTitle,
        url,
      })
      trackEvent('social_share', { platform: 'native', page: window.location.pathname })
    } catch {
      // User cancelled or share failed – no action needed
    }
  }, [getShareUrl, getShareTitle, description])

  const handleShare = useCallback(
    (platform: string) => {
      const url = encodeURIComponent(getShareUrl())
      const text = encodeURIComponent(getShareTitle())

      const urls: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${text}%20${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        email: `mailto:?subject=${text}&body=${text}%0A%0A${url}`,
      }

      trackEvent('social_share', { platform, page: window.location.pathname })

      if (platform === 'email') {
        window.location.href = urls[platform]
      } else {
        window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
      }
      setOpen(false)
    },
    [getShareUrl, getShareTitle],
  )

  const handleCopyLink = useCallback(async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    trackEvent('social_share', { platform: 'copy_link', page: window.location.pathname })
    setTimeout(() => setCopied(false), 2000)
  }, [getShareUrl])

  const shareOptions = [
    { key: 'whatsapp', icon: WhatsappLogo, label: t('share.whatsapp'), aria: t('share.whatsapp.aria') },
    { key: 'linkedin', icon: LinkedinLogo, label: t('share.linkedin'), aria: t('share.linkedin.aria') },
    { key: 'twitter', icon: XLogo, label: t('share.twitter'), aria: t('share.twitter.aria') },
    { key: 'facebook', icon: FacebookLogo, label: t('share.facebook'), aria: t('share.facebook.aria') },
    { key: 'email', icon: EnvelopeSimple, label: t('share.email'), aria: t('share.email.aria') },
  ]

  // Mobile: Use native Web Share API
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator
  if (canNativeShare) {
    return (
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary focus-visible:text-primary transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[44px] ${variant === 'icon' ? 'p-2 -m-1' : 'px-3 py-2 text-sm border border-input bg-background hover:bg-muted'} ${className}`}
        aria-label={t('share.button')}
      >
        <ShareNetwork className="h-4 w-4" aria-hidden="true" />
        {variant === 'button' && <span>{t('share.button')}</span>}
      </button>
    )
  }

  // Desktop: Popover fallback
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary focus-visible:text-primary transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[44px] ${variant === 'icon' ? 'p-2 -m-1' : 'px-3 py-2 text-sm border border-input bg-background hover:bg-muted'} ${className}`}
          aria-label={t('share.button')}
        >
          <ShareNetwork className="h-4 w-4" aria-hidden="true" />
          {variant === 'button' && <span>{t('share.button')}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end" sideOffset={8}>
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
          {t('share.title')}
        </p>
        <div className="grid grid-cols-3 gap-1">
          {shareOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleShare(option.key)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[44px]"
              aria-label={option.aria}
            >
              <option.icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] leading-none">{option.label}</span>
            </button>
          ))}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[44px]"
            aria-label={t('share.copyLink.aria')}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
            ) : (
              <LinkSimple className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-[10px] leading-none">
              {copied ? t('share.copied') : t('share.copyLink')}
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
