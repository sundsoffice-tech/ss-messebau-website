import { useState, useEffect, useRef, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
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
import { navigateToPageAndSection, parseDeepLink } from '@/lib/deep-linking'

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
    previewImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    sectionId: 'messebau'
  },
  {
    title: 'Eventbau & Bühnen',
    description: 'Eindrucksvolle Event-Locations',
    icon: Microphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Bühnenaufbau', 'Event-Ausstattung', 'Technik-Integration'],
    gradient: 'from-purple-500/10 to-purple-600/5',
    previewImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    sectionId: 'eventbau'
  },
  {
    title: 'Ladenbau & Showrooms',
    description: 'Verkaufsräume die überzeugen',
    icon: Storefront,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Ladeneinrichtung', 'Showroom-Design', 'Präsentationssysteme'],
    gradient: 'from-orange-500/10 to-orange-600/5',
    previewImage: '/images/ladenbau/ladenbau-display-regal-led-beleuchtung.jpg',
    sectionId: 'ladenbau'
  },
  {
    title: 'Böden & Ausstattung',
    description: 'Hochwertige Komplettlösungen',
    icon: Armchair,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['Messeboden-Systeme', 'Möbel & Ausstattung', 'Beleuchtung'],
    gradient: 'from-green-500/10 to-green-600/5',
    previewImage: '/images/boeden/showroom-bodenproben-ausstellung.jpg',
    sectionId: 'boeden-ausstattung'
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
  { label: 'Über uns', path: '/ueber-uns', icon: Users },
  { label: 'Ablauf', path: '/ablauf', icon: Path },
  { label: 'Nachhaltigkeit', path: '/nachhaltigkeit', icon: Leaf },
  { label: 'Blog', path: '/blog', icon: Article },
  { label: 'Kontakt', path: '/kontakt', icon: Envelope }
]

