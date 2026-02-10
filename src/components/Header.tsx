import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { List, X, House, Briefcase, Buildings, Images, Users, Path, Leaf, Article, Envelope, Phone, FrameCorners } from '@phosphor-icons/react'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'

interface HeaderProps {
  onOpenInquiry: () => void
}

const NAV_ITEMS = [
  { label: 'Start', path: '/', icon: House },
  { label: 'Leistungen', path: '/leistungen', icon: Briefcase },
  { label: 'Branchen', path: '/branchen', icon: Buildings },
  { label: 'Referenzen', path: '/referenzen', icon: Images },
  { label: 'Bannerrahmen', path: '/bannerrahmen', icon: FrameCorners },
  { label: 'Über uns', path: '/ueber-uns', icon: Users },
  { label: 'Ablauf', path: '/ablauf', icon: Path },
  { label: 'Nachhaltigkeit', path: '/nachhaltigkeit', icon: Leaf },
  { label: 'Blog', path: '/blog', icon: Article },
  { label: 'Kontakt', path: '/kontakt', icon: Envelope }
]

export function Header({ onOpenInquiry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentPath = window.location.hash.slice(1) || '/'

  const handleNavigation = (path: string) => {
    window.location.hash = path
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <img src={logo} alt="S&S Messebau Logo" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-foreground">S&S Messebau</div>
              <div className="text-xs text-muted-foreground">Full-Service Messebau</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.slice(0, 6).map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={currentPath === item.path ? 'text-primary font-semibold' : ''}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="default"
              onClick={() => handleNavigation('/banner-bestellen')}
              className="ml-2 bg-primary hover:bg-primary/90"
              size="sm"
            >
              Banner konfigurieren
            </Button>
            <Button
              variant="default"
              onClick={onOpenInquiry}
              className="ml-1 bg-accent hover:bg-accent/90"
              size="sm"
            >
              Projekt anfragen
            </Button>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenInquiry}
              className="bg-accent hover:bg-accent/90"
            >
              Anfragen
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="S&S Messebau Logo" className="h-10 w-auto" />
                    <span className="font-bold">Menü</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.path}
                        variant={currentPath === item.path ? 'secondary' : 'ghost'}
                        onClick={() => handleNavigation(item.path)}
                        className="justify-start gap-3 h-12"
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    )
                  })}
                </nav>
                <div className="mt-8 pt-8 border-t">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href="tel:+4924334427144" className="hover:text-primary">(02433) 4427144</a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Envelope className="h-4 w-4" />
                      <a href="mailto:info@sundsmessebau.de" className="hover:text-primary">info@sundsmessebau.de</a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
