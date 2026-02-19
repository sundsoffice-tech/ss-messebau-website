import { Button } from '@/components/ui/button'
import { ArrowLeft, Warning } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import { navigate } from '@/lib/deep-linking'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4 max-w-lg">
        <Warning className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" weight="duotone" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">
          {t('notFound.title')}
        </p>
        <p className="text-muted-foreground mb-8">
          {t('notFound.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0 }) }}
            className="min-h-[48px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('notFound.backHome')}
          </Button>
          <Button
            variant="outline"
            onClick={() => { navigate('/kontakt'); window.scrollTo({ top: 0 }) }}
            className="min-h-[48px]"
          >
            {t('notFound.contact')}
          </Button>
        </div>
      </div>
    </div>
  )
}
