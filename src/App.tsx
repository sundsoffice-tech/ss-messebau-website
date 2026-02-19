import { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StickyCTA, MobileStickyCTA } from './components/StickyCTA'
import { InquiryDialog } from './components/InquiryDialog'
import { LoadingScreen } from './components/LoadingScreen'
import { NavigationLoadingIndicator } from './components/NavigationLoadingIndicator'
import CookieConsent from './components/CookieConsent'
import { CustomCursor } from './components/CustomCursor'
import { CursorGlow } from './components/CursorGlow'
import { CursorRipple, useCursorScale } from './components/CursorEffects'
import { parseDeepLink, scrollToSectionWithRetry, normalizePagePath, navigate } from './lib/deep-linking'
import { useSmoothScrollLinks } from './hooks/use-smooth-scroll'
import { usePageMeta } from './hooks/use-page-meta'
import { usePageViewTracking } from './hooks/use-page-view-tracking'
import { useHeartbeat } from './hooks/use-heartbeat'
import { I18nContext, getTranslation, getStoredLanguage, storeLanguage, type Language } from './lib/i18n'
import { useUIStore } from './store/ui-store'
import { PageErrorBoundary } from './components/PageErrorBoundary'

// Eager load critical SEO pages so crawlers get content immediately
import { HomePage } from './components/pages/HomePage'
import { LeistungenHubPage } from './components/pages/LeistungenHubPage'
import { KontaktPage } from './components/pages/KontaktPage'

// Lazy load remaining page components for code-splitting
const BranchenPage = lazy(() => import('./components/pages/BranchenPage').then(m => ({ default: m.BranchenPage })))
const ReferenzenPage = lazy(() => import('./components/pages/ReferenzenPage').then(m => ({ default: m.ReferenzenPage })))
const BlogPage = lazy(() => import('./components/pages/BlogPage').then(m => ({ default: m.BlogPage })))
const UeberUnsPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.UeberUnsPage })))
const AblaufPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.AblaufPage })))
const NachhaltigkeitPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.NachhaltigkeitPage })))
const ImpressumPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.ImpressumPage })))
const DatenschutzPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.DatenschutzPage })))
const KIBeraterPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.KIBeraterPage })))
const BannerrahmenPage = lazy(() => import('./components/pages/BannerrahmenPage').then(m => ({ default: m.BannerrahmenPage })))
const BannerBestellenPage = lazy(() => import('./components/pages/BannerBestellenPage').then(m => ({ default: m.BannerBestellenPage })))
const AktuellesPage = lazy(() => import('./components/pages/AktuellesPage').then(m => ({ default: m.AktuellesPage })))
const LeistungenMessebauPage = lazy(() => import('./components/pages/LeistungenMessebauPage').then(m => ({ default: m.LeistungenMessebauPage })))
const LeistungenEventbauPage = lazy(() => import('./components/pages/LeistungenEventbauPage').then(m => ({ default: m.LeistungenEventbauPage })))
const LeistungenShowroomsPage = lazy(() => import('./components/pages/LeistungenShowroomsPage').then(m => ({ default: m.LeistungenShowroomLadenbauPage })))
const LeistungenTourenPage = lazy(() => import('./components/pages/LeistungenTourenPage').then(m => ({ default: m.LeistungenTourenPage })))
const LeistungenBoedenPage = lazy(() => import('./components/pages/LeistungenBoedenPage').then(m => ({ default: m.LeistungenBoedenPage })))
const LeistungenDigitalPage = lazy(() => import('./components/pages/LeistungenDigitalPage').then(m => ({ default: m.LeistungenDigitalPage })))
const AdminPage = lazy(() => import('./components/pages/AdminPage').then(m => ({ default: m.AdminPage })))

