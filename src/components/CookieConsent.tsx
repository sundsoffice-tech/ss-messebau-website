import { useState, useEffect } from 'react';
import { getConsent, setConsent } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n';

/**
 * GDPR-compliant cookie consent banner.
 * Shown only when the user has not yet made a decision.
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the banner only when no decision has been stored yet
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent('granted');
    setVisible(false);
  };

  const decline = () => {
    setConsent('denied');
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t('cookie.ariaLabel')}
      className="fixed bottom-0 inset-x-0 z-[9999] bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg p-4 md:p-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-gray-700 flex-1">
          {t('cookie.text')}{' '}
          <a
            href="#/datenschutz"
            className="underline text-primary hover:text-primary/80"
          >
            {t('cookie.privacy')}
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {t('cookie.decline')}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
