import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  Trash,
  PencilSimple,
  FloppyDisk,
  X,
  Article,
  CalendarDot,
  Key,
  Star,
  MapPin,
  Globe,
} from '@phosphor-icons/react'
import {
  getBlogPosts,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getMesseEvents,
  addMesseEvent,
  updateMesseEvent,
  deleteMesseEvent,
  getApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey,
  generateSlug,
  BLOG_CATEGORIES,
  MESSE_CATEGORIES,
  type AdminBlogPost,
  type AdminMesseEvent,
  type AdminApiKey,
} from '@/lib/admin-content-service'

// ─── Blog Manager ────────────────────────────────────────────

export function BlogManager() {
  const { t, lang } = useTranslation()
  const [posts, setPosts] = useState<AdminBlogPost[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      const data = await getBlogPosts()
      setPosts(data)
    }
    loadPosts()
  }, [])

  const handleAdd = async (data: Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPost = await addBlogPost(data)
      setPosts(prev => [...prev, newPost])
      setShowAddForm(false)
      toast.success(t('adminContent.blog.addedSuccess'))
    } catch {
      toast.error('Fehler beim Erstellen des Blog-Posts')
    }
  }

  const handleUpdate = async (id: string, data: Partial<Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await updateBlogPost(id, data)
      const updatedPosts = await getBlogPosts()
      setPosts(updatedPosts)
      setEditingId(null)
      toast.success(t('adminContent.blog.updatedSuccess'))
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogPost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success(t('adminContent.blog.deletedSuccess'))
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Article className="w-5 h-5" />
          {t('adminContent.blog.title')}
        </CardTitle>
        <CardDescription>{t('adminContent.blog.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('adminContent.blog.newPost')}
          </Button>
        </div>

        {showAddForm && (
          <BlogPostForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <Article className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t('adminContent.blog.noPosts')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {posts
              .sort((a, b) => b.publishedAt - a.publishedAt)
              .map((post) => (
              <Card key={post.id} className="p-4">
                {editingId === post.id ? (
                  <BlogPostForm
                    initialData={post}
                    onSave={(data) => handleUpdate(post.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{post.title}</span>
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Slug: /{post.slug} · {t('adminContent.blog.published')}: {new Date(post.publishedAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(post.id)} className="text-xs gap-1">
                        <PencilSimple className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} className="text-xs text-destructive gap-1">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BlogPostForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: AdminBlogPost
  onSave: (data: Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState(initialData?.category || 'messebau')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [publishedAt, setPublishedAt] = useState(
    initialData ? new Date(initialData.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!initialData) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t('adminContent.blog.errorRequired'))
      return
    }
    onSave({
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      category,
      imageUrl: imageUrl.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      publishedAt: new Date(publishedAt).getTime(),
    })
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.titleLabel')}</label>
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder={t('adminContent.blog.titlePlaceholder')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.slugLabel')}</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mein-blogpost" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.categoryLabel')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {BLOG_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.imageLabel')}</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.dateLabel')}</label>
            <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.excerptLabel')}</label>
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t('adminContent.blog.excerptPlaceholder')} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.blog.contentLabel')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('adminContent.blog.contentPlaceholder')}
            rows={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
            <X className="w-3.5 h-3.5" />
            {t('adminContent.blog.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1">
            <FloppyDisk className="w-3.5 h-3.5" />
            {t('adminContent.blog.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Messe Manager ───────────────────────────────────────────

export function MesseManager() {
  const { t, lang } = useTranslation()
  const [events, setEvents] = useState<AdminMesseEvent[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      const data = await getMesseEvents()
      setEvents(data)
    }
    loadEvents()
  }, [])

  const handleAdd = async (data: Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent = await addMesseEvent(data)
      setEvents(prev => [...prev, newEvent])
      setShowAddForm(false)
      toast.success(t('adminContent.messe.addedSuccess'))
    } catch {
      toast.error('Fehler beim Erstellen des Events')
    }
  }

  const handleUpdate = async (id: string, data: Partial<Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await updateMesseEvent(id, data)
      const updatedEvents = await getMesseEvents()
      setEvents(updatedEvents)
      setEditingId(null)
      toast.success(t('adminContent.messe.updatedSuccess'))
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMesseEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      toast.success(t('adminContent.messe.deletedSuccess'))
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDot className="w-5 h-5" />
          {t('adminContent.messe.title')}
        </CardTitle>
        <CardDescription>{t('adminContent.messe.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('adminContent.messe.newEvent')}
          </Button>
        </div>

        {showAddForm && (
          <MesseEventForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarDot className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t('adminContent.messe.noEvents')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {events
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((event) => (
              <Card key={event.id} className="p-4">
                {editingId === event.id ? (
                  <MesseEventForm
                    initialData={event}
                    onSave={(data) => handleUpdate(event.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{event.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {MESSE_CATEGORIES.find(c => c.value === event.category)?.label || event.category}
                        </Badge>
                        {event.ssPresent && (
                          <Badge className="bg-accent text-accent-foreground text-xs gap-1">
                            <Star className="w-3 h-3" weight="fill" />
                            S&S vor Ort
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span>
                          {new Date(event.startDate).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE')} – {new Date(event.endDate).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE')}
                        </span>
                        {event.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <a href={event.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{t('adminContent.messe.website')}</a>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(event.id)} className="text-xs gap-1">
                        <PencilSimple className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)} className="text-xs text-destructive gap-1">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MesseEventForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: AdminMesseEvent
  onSave: (data: Omit<AdminMesseEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(initialData?.name || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [category, setCategory] = useState<AdminMesseEvent['category']>(initialData?.category || 'allgemein')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [ssPresent, setSsPresent] = useState(initialData?.ssPresent || false)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')

  const handleSubmit = () => {
    if (!name.trim() || !location.trim() || !startDate || !endDate) {
      toast.error(t('adminContent.messe.errorRequired'))
      return
    }
    onSave({
      name: name.trim(),
      location: location.trim(),
      startDate,
      endDate,
      category,
      website: website.trim(),
      description: description.trim(),
      ssPresent,
      imageUrl: imageUrl.trim(),
    })
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.nameLabel')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('adminContent.messe.namePlaceholder')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.locationLabel')}</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('adminContent.messe.locationPlaceholder')} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.startDateLabel')}</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.endDateLabel')}</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.categoryLabel')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AdminMesseEvent['category'])}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {MESSE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.websiteLabel')}</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.imageLabel')}</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.messe.descriptionLabel')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('adminContent.messe.descriptionPlaceholder')}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ssPresent"
            checked={ssPresent}
            onChange={(e) => setSsPresent(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="ssPresent" className="text-sm font-medium">
            {t('adminContent.messe.ssPresentLabel')}
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
            <X className="w-3.5 h-3.5" />
            {t('adminContent.messe.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1">
            <FloppyDisk className="w-3.5 h-3.5" />
            {t('adminContent.messe.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── API Keys Manager ────────────────────────────────────────

export function ExternalApiKeysManager() {
  const { t, lang } = useTranslation()
  const [keys, setKeys] = useState<AdminApiKey[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const loadKeys = async () => {
      const data = await getApiKeys()
      setKeys(data)
    }
    loadKeys()
  }, [])

  const handleAdd = async (serviceName: string, key: string, description: string) => {
    try {
      const newKey = await addApiKey(serviceName, key, description)
      setKeys(prev => [...prev, newKey])
      setShowAddForm(false)
      toast.success(t('adminContent.apiKeys.addedSuccess'))
    } catch {
      toast.error('Fehler beim Erstellen des API Keys')
    }
  }

  const handleUpdate = async (id: string, updates: { serviceName?: string; key?: string; description?: string }) => {
    try {
      await updateApiKey(id, updates)
      const updatedKeys = await getApiKeys()
      setKeys(updatedKeys)
      setEditingId(null)
      toast.success(t('adminContent.apiKeys.updatedSuccess'))
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id)
      setKeys(prev => prev.filter(k => k.id !== id))
      toast.success(t('adminContent.apiKeys.deletedSuccess'))
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          {t('adminContent.apiKeys.title')}
        </CardTitle>
        <CardDescription>{t('adminContent.apiKeys.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('adminContent.apiKeys.newKey')}
          </Button>
        </div>

        {showAddForm && (
          <ApiKeyForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {keys.length === 0 ? (
          <Card className="p-8 text-center">
            <Key className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t('adminContent.apiKeys.noKeys')}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {keys.map((entry) => (
              <Card key={entry.id} className="p-4">
                {editingId === entry.id ? (
                  <ApiKeyEditForm
                    initialData={entry}
                    onSave={(updates) => handleUpdate(entry.id, updates)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{entry.serviceName}</span>
                        <Badge variant="outline" className="text-xs font-mono">{entry.maskedKey}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('adminContent.apiKeys.created')}: {new Date(entry.createdAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE')} · 
                        {t('adminContent.apiKeys.updated')}: {new Date(entry.updatedAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(entry.id)} className="text-xs gap-1">
                        <PencilSimple className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)} className="text-xs text-destructive gap-1">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ApiKeyForm({
  onSave,
  onCancel,
}: {
  onSave: (serviceName: string, key: string, description: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [serviceName, setServiceName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!serviceName.trim() || !key.trim()) {
      toast.error(t('adminContent.apiKeys.errorRequired'))
      return
    }
    onSave(serviceName.trim(), key.trim(), description.trim())
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.serviceLabel')}</label>
            <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder={t('adminContent.apiKeys.servicePlaceholder')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.keyLabel')}</label>
            <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="API-Key / Token" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.descriptionLabel')}</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('adminContent.apiKeys.descriptionPlaceholder')} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
            <X className="w-3.5 h-3.5" />
            {t('adminContent.apiKeys.cancel')}
          </Button>
          <Button size="sm" onClick={handleSubmit} className="gap-1">
            <FloppyDisk className="w-3.5 h-3.5" />
            {t('adminContent.apiKeys.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ApiKeyEditForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: AdminApiKey
  onSave: (updates: { serviceName?: string; key?: string; description?: string }) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [serviceName, setServiceName] = useState(initialData.serviceName)
  const [key, setKey] = useState('')
  const [description, setDescription] = useState(initialData.description)

  const handleSubmit = () => {
    const updates: { serviceName?: string; key?: string; description?: string } = {}
    if (serviceName.trim() !== initialData.serviceName) updates.serviceName = serviceName.trim()
    if (key.trim()) updates.key = key.trim()
    if (description.trim() !== initialData.description) updates.description = description.trim()
    onSave(updates)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.serviceLabel')}</label>
          <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.keyLabelUpdate')}</label>
          <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={t('adminContent.apiKeys.keyUpdatePlaceholder')} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">{t('adminContent.apiKeys.descriptionLabel')}</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
          <X className="w-3.5 h-3.5" />
          {t('adminContent.apiKeys.cancel')}
        </Button>
        <Button size="sm" onClick={handleSubmit} className="gap-1">
          <FloppyDisk className="w-3.5 h-3.5" />
          {t('adminContent.apiKeys.save')}
        </Button>
      </div>
    </div>
  )
}