const MegaMenuItem = memo(({ item, onNavigate }: { item: typeof LEISTUNGEN_MEGA_MENU[0], onNavigate: (sectionId: string) => void }) => {
  const Icon = item.icon
  return (
    <button
      onClick={() => onNavigate(item.sectionId)}
      className="group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`${item.title} - ${item.description}`}
    >
      <div className="aspect-[2/1] relative overflow-hidden">
        <img
          src={item.previewImage}
          alt={`Vorschaubild für ${item.title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`} />
        <div className={`absolute top-3 left-3 ${item.bgColor} ${item.color} p-2 rounded-lg`}>
          <Icon className="h-5 w-5" weight="duotone" aria-hidden="true" />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {item.description}
        </p>
        
        <ul className="space-y-1" aria-label={`${item.title} Features`}>
          {item.features.map((feature) => (
            <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
})

MegaMenuItem.displayName = 'MegaMenuItem'

export function Header({ onOpenInquiry }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => parseDeepLink(window.location.hash).page)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const tabletMegaMenuRef = useRef<HTMLDivElement>(null)
  const tabletMegaMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const sheetContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePath = () => setCurrentPath(parseDeepLink(window.location.hash).page)
    window.addEventListener('hashchange', updatePath)
    return () => window.removeEventListener('hashchange', updatePath)
  }, [])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuOpen) {
        const isClickOutside = 
          (!megaMenuRef.current || !megaMenuRef.current.contains(event.target as Node)) &&
          (!megaMenuTriggerRef.current || !megaMenuTriggerRef.current.contains(event.target as Node)) &&
          (!tabletMegaMenuRef.current || !tabletMegaMenuRef.current.contains(event.target as Node)) &&
          (!tabletMegaMenuTriggerRef.current || !tabletMegaMenuTriggerRef.current.contains(event.target as Node))
        
        if (isClickOutside) {
          setMegaMenuOpen(false)
        }
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
      const absDeltaX = Math.abs(deltaX)
      
      // Vertical scrolling takes priority
      if (!isDragging && deltaY > 30) {
        return
      }
      
      if (!isDragging && absDeltaX > 50 && absDeltaX > deltaY * 3) {
        isDragging = true
      }

      // For left-side sheet, allow negative deltaX (swipe left to close)
      if (isDragging && deltaX < 0) {
        e.preventDefault()
        sheetContent.style.transform = `translateX(${deltaX}px)`
        sheetContent.style.transition = 'none'
        
        const opacity = Math.max(0, 1 - (Math.abs(deltaX) / (window.innerWidth * 0.5)))
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

      // For left-side sheet, close if swiped left beyond threshold
      if (deltaX < -threshold) {
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

  const handleNavigation = (path: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    setMobileMenuOpen(false)
    setMegaMenuOpen(false)
    window.location.hash = path
  }

  const handleSectionNavigation = (sectionId: string) => {
    setMobileMenuOpen(false)
    setMegaMenuOpen(false)
    navigateToPageAndSection('/leistungen', sectionId)
  }

  const handleLeistungenClick = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
    }
    setMegaMenuOpen(prev => !prev)
  }

  const handleMegaMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setMegaMenuOpen(false)
      // Focus the appropriate trigger button based on which menu is open
      if (tabletMegaMenuRef.current?.contains(e.target as Node)) {
        tabletMegaMenuTriggerRef.current?.focus()
      } else {
        megaMenuTriggerRef.current?.focus()
      }
      return
    }

    // Enhanced keyboard navigation for mega menu items
    // Check both desktop and tablet menu refs
    const menuRef = megaMenuRef.current?.contains(e.target as Node) 
      ? megaMenuRef.current 
      : tabletMegaMenuRef.current
      
    const focusableElements = menuRef?.querySelectorAll(
      'button:not([disabled]), a:not([disabled])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return

    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement as HTMLElement
    )

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = currentIndex + 1
      if (nextIndex < focusableElements.length) {
        (focusableElements[nextIndex] as HTMLElement).focus()
      } else {
        (focusableElements[0] as HTMLElement).focus()
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        (focusableElements[prevIndex] as HTMLElement).focus()
      } else {
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      (focusableElements[0] as HTMLElement).focus()
    } else if (e.key === 'End') {
      e.preventDefault();
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
    }
  }

  const handleMegaMenuBlur = (e: React.FocusEvent) => {
    const inDesktopMenu = megaMenuRef.current && megaMenuRef.current.contains(e.relatedTarget as Node)
    const inTabletMenu = tabletMegaMenuRef.current && tabletMegaMenuRef.current.contains(e.relatedTarget as Node)
    
    if (!inDesktopMenu && !inTabletMenu) {
      setTimeout(() => setMegaMenuOpen(false), 150)
    }
  }

  // Prefetch mega menu images on hover/focus for better performance
  const handleLeistungenHover = () => {
    setMegaMenuOpen(true)
    
    // Prefetch images for instant loading
    LEISTUNGEN_MEGA_MENU.forEach(item => {
      const img = new Image()
      img.src = item.previewImage
    })
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-background/98 backdrop-blur-md shadow-sm' 
          : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}
      role="banner"
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          <a
            href="#/"
            onClick={(e) => handleNavigation('/', e)}
            className="flex items-center gap-2 sm:gap-3 transition-all hover:opacity-80 focus-visible:opacity-80 flex-shrink-0 min-h-[44px] min-w-[44px] -ml-2 pl-2 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="S&S Messebau - Zur Startseite"
            aria-current={currentPath === '/' ? 'page' : undefined}
          >
            <div className={`relative flex-shrink-0 transition-all duration-300 ${
              scrolled ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-9 h-9 sm:w-12 sm:h-12'
            }`}>
              <img 
                src={logo} 
                alt="S&S Messebau Logo"
                width="48"
                height="48"
                loading="eager"
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
          </a>

          <nav className="hidden xl:flex items-center gap-1" aria-label="Hauptnavigation">
            <Button
              asChild
              variant="ghost"
              className={`transition-colors ${
                currentPath === '/' 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'hover:text-primary'
              }`}
              size={scrolled ? 'sm' : 'default'}
            >
              <a 
                href="#/"
                onClick={(e) => handleNavigation('/', e)}
                aria-current={currentPath === '/' ? 'page' : undefined}
              >
                Start
              </a>
            </Button>

            <div className="relative">
              <Button
                ref={megaMenuTriggerRef}
                variant="ghost"
                onClick={handleLeistungenClick}
                onKeyDown={handleMegaMenuKeyDown}
                onMouseEnter={handleLeistungenHover}
                onFocus={handleLeistungenHover}
                className={`transition-colors gap-1 ${
                  currentPath === '/leistungen' || megaMenuOpen
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size={scrolled ? 'sm' : 'default'}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
                aria-controls="leistungen-mega-menu"
              >
                Leistungen
                <CaretDown className={`h-4 w-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </Button>

              {megaMenuOpen && (
                <div
                  id="leistungen-mega-menu"
                  ref={megaMenuRef}
                  role="region"
                  aria-label="Leistungen Übersicht"
                  onMouseLeave={() => setMegaMenuOpen(false)}
                  onKeyDown={handleMegaMenuKeyDown}
                  onBlur={handleMegaMenuBlur}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(900px,calc(100vw-2rem))] z-50 max-h-[calc(100vh-80px)]"
                >
                  <div className="bg-background border rounded-lg shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-200 overflow-y-auto max-h-[calc(100vh-100px)]">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {LEISTUNGEN_MEGA_MENU.map((item) => (
                        <MegaMenuItem 
                          key={item.sectionId}
                          item={item}
                          onNavigate={handleSectionNavigation}
                        />
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {LEISTUNGEN_SERVICES.map((service) => {
                            const Icon = service.icon
                            return (
                              <button
                                key={service.label}
                                onClick={(e) => handleNavigation('/leistungen', e)}
                                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                <span>{service.label}</span>
                              </button>
                            )
                          })}
                        </div>
                        
                        <Button
                          onClick={(e) => handleNavigation('/leistungen', e)}
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-primary hover:text-primary"
                        >
                          Alle Leistungen anzeigen
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                asChild
                variant="ghost"
                className={`transition-colors ${
                  currentPath === item.path 
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size={scrolled ? 'sm' : 'default'}
              >
                <a
                  href={`#${item.path}`}
                  onClick={(e) => handleNavigation(item.path, e)}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={scrolled ? 'sm' : 'default'}
                  className="gap-1 transition-all duration-200 hover:bg-accent/50"
                  aria-label="Weitere Seiten"
                >
                  Mehr
                  <CaretDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={(e) => handleNavigation(item.path, e as any)}
                      className="gap-3 cursor-pointer px-3 py-2.5 rounded-md transition-all duration-200 hover:bg-accent/80 hover:pl-4 focus:bg-accent/80 focus:pl-4 group"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" aria-hidden="true" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-2 flex items-center gap-1">
              <Button
                variant="outline"
                onClick={(e) => handleNavigation('/banner-bestellen', e)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                size={scrolled ? 'sm' : 'default'}
              >
                Banner konfigurieren
              </Button>
              <Button
                variant="default"
                onClick={onOpenInquiry}
                className="bg-accent hover:bg-accent/90 transition-colors"
                size={scrolled ? 'sm' : 'default'}
              >
                Projekt anfragen
              </Button>
            </div>
          </nav>

          <nav className="hidden md:flex xl:hidden items-center gap-1" aria-label="Hauptnavigation">
            <Button
              asChild
              variant="ghost"
              className={`transition-colors ${
                currentPath === '/' 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'hover:text-primary'
              }`}
              size="sm"
            >
              <a
                href="#/"
                onClick={(e) => handleNavigation('/', e)}
                aria-current={currentPath === '/' ? 'page' : undefined}
              >
                Start
              </a>
            </Button>

            <div className="relative">
              <Button
                ref={tabletMegaMenuTriggerRef}
                variant="ghost"
                onClick={handleLeistungenClick}
                onKeyDown={handleMegaMenuKeyDown}
                className={`transition-colors gap-1 ${
                  currentPath === '/leistungen' || megaMenuOpen
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size="sm"
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
                aria-controls="tablet-leistungen-mega-menu"
              >
                Leistungen
                <CaretDown className={`h-4 w-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </Button>

              {megaMenuOpen && (
                <div
                  id="tablet-leistungen-mega-menu"
                  ref={tabletMegaMenuRef}
                  role="region"
                  aria-label="Leistungen Übersicht"
                  onKeyDown={handleMegaMenuKeyDown}
                  onBlur={handleMegaMenuBlur}
                  className="absolute left-0 top-full mt-2 w-[min(600px,calc(100vw-2rem))] z-50 max-h-[calc(100vh-80px)]"
                >
                  <div className="bg-background border rounded-lg shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-200 overflow-y-auto max-h-[calc(100vh-100px)]">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {LEISTUNGEN_MEGA_MENU.map((item) => (
                        <MegaMenuItem 
                          key={item.sectionId}
                          item={item}
                          onNavigate={handleSectionNavigation}
                        />
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <Button
                        onClick={(e) => handleNavigation('/leistungen', e)}
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-primary hover:text-primary"
                      >
                        Alle Leistungen anzeigen
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {PRIMARY_NAV.slice(2, 3).map((item) => (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={`transition-colors ${
                  currentPath === item.path 
                    ? 'text-primary font-semibold bg-primary/5' 
                    : 'hover:text-primary'
                }`}
                size="sm"
              >
                <a
                  href={`#${item.path}`}
                  onClick={(e) => handleNavigation(item.path, e)}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 transition-all duration-200 hover:bg-accent/50" aria-label="Weitere Seiten">
                  Mehr
                  <CaretDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
                {[...PRIMARY_NAV.slice(3), ...SECONDARY_NAV].map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={(e) => handleNavigation(item.path, e as any)}
                      className="gap-3 cursor-pointer px-3 py-2.5 rounded-md transition-all duration-200 hover:bg-accent/80 hover:pl-4 focus:bg-accent/80 focus:pl-4 group"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" aria-hidden="true" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-1 flex items-center gap-1">
              <Button
                variant="default"
                onClick={onOpenInquiry}
                className="bg-accent hover:bg-accent/90 transition-colors"
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
              className="bg-accent hover:bg-accent/90 transition-colors text-sm px-3 py-2 min-h-[44px]"
            >
              Anfragen
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-3 min-h-[44px] min-w-[44px]"
                  aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                >
                  {mobileMenuOpen 
                    ? <X className="h-6 w-6" aria-hidden="true" />
                    : <List className="h-6 w-6" aria-hidden="true" />
                  }
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(85vw,320px)] px-0" ref={sheetContentRef}>
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Hauptnavigation für mobile Geräte mit Zugriff auf alle Seiten und Leistungen
                </SheetDescription>
                <nav aria-label="Mobile Navigation" className="flex flex-col h-full">
                  <div className="flex items-center justify-between gap-3 px-4 mb-6 pt-2 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img 
                          src={logo} 
                          alt="S&S Messebau Logo"
                          loading="eager" 
                          className="w-full h-full object-contain filter drop-shadow-sm" 
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-lg leading-none tracking-tight text-foreground">Menü</span>
                        <span className="text-[10px] text-muted-foreground tracking-wide leading-none">Navigation</span>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-11 w-11 p-0 rounded-full min-h-[44px] min-w-[44px]"
                        aria-label="Menü schließen"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <div className="px-3 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-2 pb-4">
                      <div className="mb-3">
                        <div className="px-3 mb-3 text-sm font-semibold text-muted-foreground">
                          Leistungen
                        </div>
                        <div className="space-y-2">
                          {LEISTUNGEN_MEGA_MENU.map((item) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.sectionId}
                                onClick={() => handleSectionNavigation(item.sectionId)}
                                className="w-full group relative overflow-hidden rounded-lg border p-3 text-left transition-all min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:border-primary active:shadow-md"
                              >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-active:opacity-100 transition-opacity`} />
                                
                                <div className="relative flex items-center gap-2.5">
                                  <div className={`${item.bgColor} ${item.color} p-2 rounded-lg flex-shrink-0`}>
                                    <Icon className="h-4 w-4" weight="duotone" aria-hidden="true" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-foreground group-active:text-primary transition-colors">
                                      {item.title}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full mt-3 gap-2 text-primary min-h-[44px] text-base"
                        >
                          <a
                            href="#/leistungen"
                            onClick={(e) => handleNavigation('/leistungen', e)}
                          >
                            Alle Leistungen anzeigen
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </a>
                        </Button>
                      </div>

                      <Button
                        onClick={(e) => handleNavigation('/banner-bestellen', e)}
                        className="w-full mb-3 bg-primary hover:bg-primary/90 transition-colors min-h-[48px] text-base font-medium"
                      >
                        <FrameCorners className="h-5 w-5 mr-2" aria-hidden="true" />
                        Banner konfigurieren
                      </Button>

                      {/* Visual separation between services and page navigation */}
                      <div className="my-3 border-t" />
                      <div className="px-3 mb-2 text-sm font-semibold text-muted-foreground">
                        Seiten
                      </div>

                      <Button
                        asChild
                        variant={currentPath === '/' ? 'secondary' : 'ghost'}
                        className="justify-start gap-3 min-h-[48px] w-full text-base"
                      >
                        <a
                          href="#/"
                          onClick={(e) => handleNavigation('/', e)}
                          aria-current={currentPath === '/' ? 'page' : undefined}
                        >
                          <House className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-left">Start</span>
                        </a>
                      </Button>

                      {PRIMARY_NAV.slice(2).map((item) => {
                        const Icon = item.icon
                        return (
                          <Button
                            key={item.path}
                            asChild
                            variant={currentPath === item.path ? 'secondary' : 'ghost'}
                            className="justify-start gap-3 min-h-[48px] w-full text-base"
                          >
                            <a
                              href={`#${item.path}`}
                              onClick={(e) => handleNavigation(item.path, e)}
                              aria-current={currentPath === item.path ? 'page' : undefined}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                              <span className="text-left">{item.label}</span>
                            </a>
                          </Button>
                        )
                      })}

                      {/* Separator between primary and secondary navigation */}
                      <div className="mt-2 mb-2 border-t pt-3">
                        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Weitere
                        </div>
                      </div>

                      {SECONDARY_NAV.map((item) => {
                        const Icon = item.icon
                        return (
                          <Button
                            key={item.path}
                            asChild
                            variant={currentPath === item.path ? 'secondary' : 'ghost'}
                            className="justify-start gap-3 min-h-[48px] w-full text-base"
                          >
                            <a
                              href={`#${item.path}`}
                              onClick={(e) => handleNavigation(item.path, e)}
                              aria-current={currentPath === item.path ? 'page' : undefined}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                              <span className="text-left">{item.label}</span>
                            </a>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-6 py-4 border-t bg-background">
                    <div className="space-y-2.5 text-sm">
                      <a 
                        href="tel:+4917631570041" 
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors min-h-[44px] -mx-2 px-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="Anrufen: +49 176 31570041"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>+49 176 31570041</span>
                      </a>
                      <a 
                        href="mailto:sunds-messebau@gmx.de" 
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors min-h-[44px] -mx-2 px-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="E-Mail senden an sunds-messebau@gmx.de"
                      >
                        <Envelope className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">sunds-messebau@gmx.de</span>
                      </a>
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
