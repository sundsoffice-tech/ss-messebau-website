import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StickyCTA, MobileStickyCTA } from './components/StickyCTA'
import { InquiryDialog } from './components/InquiryDialog'
import { LoadingScreen } from './components/LoadingScreen'
import { NavigationLoadingIndicator } from './components/NavigationLoadingIndicator'
import { HomePage } from './components/pages/HomePage'
import { LeistungenPage } from './components/pages/LeistungenPage'
import { BranchenPage } from './components/pages/BranchenPage'
import { ReferenzenPage } from './components/pages/ReferenzenPage'
import { KontaktPage } from './components/pages/KontaktPage'
import { BlogPage } from './components/pages/BlogPage'
import { UeberUnsPage, AblaufPage, NachhaltigkeitPage, ImpressumPage, DatenschutzPage, KIBeraterPage } from './components/pages/OtherPages'
import { BannerrahmenPage } from './components/pages/BannerrahmenPage'
import { BannerBestellenPage } from './components/pages/BannerBestellenPage'
import { AdminPage } from './components/pages/AdminPage'
import { parseDeepLink, scrollToSectionWithRetry, normalizePagePath } from './lib/deep-linking'
import { useSmoothScrollLinks } from './hooks/use-smooth-scroll'

function App() {
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('/')

  useSmoothScrollLinks()

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
    <>
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
          {renderPage()}
        </main>
        <Footer />
        <StickyCTA onClick={() => setInquiryDialogOpen(true)} />
        <MobileStickyCTA onClick={() => setInquiryDialogOpen(true)} />
        <InquiryDialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen} />
        <Toaster position="top-center" richColors />
      </div>
    </>
  )
}

export default App