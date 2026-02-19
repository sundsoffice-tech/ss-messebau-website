import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Clock } from '@phosphor-icons/react'
import { marked } from 'marked'
import { DEMO_BLOG_POSTS } from '@/lib/demo-blog-posts'
import { useTranslation } from '@/lib/i18n'
import { useUIStore } from '@/store/ui-store'
import { BlogPostCard } from './BlogPostCard'
import { ShareButton } from '@/components/ShareButton'
import { ShareMenu } from '@/components/ShareMenu'
import type { BlogPost } from '@/lib/types'

interface BlogPostDetailProps {
  post: BlogPost
  onNavigate: (path: string) => void
}

export function BlogPostDetail({ post, onNavigate }: BlogPostDetailProps) {
  const { openInquiry } = useUIStore()
  const { t, lang } = useTranslation()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const htmlContent = useMemo(() => {
    return marked.parse(post.content, { async: false }) as string
  }, [post.content])

  // Inject BlogPosting JSON-LD structured data for SEO
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.imageUrl,
      datePublished: new Date(post.publishedAt).toISOString(),
      dateModified: new Date(post.publishedAt).toISOString(),
      author: {
        '@type': 'Organization',
        name: 'S&S Messebau',
        url: 'https://sunds-messebau.de'
      },
      publisher: {
        '@type': 'Organization',
        name: 'S&S Messebau',
        url: 'https://sunds-messebau.de'
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://sunds-messebau.de/blog/${post.slug}`
      }
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.blogSchema = 'true'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      document.head.querySelectorAll('script[data-blog-schema]').forEach(el => el.remove())
    }
  }, [post])

  const relatedPosts = useMemo(() => {
    const sameCategory = DEMO_BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3)
    const needed = 3 - sameCategory.length
    const differentCategory = needed > 0
      ? DEMO_BLOG_POSTS.filter(p => p.id !== post.id && p.category !== post.category).slice(0, needed)
      : []
    return [...sameCategory, ...differentCategory]
  }, [post.id, post.category])

  return (
    <div>
      {/* Hero / Header */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('/blog')}
            className="mb-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('blog.backToOverview')}
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs md:text-sm">
              {post.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
              <Clock className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{post.title}</h1>
          <div className="flex items-center gap-2 mt-4" role="group" aria-label={t('share.ariaLabel')}>
            <span className="text-sm text-primary-foreground/60">{t('share.label')}</span>
            <div className="flex items-center gap-1">
              {(['linkedin', 'whatsapp', 'instagram', 'facebook', 'email', 'copy'] as const).map((platform) => (
                <ShareButton
                  key={platform}
                  platform={platform}
                  url={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.excerpt}
                  size="sm"
                  source="blog_header"
                  campaign="blog_share"
                  className="text-primary-foreground/60 hover:text-primary-foreground"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article Image */}
      <section className="bg-background">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="relative -mt-6 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={post.imageUrl}
              alt={post.title}
              width="1200"
              height="675"
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <article
            className="blog-content max-w-none text-muted-foreground leading-relaxed
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_strong]:text-foreground [&_strong]:font-semibold
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_li]:mb-1 [&_li]:leading-relaxed
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
              [&_th]:text-left [&_th]:text-foreground [&_th]:font-semibold [&_th]:py-2 [&_th]:pr-4 [&_th]:border-b
              [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-border
              [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Back button bottom */}
          <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate('/blog')}
              className="min-h-[44px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.backToOverview')}
            </Button>
            <ShareMenu
              url={`/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
              campaign="blog_share"
              triggerVariant="text"
              triggerLabel={t('share.shareArticle')}
              side="top"
              source="blog_footer"
            />
            <Button
              onClick={openInquiry}
              className="bg-accent text-accent-foreground hover:bg-accent/90 min-h-[44px]"
            >
              {t('blog.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted">
          <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{t('blog.relatedArticles')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
