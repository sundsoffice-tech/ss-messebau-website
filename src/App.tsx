import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StickyCTA, MobileStickyCTA } from './components/StickyCTA'
import { InquiryDialog } from './components/InquiryDialog'
import { LoadingScreen } from './components/LoadingScreen'
import { HomePage } from './components/pages/HomePage'
import { LeistungenPage } from './components/pages/LeistungenPage'
import { BranchenPage } from './components/pages/BranchenPage'
import { ReferenzenPage } from './components/pages/ReferenzenPage'
import { KontaktPage } from './components/pages/KontaktPage'
import { BlogPage } from './components/pages/BlogPage'
import { UeberUnsPage, AblaufPage, NachhaltigkeitPage, ImpressumPage, DatenschutzPage } from './components/pages/OtherPages'
import { BannerrahmenPage } from './components/pages/BannerrahmenPage'
import { BannerBestellenPage } from './components/pages/BannerBestellenPage'

function App() {
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('/')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/'
      setCurrentPage(hash)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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
      case '/bannerrahmen':
        return <BannerrahmenPage onOpenInquiry={onOpenInquiry} />
      case '/banner-bestellen':
        return <BannerBestellenPage onOpenInquiry={onOpenInquiry} />
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
      <div className="min-h-screen flex flex-col">
        <Header onOpenInquiry={() => setInquiryDialogOpen(true)} />
        <main className="flex-1">
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