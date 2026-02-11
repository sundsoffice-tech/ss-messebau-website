import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  List, 
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
  CaretDown,
  Storefront,
  Microphone,
  Armchair,
  Package,
  PaintBrush,
  Truck,
  Wrench,
  ArrowRight
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

const LEISTUNGEN_MEGA_MENU = [
  {
    title: 'Messebau',
    description: 'Professionelle Messestände von 20-200 qm',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Design & Konzeption', 'Standbau & Montage', 'Full-Service-Betreuung'],
    gradient: 'from-blue-500/10 to-blue-600/5',
    previewImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
  },
  {
    title: 'Eventbau & Bühnen',
    description: 'Eindrucksvolle Event-Locations',
    icon: Microphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Bühnenaufbau', 'Event-Ausstattung', 'Technik-Integration'],
    gradient: 'from-purple-500/10 to-purple-600/5',
    previewImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'
  },
  {
    title: 'Ladenbau & Showrooms',
    description: 'Verkaufsräume die überzeugen',
    icon: Storefront,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Ladeneinrichtung', 'Showroom-Design', 'Präsentationssysteme'],
    gradient: 'from-orange-500/10 to-orange-600/5',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
  },
  {
    title: 'Böden & Ausstattung',
    description: 'Hochwertige Komplettlösungen',
    icon: Armchair,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['Messeboden-Systeme', 'Möbel & Ausstattung', 'Beleuchtung'],
    gradient: 'from-green-500/10 to-green-600/5',
    previewImage: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop'
  }
]

