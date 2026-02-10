import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_BLOG_POSTS } from '@/lib/demo-data'
import { Article, ArrowRight, Clock } from '@phosphor-icons/react'

interface BlogPageProps {
  onOpenInquiry: () => void
}

export function BlogPage({ onOpenInquiry }: BlogPageProps) {
  const handleNavigation = (path: string) => {
    window.location.hash = path
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div>
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Article className="h-10 w-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Blog & Ratgeber</h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">
            Hilfreiche Tipps, Checklisten und Fachwissen rund um Messebau, Eventplanung und erfolgreiche Messeauftritte.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_BLOG_POSTS.map((post) => (
              <Card key={post.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col border-2 hover:border-primary cursor-pointer">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">{post.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation(`/blog/${post.slug}`)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Weiterlesen
                    <ArrowRight className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Haben Sie Fragen zu Ihrem Messeprojekt?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unsere Experten beraten Sie gerne persönlich zu allen Aspekten Ihres Messeauftritts.
          </p>
          <Button size="lg" onClick={onOpenInquiry} className="bg-accent hover:bg-accent/90">
            Kostenlose Beratung anfragen
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