function App() {
  const { inquiryDialogOpen, openInquiry, setInquiryOpen } = useUIStore()
  const [currentPage, setCurrentPage] = useState('/')
  const [lang, setLangState] = useState<Language>(getStoredLanguage)

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    storeLanguage(newLang)
    document.documentElement.lang = newLang
  }

  const t = getTranslation(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useSmoothScrollLinks()
  useCursorScale() // Add cursor scale effect
  usePageMeta(currentPage)
  usePageViewTracking() // First-party analytics page view tracking
  useHeartbeat() // Real-time visitor presence heartbeat

  // FOUT guard: remove js-loading class after React's first DOM commit
  useLayoutEffect(() => {
    document.documentElement.classList.remove('js-loading')
    if ((window as any).__jsLoadingTimeout) {
      clearTimeout((window as any).__jsLoadingTimeout)
    }
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      const deepLink = parseDeepLink()
      const page = normalizePagePath(deepLink.page)
      const section = deepLink.section

      setCurrentPage(page)

      if (section) {
        scrollToSectionWithRetry(section, {
          maxRetries: 20,
          retryDelay: 150
        })
      } else {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        })
      }
    }

    // Legacy hash-based URL support: redirect #/page to /page
    const handleHashCompat = () => {
      const hash = window.location.hash
      if (hash && hash.startsWith('#/')) {
        const cleanPath = hash.slice(1) // #/leistungen -> /leistungen
        window.history.replaceState(null, '', cleanPath)
      }
      handleRouteChange()
    }

    handleHashCompat()
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleHashCompat)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleHashCompat)
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case '/':
        return <HomePage />
      case '/leistungen':
        return <LeistungenHubPage />
      case '/leistungen/messebau':
        return <LeistungenMessebauPage />
      case '/leistungen/eventbau':
        return <LeistungenEventbauPage />
      case '/leistungen/showroom-ladenbau':
        return <LeistungenShowroomsPage />
      case '/leistungen/showrooms':
      case '/leistungen/ladenbau':
      case '/leistungen/brandspaces':
        // Redirect old paths to new combined path
        navigate('/leistungen/showroom-ladenbau')
        return null
      case '/leistungen/touren':
        return <LeistungenTourenPage />
      case '/leistungen/boeden-ausstattung':
        return <LeistungenBoedenPage />
      case '/leistungen/digital-experience':
        return <LeistungenDigitalPage />
      case '/branchen':
        return <BranchenPage />
      case '/referenzen':
        return <ReferenzenPage />
      case '/ueber-uns':
        return <UeberUnsPage />
      case '/ablauf':
        return <AblaufPage />
      case '/nachhaltigkeit':
        return <NachhaltigkeitPage />
      case '/blog':
        return <BlogPage />
      case '/aktuelles':
        return <AktuellesPage />
      case '/kontakt':
        return <KontaktPage />
      case '/ki-berater':
        return <KIBeraterPage />
      case '/bannerrahmen':
        return <BannerrahmenPage />
      case '/banner-bestellen':
        return <BannerBestellenPage />
      case '/admin':
        return <AdminPage />
      case '/impressum':
        return <ImpressumPage />
      case '/datenschutz':
        return <DatenschutzPage />
      default:
        if (currentPage.startsWith('/blog/')) {
          return <BlogPage />
        }
        return <HomePage />
    }
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <CustomCursor isVisible={true} />
      <CursorGlow />
      <CursorRipple />
      <LoadingScreen />
      <NavigationLoadingIndicator />
      <div className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:shadow-lg"
        >
          Zum Hauptinhalt springen
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 mobile-safe-bottom focus:outline-none">
          <PageErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="sr-only">Seite wird geladen...</span>
              </div>
            }>
              {renderPage()}
            </Suspense>
          </PageErrorBoundary>
        </main>
        <Footer />
        <StickyCTA onClick={openInquiry} />
        <MobileStickyCTA onClick={openInquiry} />
        <InquiryDialog open={inquiryDialogOpen} onOpenChange={setInquiryOpen} />
        <CookieConsent />
        <Toaster position="top-center" richColors />
      </div>
    </I18nContext.Provider>
  )
}

export default App
