import { memo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Phone, Envelope, MapPin } from '@phosphor-icons/react'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'
import { navigateToPageAndSection } from '@/lib/deep-linking'

export const Footer = memo(function Footer() {
  const handleNavigation = (path: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    window.location.hash = path
  }

  const handleSectionNavigation = (page: string, sectionId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    navigateToPageAndSection(page, sectionId)
  }

  return (
    <footer className="bg-muted border-t mt-16 sm:mt-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="S&S Messebau Logo"
                width="40"
                height="40"
                loading="lazy"
                className="h-10 w-auto"
              />
              <div>
                <div className="font-bold">S&S Messebau</div>
                <div className="text-xs text-muted-foreground">GbR</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-Service Messebau, Eventbau und Ladenbau aus Mönchengladbach. 
              Persönliche Betreuung, starkes Netzwerk, faire Preise.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Leistungen</h3>
            <nav aria-label="Leistungen Navigation">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={(e) => handleSectionNavigation('/leistungen', 'messebau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Messebau
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleSectionNavigation('/leistungen', 'eventbau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Eventbau
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleSectionNavigation('/leistungen', 'ladenbau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Ladenbau
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleSectionNavigation('/leistungen', 'touren', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Touren & Messeauftritte
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleSectionNavigation('/leistungen', 'trockenbau', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Trockenbau & Innenausbau
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/bannerrahmen', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Bannerrahmen
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/nachhaltigkeit', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Nachhaltigkeit
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Unternehmen</h3>
            <nav aria-label="Unternehmen Navigation">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/ueber-uns', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Über uns
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/referenzen', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Referenzen
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/blog', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => handleNavigation('/kontakt', e)} 
                    className="hover:text-primary focus-visible:text-primary transition-colors text-left min-h-[44px] py-2 -my-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Kontakt
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <address className="leading-relaxed not-italic">
                  <div>Bonnenbroicherstraße 93</div>
                  <div>41238 Mönchengladbach</div>
                </address>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <a 
                  href="tel:+4917631570041" 
                  className="hover:text-primary focus-visible:text-primary transition-colors py-2 focus-visible:outline-none focus-visible:underline"
                  aria-label="Anrufen: +49 176 31570041"
                >
                  +49 176 31570041
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Envelope className="h-5 w-5 shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:sunds-messebau@gmx.de" 
                  className="hover:text-primary focus-visible:text-primary transition-colors py-2 break-all focus-visible:outline-none focus-visible:underline"
                  aria-label="E-Mail senden an sunds-messebau@gmx.de"
                >
                  sunds-messebau@gmx.de
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} S&S Messebau GbR. Alle Rechte vorbehalten.
          </div>
          <nav aria-label="Rechtliche Links">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button 
                onClick={(e) => handleNavigation('/impressum', e)} 
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                Impressum
              </button>
              <button 
                onClick={(e) => handleNavigation('/datenschutz', e)} 
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                Datenschutz
              </button>
              <button 
                onClick={(e) => handleNavigation('/admin', e)} 
                className="hover:text-primary focus-visible:text-primary transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:underline"
              >
                Admin
              </button>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
})
