import { useCallback, useState, type FocusEvent } from 'react'
import { Button } from '@/components/ui/button'
import { PaperPlaneRight, WhatsappLogo } from '@phosphor-icons/react'
import { trackWhatsAppClick, trackHeroCTAClick } from '@/lib/analytics'
import { useTranslation } from '@/lib/i18n'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import { whatsappUrl } from '@/lib/contact'

/**
 * Schnellkontakt-Leiste (WhatsApp + Anfrage), fest am unteren Rand.
 *
 * Barrierefreiheit – was hier bewusst so gebaut ist:
 *
 * - WhatsApp ist ein LINK (<a href="https://wa.me/…">), kein Button mit window.open.
 *   Screenreader kündigen „Link" an, Long-Press/Kontextmenü und „in neuem Tab öffnen"
 *   funktionieren, und der Kontaktweg hängt nicht an einem Click-Handler.
 * - Beim Scrollen nach unten wird die Leiste nur VISUELL eingeklappt. Sie bleibt im
 *   Accessibility-Tree und fokussierbar; erhält ein Element darin Tastaturfokus,
 *   klappt sie wieder aus. Kein aria-hidden auf fokussierbaren Elementen
 *   (WCAG 4.1.2, axe „aria-hidden-focus"), kein Fokus auf unsichtbaren Zielen
 *   (WCAG 2.4.11 „Focus Not Obscured").
 * - Farbe: WhatsApp-Hellgrün #25D366 erreicht auf Weiß nur 1,98:1. Text, Rand und
 *   Icon nutzen deshalb das Token --whatsapp (offizielles WhatsApp-Dunkelgrün,
 *   7,7:1 auf Weiß – WCAG 1.4.3 AA und 1.4.11).
 * - Die sichtbare Beschriftung („WhatsApp", „Anfrage") ist Teil des zugänglichen
 *   Namens (WCAG 2.5.3 „Label in Name"); Zusatzinfo steht als sr-only-Text dahinter.
 * - Zielflächen mindestens 44 × 44 px (WCAG 2.5.5); mobil mit safe-area-inset-bottom,
 *   damit die Leiste nicht unter der Home-Leiste liegt (braucht viewport-fit=cover).
 * - Bewegung: Ein-/Ausklappen ist eine reine Transition; bei prefers-reduced-motion
 *   entfällt sie (motion-reduce + globaler Killswitch in index.css).
 */

interface StickyCTAProps {
  onClick: () => void
}

type Source = 'sticky_desktop' | 'sticky_mobile'

/**
 * Sichtbar, wenn die Scroll-Logik es will ODER ein Element in der Leiste Fokus hat.
 * So bleibt die Leiste für Tastatur- und Screenreader-Nutzer immer erreichbar.
 */
function useRevealOnFocus(scrollVisible: boolean) {
  const [focusWithin, setFocusWithin] = useState(false)
  const onFocus = useCallback(() => setFocusWithin(true), [])
  const onBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (!event.currentTarget.contains(next)) setFocusWithin(false)
  }, [])
  return { visible: scrollVisible || focusWithin, onFocus, onBlur }
}

interface ContactActionsProps {
  source: Source
  onInquiry: () => void
  /** Zusätzliche Klassen je Bedienelement (z. B. flex-1 auf Mobil) */
  itemClassName?: string
}

function ContactActions({ source, onInquiry, itemClassName = '' }: ContactActionsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Button
        asChild
        size="lg"
        className={`min-h-[44px] px-5 text-base font-medium gap-2 border-2 border-whatsapp bg-background text-whatsapp shadow-lg hover:bg-whatsapp-soft hover:shadow-xl focus-visible:bg-whatsapp-soft transition-[background-color,box-shadow,transform] motion-safe:hover:scale-105 ${itemClassName}`}
      >
        <a
          href={whatsappUrl(t('sticky.whatsappMessage'))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(source)}
        >
          <WhatsappLogo className="h-5 w-5" weight="fill" aria-hidden="true" />
          <span>{t('sticky.whatsapp')}</span>
          <span className="sr-only">, {t('sticky.whatsappHint')}</span>
        </a>
      </Button>
      <Button
        size="lg"
        type="button"
        onClick={() => {
          trackHeroCTAClick(source)
          onInquiry()
        }}
        aria-haspopup="dialog"
        className={`min-h-[44px] px-5 text-base font-medium gap-2 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 hover:shadow-xl transition-[background-color,box-shadow,transform] motion-safe:hover:scale-105 ${itemClassName}`}
      >
        <PaperPlaneRight className="h-5 w-5" aria-hidden="true" />
        <span>{t('sticky.inquiry')}</span>
        <span className="sr-only">, {t('sticky.inquiryHint')}</span>
      </Button>
    </>
  )
}

/** Desktop (≥ lg): zwei gestapelte Schaltflächen rechts unten. */
export function StickyCTA({ onClick }: StickyCTAProps) {
  const { t } = useTranslation()
  const { visible, onFocus, onBlur } = useRevealOnFocus(useScrollDirection())

  return (
    <div
      role="group"
      aria-label={t('sticky.contactOptions')}
      data-state={visible ? 'visible' : 'hidden'}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`fixed bottom-6 right-6 z-40 hidden lg:flex flex-col gap-3 transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none'
      }`}
    >
      <ContactActions source="sticky_desktop" onInquiry={onClick} />
    </div>
  )
}

/** Mobil/Tablet (< lg): Leiste über die volle Breite am unteren Rand. */
export function MobileStickyCTA({ onClick }: StickyCTAProps) {
  const { t } = useTranslation()
  const { visible, onFocus, onBlur } = useRevealOnFocus(useScrollDirection())

  return (
    <div
      role="group"
      aria-label={t('sticky.contactOptions')}
      data-state={visible ? 'visible' : 'hidden'}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`fixed inset-x-0 bottom-0 z-40 lg:hidden bg-background/95 backdrop-blur-sm border-t shadow-lg transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ contain: 'layout style' }}
    >
      <div className="flex gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <ContactActions source="sticky_mobile" onInquiry={onClick} itemClassName="flex-1" />
      </div>
    </div>
  )
}
