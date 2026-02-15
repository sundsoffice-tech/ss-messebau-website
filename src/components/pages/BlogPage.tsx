import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_BLOG_POSTS } from '@/lib/demo-data'
import { Article, ArrowRight, Clock } from '@phosphor-icons/react'
import { trackHeroCTAClick } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking, useArticleReadTracking } from '@/hooks/use-analytics'
import { useTranslation } from '@/lib/i18n'

interface BlogPageProps {
  onOpenInquiry: () => void
}

export function BlogPage({ onOpenInquiry }: BlogPageProps) {
  const { t, lang } = useTranslation()
  const currentSlug = window.location.hash.startsWith('#/blog/')
    ? window.location.hash.replace('#/blog/', '')
    : undefined

  useScrollDepthTracking('blog')
  useDwellTimeTracking('blog')
  useArticleReadTracking(currentSlug)

  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div>
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
            <Article className="h-8 w-8 md:h-10 md:w-10 shrink-0" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{t('blog.hero.title')}</h1>
          </div>
          <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl leading-relaxed">
            {t('blog.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {DEMO_BLOG_POSTS.map((post) => (
              <Card key={post.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col border-2 hover:border-primary cursor-pointer">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    width="640"
                    height="360"
                    loading="lazy"
                    decoding="async"
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4">
                    <Badge className="bg-primary text-primary-foreground shadow-lg text-xs md:text-sm">{post.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 md:mb-3 text-xs md:text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                    <span className="truncate">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base mb-4 flex-1 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation(`/blog/${post.slug}`)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors min-h-[44px] text-sm md:text-base"
                  >
                    {t('blog.readMore')}
                    <ArrowRight className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 leading-tight">{t('blog.cta.heading')}</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('blog.cta.text')}
          </p>
          <Button size="lg" onClick={() => { trackHeroCTAClick('blog_cta'); onOpenInquiry() }} className="bg-accent hover:bg-accent/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg">
            {t('blog.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
