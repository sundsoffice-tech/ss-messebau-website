import { useState, useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StickyCTA, MobileStickyCTA } from './components/StickyCTA'
import { InquiryDialog } from './components/InquiryDialog'
import { LoadingScreen } from './components/LoadingScreen'
import { NavigationLoadingIndicator } from './components/NavigationLoadingIndicator'
import { CustomCursor } from './components/CustomCursor'
import { CursorGlow } from './components/CursorGlow'
import { CursorRipple, useCursorScale } from './components/CursorEffects'
import { parseDeepLink, scrollToSectionWithRetry, normalizePagePath } from './lib/deep-linking'
import { useSmoothScrollLinks } from './hooks/use-smooth-scroll'
import { usePageMeta } from './hooks/use-page-meta'
import { I18nContext, getTranslation, getStoredLanguage, storeLanguage, type Language } from './lib/i18n'

// Lazy load page components for code-splitting
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })))
const LeistungenPage = lazy(() => import('./components/pages/LeistungenPage').then(m => ({ default: m.LeistungenPage })))
const BranchenPage = lazy(() => import('./components/pages/BranchenPage').then(m => ({ default: m.BranchenPage })))
const ReferenzenPage = lazy(() => import('./components/pages/ReferenzenPage').then(m => ({ default: m.ReferenzenPage })))
const KontaktPage = lazy(() => import('./components/pages/KontaktPage').then(m => ({ default: m.KontaktPage })))
const BlogPage = lazy(() => import('./components/pages/BlogPage').then(m => ({ default: m.BlogPage })))
const UeberUnsPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.UeberUnsPage })))
const AblaufPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.AblaufPage })))
const NachhaltigkeitPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.NachhaltigkeitPage })))
const ImpressumPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.ImpressumPage })))
const DatenschutzPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.DatenschutzPage })))
const KIBeraterPage = lazy(() => import('./components/pages/OtherPages').then(m => ({ default: m.KIBeraterPage })))
const BannerrahmenPage = lazy(() => import('./components/pages/BannerrahmenPage').then(m => ({ default: m.BannerrahmenPage })))
const BannerBestellenPage = lazy(() => import('./components/pages/BannerBestellenPage').then(m => ({ default: m.BannerBestellenPage })))
const AdminPage = lazy(() => import('./components/pages/AdminPage').then(m => ({ default: m.AdminPage })))

function App() {
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false)
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

  useEffect(() => {
    const handleHashChange = () => {
      const deepLink = parseDeepLink(window.location.hash)
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

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    
    window.addEventListener('popstate', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  const renderPage = () => {
    const onOpenInquiry = () => setInquiryDialogOpen(true)

    switch (currentPage) {
      case '/':
        return <HomePage onOpenInquiry={onOpenInquiry} />
      case '/leistungen':
        return <LeistungenPage onOpenInquiry={onOpenInquiry} />
      case '/branchen':
        return <BranchenPage onOpenInquiry={onOpenInquiry} />
      case '/referenzen':
        return <ReferenzenPage onOpenInquiry={onOpenInquiry} />
      case '/ueber-uns':
        return <UeberUnsPage onOpenInquiry={onOpenInquiry} />
      case '/ablauf':
        return <AblaufPage onOpenInquiry={onOpenInquiry} />
      case '/nachhaltigkeit':
        return <NachhaltigkeitPage onOpenInquiry={onOpenInquiry} />
      case '/blog':
        return <BlogPage onOpenInquiry={onOpenInquiry} />
      case '/kontakt':
        return <KontaktPage onOpenInquiry={onOpenInquiry} />
      case '/ki-berater':
        return <KIBeraterPage onOpenInquiry={onOpenInquiry} />
      case '/bannerrahmen':
        return <BannerrahmenPage onOpenInquiry={onOpenInquiry} />
      case '/banner-bestellen':
        return <BannerBestellenPage onOpenInquiry={onOpenInquiry} />
      case '/admin':
        return <AdminPage onOpenInquiry={onOpenInquiry} />
      case '/impressum':
        return <ImpressumPage />
      case '/datenschutz':
        return <DatenschutzPage />
      default:
        if (currentPage.startsWith('/blog/')) {
          return <BlogPage onOpenInquiry={onOpenInquiry} />
        }
        return <HomePage onOpenInquiry={onOpenInquiry} />
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
        <Header onOpenInquiry={() => setInquiryDialogOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 mobile-safe-bottom focus:outline-none">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Seite wird geladen...</span>
            </div>
          }>
            {renderPage()}
          </Suspense>
        </main>
        <Footer />
        <StickyCTA onClick={() => setInquiryDialogOpen(true)} />
        <MobileStickyCTA onClick={() => setInquiryDialogOpen(true)} />
        <InquiryDialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen} />
        <Toaster position="top-center" richColors />
      </div>
    </I18nContext.Provider>
  )
}

export default App