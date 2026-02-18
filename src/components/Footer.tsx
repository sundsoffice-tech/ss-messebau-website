import { memo, useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Phone, Envelope, MapPin } from '@phosphor-icons/react'
import logo from '@/assets/logo/ss-messebau-logo.png'
import { useTranslation } from '@/lib/i18n'
import { authApi } from '@/lib/api-client'
import { navigate } from '@/lib/deep-linking'
import { ShareButton } from './ShareButton'
import type { SharePlatform } from '@/lib/share'

const FOOTER_SHARE_PLATFORMS: SharePlatform[] = ['linkedin', 'whatsapp', 'email', 'x', 'copy']

export const Footer = memo(function Footer() {
  const { t } = useTranslation()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    authApi.me().then(res => setIsAdmin(res.authenticated)).catch(() => {
      // Auth check failed silently – admin link stays hidden
    })
  }, [])
  const handleNavigation = (path: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    navigate(path)
  }

  return (
    <footer className="bg-muted border-t mt-16 sm:mt-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0">
                <img 
                  src={logo} 
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <div>
                <div className="font-bold">
                  <span className="text-primary">S&S</span>{' '}
                  <span className="text-foreground">Messebau</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  GbR · Full-Service Messebau
                </div>
              </div>
            </div>
            <div className="w-12 h-0.5 bg-primary/20 rounded-full mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.company.desc')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">{t('footer.services')}</h3>
            <nav aria-label={t('footer.servicesNav')}>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/messebau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.messebau')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/eventbau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.eventbau')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/showroom-ladenbau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.showroomLadenbau')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/touren', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.touren')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/boeden-ausstattung', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.boeden')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/leistungen/digital-experience', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.digital')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/bannerrahmen', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.banner')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/nachhaltigkeit', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.services.sustainability')}
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">{t('footer.company')}</h3>
            <nav aria-label={t('footer.companyNav')}>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/ueber-uns', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.company.about')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/referenzen', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.company.references')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/blog', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.company.blog')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/aktuelles', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.company.aktuelles')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/kontakt', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    {t('footer.company.contact')}
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <address className="leading-relaxed not-italic">
                  <div>Marienstraße 37</div>
                  <div>41836 Hückelhoven</div>
                </address>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <a 
                  href="tel:+4915140368754" 
                  className="hover:text-primary focus-visible:text-primary transition-colors py-2 focus-visible:outline-none focus-visible:underline"
                  aria-label={t('footer.contact.call') + ': +49 1514 0368754'}
                >
                  +49 1514 0368754
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Envelope className="h-5 w-5 shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:info@sundsmessebau.com" 
                  className="hover:text-primary focus-visible:text-primary transition-colors py-2 break-all focus-visible:outline-none focus-visible:underline"
                  aria-label={t('footer.contact.email') + ' info@sundsmessebau.com'}
                >
                  info@sundsmessebau.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} S&S Messebau GbR. {t('footer.rights')}.
          </div>

          <div className="flex items-center gap-3" role="group" aria-label={t('share.ariaLabel')}>
            <span className="text-xs text-muted-foreground">{t('share.label')}</span>
            <div className="flex items-center gap-1">
              {FOOTER_SHARE_PLATFORMS.map((platform) => (
                <ShareButton
                  key={platform}
                  platform={platform}
                  url={window.location.pathname || '/'}
                  title={document.title}
                  size="sm"
                  source="footer"
                />
              ))}
            </div>
          </div>

          <nav aria-label={t('footer.legal.nav')}>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button
                onClick={(e) => handleNavigation('/impressum', e)}
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                {t('footer.legal.imprint')}
              </button>
              <button
                onClick={(e) => handleNavigation('/datenschutz', e)}
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                {t('footer.legal.privacy')}
              </button>
              {isAdmin && (
              <button
                onClick={(e) => handleNavigation('/admin', e)}
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                {t('footer.legal.admin')}
              </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
})
