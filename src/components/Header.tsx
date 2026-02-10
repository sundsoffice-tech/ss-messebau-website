import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  List, 
  X, 
  House, 
  Briefcase, 
  Buildings, 
  Images, 
  Users, 
  Path, 
  Leaf, 
  Article, 
  Envelope, 
  Phone, 
  FrameCorners,
  CaretDown 
} from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'

interface HeaderProps {
  onOpenInquiry: () => void
}

const PRIMARY_NAV = [
  { label: 'Start', path: '/', icon: House },
  { label: 'Leistungen', path: '/leistungen', icon: Briefcase },
  { label: 'Branchen', path: '/branchen', icon: Buildings },
  { label: 'Referenzen', path: '/referenzen', icon: Images },
]

const SECONDARY_NAV = [
  { label: 'Bannerrahmen', path: '/bannerrahmen', icon: FrameCorners },
  { label: 'Über uns', path: '/ueber-uns', icon: Users },
  { label: 'Ablauf', path: '/ablauf', icon: Path },
  { label: 'Nachhaltigkeit', path: '/nachhaltigkeit', icon: Leaf },
  { label: 'Blog', path: '/blog', icon: Article },
  { label: 'Kontakt', path: '/kontakt', icon: Envelope }
]

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV]

export function Header({ onOpenInquiry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const currentPath = window.location.hash.slice(1) || '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (path: string) => {
    window.location.hash = path
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-background/98 backdrop-blur-md shadow-sm' 
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-16' : 'h-18 sm:h-20'
        }`}>
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 sm:gap-3 transition-all hover:opacity-80 flex-shrink-0"
          >
            <img 
              src={logo} 
              alt="S&S Messebau Logo" 
              className={`w-auto transition-all duration-300 ${
                scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-12'
              }`}
            />
            <div className="hidden xs:block">
              <div className={`font-bold text-foreground transition-all duration-300 ${
                scrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}>
                S&S Messebau
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Full-Service Messebau
              </div>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1">
            {PRIMARY_NAV.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={`transition-colors ${
                  currentPath === item.path 
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size={scrolled ? 'sm' : 'default'}
              >
                {item.label}
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={scrolled ? 'sm' : 'default'}
                  className="gap-1"
                >
                  Mehr
                  <CaretDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-2 flex items-center gap-1">
              <Button
                variant="outline"
                onClick={() => handleNavigation('/banner-bestellen')}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                size={scrolled ? 'sm' : 'default'}
              >
                Banner konfigurieren
              </Button>
              <Button
                variant="default"
                onClick={onOpenInquiry}
                className="bg-accent hover:bg-accent/90"
                size={scrolled ? 'sm' : 'default'}
              >
                Projekt anfragen
              </Button>
            </div>
          </nav>

          <nav className="hidden md:flex xl:hidden items-center gap-1">
            {PRIMARY_NAV.slice(0, 3).map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={`transition-colors ${
                  currentPath === item.path 
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size="sm"
              >
                {item.label}
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Mehr
                  <CaretDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {[...PRIMARY_NAV.slice(3), ...SECONDARY_NAV].map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-1 flex items-center gap-1">
              <Button
                variant="default"
                onClick={onOpenInquiry}
                className="bg-accent hover:bg-accent/90"
                size="sm"
              >
                Anfragen
              </Button>
            </div>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenInquiry}
              className="bg-accent hover:bg-accent/90 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              Anfragen
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <List className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 px-0">
                <div className="flex items-center justify-between px-6 mb-6">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="S&S Messebau Logo" className="h-9 w-auto" />
                    <span className="font-bold text-lg">Menü</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="px-4 overflow-y-auto max-h-[calc(100vh-180px)]">
                  <Button
                    onClick={() => handleNavigation('/banner-bestellen')}
                    className="w-full mb-4 bg-primary hover:bg-primary/90"
                  >
                    <FrameCorners className="h-5 w-5 mr-2" />
                    Banner konfigurieren
                  </Button>

                  <nav className="flex flex-col gap-1">
                    {ALL_NAV.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.path}
                          variant={currentPath === item.path ? 'secondary' : 'ghost'}
                          onClick={() => handleNavigation(item.path)}
                          className="justify-start gap-3 h-11 w-full"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-left">{item.label}</span>
                        </Button>
                      )
                    })}
                  </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t bg-background">
                  <div className="space-y-2.5 text-sm">
                    <a 
                      href="tel:+4924334427144" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>(02433) 4427144</span>
                    </a>
                    <a 
                      href="mailto:info@sundsmessebau.de" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Envelope className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">info@sundsmessebau.de</span>
                    </a>
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
