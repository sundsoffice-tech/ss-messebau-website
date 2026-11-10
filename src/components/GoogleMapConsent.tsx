import { useEffect, useRef, useState } from 'react'
import { MapPin, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

const MAP_QUERY = 'Marienstra%C3%9Fe+37,+41836+H%C3%BCckelhoven,+Deutschland'

/** Eingebettete Karte; wird erst nach dem Klick des Besuchers angefragt. */
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`
/** Gewöhnlicher Verweis: Der Abruf bei Google geschieht erst beim Folgen des Links. */
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`

/**
 * Google-Karte hinter einem Klick (Zwei-Klick-Lösung).
 *
 * Ohne Klick steht kein `iframe` im Dokument, der Browser fragt also nichts bei
 * google.com an. Die Entscheidung gilt nur für diesen Seitenaufruf und wird
 * nicht gespeichert. Adresse und der Verweis „In Google Maps öffnen" bleiben in
 * beiden Zuständen sichtbar.
 */
export function GoogleMapConsent() {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Der Knopf verschwindet mit dem Klick; der Fokus geht auf die Karte über
  useEffect(() => {
    if (loaded) frameRef.current?.focus()
  }, [loaded])

  const address = (
    <address className="not-italic font-semibold text-sm sm:text-base">
      {t('kontakt.contact.address.line1')}, {t('kontakt.contact.address.line2')}
    </address>
  )

  const openLink = (
    <a
      href={MAP_LINK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
    >
      {t('kontakt.map.open')}
      <ArrowSquareOut className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  )

  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-card text-card-foreground">
      {loaded ? (
        <>
          <div className="aspect-video">
            <iframe
              ref={frameRef}
              src={MAP_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              title={t('kontakt.map.title')}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t px-4 sm:px-6 py-2">
            {address}
            {openLink}
          </div>
        </>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              {address}
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">{t('kontakt.map.hint')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 md:shrink-0">
            <Button type="button" size="lg" className="min-h-[44px]" onClick={() => setLoaded(true)}>
              {t('kontakt.map.load')}
            </Button>
            {openLink}
          </div>
        </div>
      )}
    </div>
  )
}