const LEISTUNGEN_SERVICES = [
  { label: 'Design & Konzeption', icon: PaintBrush },
  { label: 'Logistik & Transport', icon: Truck },
  { label: 'Montage & Service', icon: Wrench }
]

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
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const sheetContentRef = useRef<HTMLDivElement>(null)
  const currentPath = window.location.hash.slice(1) || '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuOpen &&
        megaMenuRef.current &&
        megaMenuTriggerRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        !megaMenuTriggerRef.current.contains(event.target as Node)
      ) {
        setMegaMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [megaMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen || !sheetContentRef.current) return

    const sheetContent = sheetContentRef.current
    let isDragging = false
    let startX = 0
    let startY = 0
    let currentX = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      currentX = startX
      isDragging = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX
      const deltaX = currentX - startX
      const deltaY = Math.abs(e.touches[0].clientY - startY)
      
      if (!isDragging && Math.abs(deltaX) > 10 && deltaY < 50) {
        isDragging = true
      }

      if (isDragging && deltaX > 0) {
        e.preventDefault()
        sheetContent.style.transform = `translateX(${deltaX}px)`
        sheetContent.style.transition = 'none'
        
        const opacity = Math.max(0, 1 - (deltaX / (window.innerWidth * 0.5)))
        const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
        if (overlay) {
          overlay.style.opacity = opacity.toString()
        }
      }
    }

    const handleTouchEnd = () => {
      if (!isDragging) {
        sheetContent.style.transform = ''
        sheetContent.style.transition = ''
        return
      }

      const deltaX = currentX - startX
      const threshold = window.innerWidth * 0.25

      sheetContent.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      
      const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
      if (overlay) {
        overlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }

      if (deltaX > threshold) {
        setMobileMenuOpen(false)
      } else {
        sheetContent.style.transform = ''
        if (overlay) {
          overlay.style.opacity = ''
        }
      }

      isDragging = false
    }

    const handleTouchCancel = () => {
      sheetContent.style.transform = ''
      sheetContent.style.transition = ''
      isDragging = false
      
      const overlay = document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement
      if (overlay) {
        overlay.style.opacity = ''
        overlay.style.transition = ''
      }
    }

    sheetContent.addEventListener('touchstart', handleTouchStart, { passive: true })
    sheetContent.addEventListener('touchmove', handleTouchMove, { passive: false })
    sheetContent.addEventListener('touchend', handleTouchEnd, { passive: true })
    sheetContent.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      sheetContent.removeEventListener('touchstart', handleTouchStart)
      sheetContent.removeEventListener('touchmove', handleTouchMove)
      sheetContent.removeEventListener('touchend', handleTouchEnd)
      sheetContent.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [mobileMenuOpen])

  const handleNavigation = (path: string) => {
    window.location.hash = path
    setMobileMenuOpen(false)
    setMegaMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLeistungenClick = () => {
    if (megaMenuOpen) {
      handleNavigation('/leistungen')
    } else {
      setMegaMenuOpen(true)
    }
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-background/98 backdrop-blur-md shadow-sm' 
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          <button 
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 sm:gap-3 transition-all hover:opacity-80 flex-shrink-0 min-h-[44px] min-w-[44px] -ml-2 pl-2 group"
          >
            <div className={`relative flex-shrink-0 transition-all duration-300 ${
              scrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-9 h-9 sm:w-12 sm:h-12'
            }`}>
              <img 
                src={logo} 
                alt="S&S Messebau Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
              />
            </div>
            <div className="hidden xs:block">
              <div className={`font-bold text-foreground transition-all duration-300 tracking-tight leading-tight ${
                scrolled ? 'text-sm sm:text-lg' : 'text-base sm:text-xl'
              }`}>
                S&S Messebau
              </div>
              <div className={`text-muted-foreground hidden sm:block transition-all duration-300 tracking-wide ${
                scrolled ? 'text-[10px]' : 'text-xs'
              }`}>
                Full-Service Messebau
              </div>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={`transition-colors ${
                currentPath === '/' 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'hover:text-primary'
              }`}
              size={scrolled ? 'sm' : 'default'}
            >
              Start
            </Button>

            <div className="relative">
              <Button
                ref={megaMenuTriggerRef}
                variant="ghost"
                onClick={handleLeistungenClick}
                onMouseEnter={() => setMegaMenuOpen(true)}
                className={`transition-colors gap-1 ${
                  currentPath === '/leistungen' || megaMenuOpen
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size={scrolled ? 'sm' : 'default'}
              >
                Leistungen
                <CaretDown className={`h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </Button>

              {megaMenuOpen && (
                <div
                  ref={megaMenuRef}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[900px] z-50"
                >
                  <div className="bg-background border rounded-lg shadow-2xl p-6 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {LEISTUNGEN_MEGA_MENU.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.title}
                            onClick={() => handleNavigation('/leistungen')}
                            className="group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary hover:shadow-xl"
                          >
                            <div className="aspect-[16/9] relative overflow-hidden">
                              <img
                                src={item.previewImage}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`} />
                              <div className={`absolute top-3 left-3 ${item.bgColor} ${item.color} p-2 rounded-lg`}>
                                <Icon className="h-5 w-5" weight="duotone" />
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                                {item.description}
                              </p>
                              
                              <ul className="space-y-1.5">
                                {item.features.map((feature) => (
                                  <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {LEISTUNGEN_SERVICES.map((service) => {
                            const Icon = service.icon
                            return (
                              <button
                                key={service.label}
                                onClick={() => handleNavigation('/leistungen')}
                                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                <span>{service.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        
                        <Button
                          onClick={() => handleNavigation('/leistungen')}
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-primary hover:text-primary"
                        >
                          Alle Leistungen anzeigen
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {PRIMARY_NAV.slice(2).map((item) => (
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
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className={`transition-colors ${
                currentPath === '/' 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'hover:text-primary'
              }`}
              size="sm"
            >
              Start
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                onClick={handleLeistungenClick}
                className={`transition-colors gap-1 ${
                  currentPath === '/leistungen'
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size="sm"
              >
                Leistungen
                <CaretDown className="h-4 w-4" />
              </Button>
            </div>

            {PRIMARY_NAV.slice(2, 3).map((item) => (
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

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenInquiry}
              className="bg-accent hover:bg-accent/90 text-sm px-3 py-2 min-h-[44px]"
            >
              Anfragen
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3 min-h-[44px] min-w-[44px]">
                  <List className="h-6 w-6" />
                  <span className="sr-only">Menü öffnen</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 px-0" ref={sheetContentRef}>
                <div className="flex items-center px-4 mb-6 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img 
                        src={logo} 
                        alt="S&S Messebau Logo" 
                        className="w-full h-full object-contain filter drop-shadow-sm" 
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-lg leading-none tracking-tight text-foreground">Menü</span>
                      <span className="text-[10px] text-muted-foreground tracking-wide leading-none">Navigation</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-3 overflow-y-auto max-h-[calc(100vh-180px)]">
                  <Button
                    onClick={() => handleNavigation('/banner-bestellen')}
                    className="w-full mb-4 bg-primary hover:bg-primary/90 min-h-[48px] text-base font-medium"
                  >
                    <FrameCorners className="h-5 w-5 mr-2" />
                    Banner konfigurieren
                  </Button>

                  <nav className="flex flex-col gap-2">
                    <Button
                      variant={currentPath === '/' ? 'secondary' : 'ghost'}
                      onClick={() => handleNavigation('/')}
                      className="justify-start gap-3 min-h-[48px] w-full text-base"
                    >
                      <House className="h-5 w-5 flex-shrink-0" />
                      <span className="text-left">Start</span>
                    </Button>

                    <div className="my-3">
                      <div className="px-3 mb-3 text-sm font-semibold text-muted-foreground">
                        Leistungen
                      </div>
                      <div className="space-y-2">
                        {LEISTUNGEN_MEGA_MENU.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.title}
                              onClick={() => handleNavigation('/leistungen')}
                              className="w-full group relative overflow-hidden rounded-lg border p-4 text-left transition-all hover:border-primary hover:shadow-md min-h-[56px]"
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                              
                              <div className="relative flex items-center gap-3">
                                <div className={`${item.bgColor} ${item.color} p-2.5 rounded-lg flex-shrink-0`}>
                                  <Icon className="h-5 w-5" weight="duotone" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-base text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                    {item.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation('/leistungen')}
                        className="w-full mt-3 gap-2 text-primary min-h-[44px] text-base"
                      >
                        Alle Leistungen anzeigen
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {ALL_NAV.slice(2).map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.path}
                          variant={currentPath === item.path ? 'secondary' : 'ghost'}
                          onClick={() => handleNavigation(item.path)}
                          className="justify-start gap-3 min-h-[48px] w-full text-base"
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
