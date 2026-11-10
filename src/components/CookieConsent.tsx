import { useState, useEffect, useRef } from 'react';
import { getConsent, setConsent } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n';
import { useUIStore } from '@/store/ui-store';
import { RouterLink } from '@/components/RouterLink';
import { useHinweisPlatz } from '@/hooks/use-hinweis-platz';

/**
 * GDPR-compliant cookie consent banner.
 *
 * Erscheint, solange keine Entscheidung gespeichert ist, und erneut, wenn der
 * Besucher ihn über „Cookie-Einstellungen" im Footer verlangt (Widerrufsweg,
 * Art. 7 Abs. 3 DSGVO). „Ablehnen" nach früherem „Akzeptieren" stoppt die
 * Statistik sofort; das erledigen die Lauscher an `setConsent`.
 *
 * Der Hinweis liegt fest am unteren Rand. Damit er nichts verdeckt, meldet er
 * seine Höhe (`useHinweisPlatz`): Die Seite hält unten so viel Platz frei, und
 * die Kontaktleiste rückt über ihn. Impressum und Datenschutzerklärung sind
 * zusätzlich aus dem Hinweis selbst erreichbar.
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const [undecided, setUndecided] = useState(false);
  const requested = useUIStore((state) => state.cookieSettingsOpen);
  const closeCookieSettings = useUIStore((state) => state.closeCookieSettings);
  const declineRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const visible = undecided || requested;

  useEffect(() => {
    // Show the banner when no decision has been stored yet
    if (getConsent() === null) {
      setUndecided(true);
    }
  }, []);

  // Über den Footer geöffnet: Fokus in den Banner, nach der Entscheidung zurück
  useEffect(() => {
    if (!requested) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    declineRef.current?.focus();
  }, [requested]);

  useHinweisPlatz(bannerRef, visible);

  if (!visible) return null;

  const close = () => {
    setUndecided(getConsent() === null);
    closeCookieSettings();
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  };

  const decide = (value: 'granted' | 'denied') => {
    setConsent(value);
    close();
  };

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('cookie.ariaLabel')}
      onKeyDown={(event) => {
        // Erneut geöffnet und schon entschieden: Escape schließt ohne Änderung
        if (event.key === 'Escape' && requested && getConsent() !== null) close();
      }}
      className="fixed bottom-0 inset-x-0 z-[9999] bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg p-4 md:p-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-gray-700 flex-1">
          {t('cookie.text')}{' '}
          <RouterLink
            to="/datenschutz"
            className="mr-2 underline text-primary hover:text-primary/80"
          >
            {t('cookie.privacy')}
          </RouterLink>{' '}
          <RouterLink
            to="/impressum"
            className="underline text-primary hover:text-primary/80"
          >
            {t('cookie.imprint')}
          </RouterLink>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            ref={declineRef}
            onClick={() => decide('denied')}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {t('cookie.decline')}
          </button>
          <button
            onClick={() => decide('granted')}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
