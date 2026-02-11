import { Separator } from '@/components/ui/separator'
import { Phone, Envelope, MapPin } from '@phosphor-icons/react'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'
import { navigateToPageAndSection } from '@/lib/deep-linking'

export function Footer() {
  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSectionNavigation = (page: string, sectionId: string) => {
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
                className="h-10 w-auto"
              />
              <div>
                <div className="font-bold">S&S Messebau</div>
                <div className="text-xs text-muted-foreground">GbR</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-Service Messebau, Eventbau und Ladenbau aus Hückelhoven. 
              Persönliche Betreuung, starkes Netzwerk, faire Preise.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Leistungen</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => handleSectionNavigation('/leistungen', 'messebau')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Messebau
                </button>
              </li>
              <li>
                <button onClick={() => handleSectionNavigation('/leistungen', 'eventbau')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Eventbau
                </button>
              </li>
              <li>
                <button onClick={() => handleSectionNavigation('/leistungen', 'ladenbau')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Ladenbau
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/bannerrahmen')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Bannerrahmen
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/nachhaltigkeit')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Nachhaltigkeit
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Unternehmen</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => handleNavigation('/ueber-uns')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Über uns
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/referenzen')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Referenzen
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/blog')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/kontakt')} className="hover:text-primary transition-colors text-left min-h-[44px] py-2 -my-2">
                  Kontakt
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-base">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div>Marienstr. 37-42</div>
                  <div>41836 Hückelhoven</div>
                </div>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Phone className="h-5 w-5 shrink-0" />
                <a href="tel:+4924334427144" className="hover:text-primary transition-colors py-2">
                  (02433) 4427144
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground min-h-[44px]">
                <Envelope className="h-5 w-5 shrink-0" />
                <a href="mailto:info@sundsmessebau.de" className="hover:text-primary transition-colors py-2 break-all">
                  info@sundsmessebau.de
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
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <button onClick={() => handleNavigation('/impressum')} className="hover:text-primary transition-colors min-h-[44px] py-2">
              Impressum
            </button>
            <button onClick={() => handleNavigation('/datenschutz')} className="hover:text-primary transition-colors min-h-[44px] py-2">
              Datenschutz
            </button>
            <button onClick={() => handleNavigation('/admin')} className="hover:text-primary transition-colors min-h-[44px] py-2">
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
