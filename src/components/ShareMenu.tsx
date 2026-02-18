import { memo } from 'react'
import { ShareNetwork } from '@phosphor-icons/react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShareButton } from './ShareButton'
import { useTranslation } from '@/lib/i18n'
import { canUseNativeShare, getCurrentPageTitle, getCurrentPageDescription } from '@/lib/share'
import type { SharePlatform } from '@/lib/share'

interface ShareMenuProps {
  url?: string
  title?: string
  description?: string
  campaign?: string
  triggerVariant?: 'icon' | 'text'
  triggerLabel?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  source?: string
}

const PRIMARY_PLATFORMS: SharePlatform[] = ['linkedin', 'whatsapp', 'instagram']
const SECONDARY_PLATFORMS: SharePlatform[] = ['facebook', 'x', 'email']

export const ShareMenu = memo(function ShareMenu({
  url = '/',
  title,
  description,
  campaign,
  triggerVariant = 'icon',
  triggerLabel,
  side = 'top',
  align = 'center',
  source = 'share_menu',
}: ShareMenuProps) {
  const { t } = useTranslation()

  const shareTitle = title || getCurrentPageTitle()
  const shareDescription = description || getCurrentPageDescription()
  const label = triggerLabel || t('share.title')

  return (
    <Popover>
      <PopoverTrigger asChild>
        {triggerVariant === 'text' ? (
          <Button variant="outline" className="min-h-[44px] gap-2">
            <ShareNetwork className="h-4 w-4" aria-hidden="true" />
            {label}
          </Button>
        ) : (
          <button
            type="button"
            aria-label={label}
            className="inline-flex items-center justify-center rounded-md h-8 w-8
              text-muted-foreground hover:text-primary
              focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-primary focus-visible:ring-offset-2
              transition-colors cursor-pointer"
          >
            <ShareNetwork className="h-4 w-4" weight="regular" aria-hidden="true" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-64 p-4">
        <h3 className="text-sm font-semibold mb-3">{t('share.title')}</h3>

        {/* Primary platforms (B2B) */}
        <div className="flex items-center gap-1 mb-1">
          {PRIMARY_PLATFORMS.map((platform) => (
            <ShareButton
              key={platform}
              platform={platform}
              url={url}
              title={shareTitle}
              description={shareDescription}
              campaign={campaign}
              source={source}
              size="md"
            />
          ))}
        </div>

        {/* Secondary platforms */}
        <div className="flex items-center gap-1">
          {SECONDARY_PLATFORMS.map((platform) => (
            <ShareButton
              key={platform}
              platform={platform}
              url={url}
              title={shareTitle}
              description={shareDescription}
              campaign={campaign}
              source={source}
              size="md"
            />
          ))}
        </div>

        <Separator className="my-3" />

        {/* Copy link */}
        <div className="flex items-center gap-2">
          <ShareButton
            platform="copy"
            url={url}
            title={shareTitle}
            campaign={campaign}
            source={source}
            size="md"
          />
          <span className="text-xs text-muted-foreground">{t('share.copy')}</span>
        </div>

        {/* Native share (mobile only) */}
        {canUseNativeShare() && (
          <div className="flex items-center gap-2 mt-2">
            <ShareButton
              platform="native"
              url={url}
              title={shareTitle}
              description={shareDescription}
              campaign={campaign}
              source={source}
              size="md"
            />
            <span className="text-xs text-muted-foreground">{t('share.native')}</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
})
