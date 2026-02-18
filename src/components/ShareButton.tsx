import { memo, useState, useCallback } from 'react'
import {
  LinkedinLogo,
  WhatsappLogo,
  Envelope,
  XLogo,
  FacebookLogo,
  LinkSimple,
  ShareNetwork,
  Check,
} from '@phosphor-icons/react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { trackSocialShare } from '@/lib/analytics'
import {
  buildShareUrl,
  copyToClipboard,
  triggerNativeShare,
  canUseNativeShare,
  getLinkedInShareUrl,
  getWhatsAppShareUrl,
  getEmailShareUrl,
  getXShareUrl,
  getFacebookShareUrl,
  openShareWindow,
  type SharePlatform,
} from '@/lib/share'

interface ShareButtonProps {
  platform: SharePlatform
  url: string
  title: string
  description?: string
  size?: 'sm' | 'md'
  className?: string
  campaign?: string
  source?: string
}

const ICON_MAP: Record<SharePlatform, typeof LinkedinLogo> = {
  linkedin: LinkedinLogo,
  whatsapp: WhatsappLogo,
  email: Envelope,
  x: XLogo,
  facebook: FacebookLogo,
  copy: LinkSimple,
  native: ShareNetwork,
}

const TRANSLATION_KEY: Record<SharePlatform, string> = {
  linkedin: 'share.linkedin',
  whatsapp: 'share.whatsapp',
  email: 'share.email',
  x: 'share.x',
  facebook: 'share.facebook',
  copy: 'share.copy',
  native: 'share.native',
}

export const ShareButton = memo(function ShareButton({
  platform,
  url,
  title,
  description,
  size = 'sm',
  className,
  campaign,
  source = 'footer',
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(async () => {
    const shareUrl = buildShareUrl(url, platform, campaign)

    trackSocialShare(platform, url, source)

    if (platform === 'copy') {
      const success = await copyToClipboard(shareUrl)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
      return
    }

    if (platform === 'native') {
      await triggerNativeShare({ url: shareUrl, title, description })
      return
    }

    let intentUrl: string
    switch (platform) {
      case 'linkedin':
        intentUrl = getLinkedInShareUrl(shareUrl)
        break
      case 'whatsapp':
        intentUrl = getWhatsAppShareUrl(shareUrl, title)
        break
      case 'email':
        intentUrl = getEmailShareUrl(shareUrl, title, description)
        break
      case 'x':
        intentUrl = getXShareUrl(shareUrl, title)
        break
      case 'facebook':
        intentUrl = getFacebookShareUrl(shareUrl)
        break
      default:
        return
    }

    openShareWindow(intentUrl, platform)
  }, [platform, url, title, description, campaign, source])

  // Hide native share button when API is not available
  if (platform === 'native' && !canUseNativeShare()) {
    return null
  }

  const Icon = copied ? Check : ICON_MAP[platform]
  const label = copied ? t('share.copied') : t(TRANSLATION_KEY[platform])

  const sizeClasses = size === 'sm'
    ? 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4'
    : 'h-9 w-9 [&_svg]:h-[18px] [&_svg]:w-[18px]'

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            aria-label={label}
            className={cn(
              'inline-flex items-center justify-center rounded-md',
              'text-muted-foreground hover:text-primary',
              'focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-primary focus-visible:ring-offset-2',
              'transition-colors cursor-pointer',
              sizeClasses,
              className,
            )}
          >
            <Icon weight="regular" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          {label}
        </TooltipContent>
      </Tooltip>
      {platform === 'copy' && (
        <span className="sr-only" role="status" aria-live="polite">
          {copied ? t('share.copySuccess') : ''}
        </span>
      )}
    </>
  )
})
