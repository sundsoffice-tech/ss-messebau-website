import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock } from '@phosphor-icons/react'
import { useTranslation } from '@/lib/i18n'
import type { BlogPost } from '@/lib/types'
import { getBlogFallbackImage } from '@/lib/blog-image-defaults'

interface BlogPostCardProps {
  post: BlogPost
  onNavigate: (path: string) => void
}

export function BlogPostCard({ post, onNavigate }: BlogPostCardProps) {
  const { t, lang } = useTranslation()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col border-2 hover:border-primary cursor-pointer">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={post.imageUrl || getBlogFallbackImage(post.category)}
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
          onClick={() => onNavigate(`/blog/${post.slug}`)}
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors min-h-[44px] text-sm md:text-base"
        >
          {t('blog.readMore')}
          <ArrowRight className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
