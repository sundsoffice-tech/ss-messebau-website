import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DEMO_BLOG_POSTS } from '@/lib/demo-data'
import { getBlogPosts } from '@/lib/admin-content-service'
import { Article, ArrowRight } from '@phosphor-icons/react'
import { trackHeroCTAClick } from '@/lib/analytics'
import { useScrollDepthTracking, useDwellTimeTracking, useArticleReadTracking } from '@/hooks/use-analytics'
import { useTranslation } from '@/lib/i18n'
import { BlogPostCard } from './BlogPostCard'
import { BlogPostDetail } from './BlogPostDetail'
import type { BlogPost } from '@/lib/types'

interface BlogPageProps {
  onOpenInquiry: () => void
}

export function BlogPage({ onOpenInquiry }: BlogPageProps) {
  const { t } = useTranslation()
  const currentSlug = window.location.hash.startsWith('#/blog/')
    ? window.location.hash.replace('#/blog/', '')
    : undefined

  useScrollDepthTracking('blog')
  useDwellTimeTracking('blog')
  useArticleReadTracking(currentSlug)

  // Merge demo blog posts with admin-managed posts
  const allPosts = useMemo<BlogPost[]>(() => {
    const adminPosts = getBlogPosts().map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      imageUrl: p.imageUrl,
      publishedAt: p.publishedAt,
    }))
    return [...DEMO_BLOG_POSTS, ...adminPosts]
      .sort((a, b) => b.publishedAt - a.publishedAt)
  }, [])

  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Detail view: show single article
  if (currentSlug) {
    const post = allPosts.find(p => p.slug === currentSlug)
    if (post) {
      return <BlogPostDetail post={post} onNavigate={handleNavigation} onOpenInquiry={onOpenInquiry} />
    }
    // Slug not found → fall through to overview
  }

  // Overview / listing view
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
            {allPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} onNavigate={handleNavigation} />
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
          <Button size="lg" onClick={() => { trackHeroCTAClick('blog_cta'); onOpenInquiry() }} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto min-h-[52px] text-base md:text-lg">
            {t('blog.cta.button')}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
