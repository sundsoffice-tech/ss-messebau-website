import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Key,
  Brain,
  ClockClockwise,
  Plus,
  Trash,
  Eye,
  EyeSlash,
  ShieldCheck,
  Warning,
  CheckCircle,
  PencilSimple,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'
import {
  getAIKeys,
  addAIKey,
  revokeAIKey,
  deleteAIKey,
  getTrainingData,
  addTrainingData,
  updateTrainingData,
  deleteTrainingData,
  getAuditLog,
  TRAINING_CATEGORIES,
  type AIKeyInfo,
  type TrainingDataEntry,
  type AIAuditLogEntry,
} from '@/lib/ai-admin-service'
import { getChatAuditLog } from '@/lib/chat-service'
import { getSuspiciousActivityLog } from '@/lib/chat-sanitizer'

// ─── API Key Management Tab ──────────────────────────────────

function AIKeyManager() {
  const { t } = useTranslation()
  const [keys, setKeys] = useState<AIKeyInfo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState('openai')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadKeys = async () => {
      setLoading(true)
      const loadedKeys = await getAIKeys()
      setKeys(loadedKeys)
      setLoading(false)
    }
    loadKeys()
  }, [])

  const handleAdd = async () => {
    if (!newKey.trim()) {
      toast.error(t('aiAdmin.keys.errorEmpty'))
      return
    }
    setLoading(true)
    try {
      const added = await addAIKey(newProvider, newKey.trim())
      setKeys(prev => [...prev, added])
      setNewKey('')
      setNewProvider('openai')
      setShowAddForm(false)
      toast.success(t('aiAdmin.keys.addedSuccess'))
    } catch (error) {
      toast.error('Failed to add key: ' + (error instanceof Error ? error.message : 'unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (id: string) => {
    setLoading(true)
    try {
      await revokeAIKey(id)
      const updatedKeys = await getAIKeys()
      setKeys(updatedKeys)
      toast.success(t('aiAdmin.keys.revokedSuccess'))
    } catch (error) {
      toast.error('Failed to revoke key: ' + (error instanceof Error ? error.message : 'unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await deleteAIKey(id)
      setKeys(prev => prev.filter(k => k.id !== id))
      toast.success(t('aiAdmin.keys.deletedSuccess'))
    } catch (error) {
      toast.error('Failed to delete key: ' + (error instanceof Error ? error.message : 'unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('aiAdmin.keys.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('aiAdmin.keys.description')}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2" disabled={loading}>
          <Plus className="w-4 h-4" />
          {t('aiAdmin.keys.newKey')}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('aiAdmin.keys.providerLabel')}</label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  disabled={loading}
                >
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="other">{t('aiAdmin.keys.providerOther')}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">{t('aiAdmin.keys.apiKeyLabel')}</label>
                <Input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-..."
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)} disabled={loading}>
                {t('aiAdmin.keys.cancel')}
              </Button>
              <Button size="sm" onClick={handleAdd} className="gap-2" disabled={loading}>
                <FloppyDisk className="w-4 h-4" />
                {t('aiAdmin.keys.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{loading ? 'Loading...' : t('aiAdmin.keys.noKeys')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${key.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {key.status === 'active' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                    ) : (
                      <Warning className="w-5 h-5 text-red-600" weight="fill" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{key.provider}</span>
                      <Badge variant={key.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {key.status === 'active' ? t('aiAdmin.keys.statusActive') : t('aiAdmin.keys.statusRevoked')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{key.maskedKey}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {key.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(key.id)} className="text-xs gap-1" disabled={loading}>
                      <EyeSlash className="w-3.5 h-3.5" />
                      {t('aiAdmin.keys.revoke')}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(key.id)} className="text-xs text-destructive gap-1" disabled={loading}>
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">{t('aiAdmin.keys.securityTitle')}</p>
            <p className="mt-1">
              {t('aiAdmin.keys.securityText')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Training Data Management Tab ────────────────────────────

function TrainingDataManager() {
  const { t } = useTranslation()
  const [data, setData] = useState<TrainingDataEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('faq')

  useEffect(() => {
    setData(getTrainingData())
  }, [])

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error(t('aiAdmin.training.errorRequired'))
      return
    }
    const entry = addTrainingData(newTitle.trim(), newContent.trim(), newCategory)
    setData(prev => [...prev, entry])
    setNewTitle('')
    setNewContent('')
    setNewCategory('faq')
    setShowAddForm(false)
    toast.success(t('aiAdmin.training.addedSuccess'))
  }

  const handleToggleActive = (id: string, active: boolean) => {
    updateTrainingData(id, { active: !active })
    setData(getTrainingData())
  }

  const handleDelete = (id: string) => {
    deleteTrainingData(id)
    setData(prev => prev.filter(d => d.id !== id))
    toast.success(t('aiAdmin.training.deletedSuccess'))
  }

  const handleSaveEdit = (id: string, title: string, content: string, category: string) => {
    updateTrainingData(id, { title, content, category })
    setData(getTrainingData())
    setEditingId(null)
    toast.success(t('aiAdmin.training.updatedSuccess'))
  }

  const categoryLabel = (value: string) =>
    TRAINING_CATEGORIES.find(c => c.value === value)?.label || value

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('aiAdmin.training.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('aiAdmin.training.description')}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('aiAdmin.training.newEntry')}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('aiAdmin.training.titleLabel')}</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t('aiAdmin.training.titlePlaceholder')} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('aiAdmin.training.categoryLabel')}</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TRAINING_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('aiAdmin.training.contentLabel')}</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t('aiAdmin.training.contentPlaceholder')}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                {t('aiAdmin.training.cancel')}
              </Button>
              <Button size="sm" onClick={handleAdd} className="gap-2">
                <FloppyDisk className="w-4 h-4" />
                {t('aiAdmin.training.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t('aiAdmin.training.noData')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('aiAdmin.training.noDataHint')}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.map((entry) => (
            <Card key={entry.id} className="p-4">
              {editingId === entry.id ? (
                <TrainingDataEditForm
                  entry={entry}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{entry.title}</span>
                        <Badge variant="outline" className="text-xs">{categoryLabel(entry.category)}</Badge>
                        <Badge variant={entry.active ? 'default' : 'secondary'} className="text-xs">
                          {entry.active ? t('aiAdmin.training.statusActive') : t('aiAdmin.training.statusInactive')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('aiAdmin.training.created')}: {new Date(entry.createdAt).toLocaleDateString('de-DE')} · 
                        {t('aiAdmin.training.updated')}: {new Date(entry.updatedAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(entry.id, entry.active)} className="text-xs gap-1">
                        {entry.active ? <EyeSlash className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(entry.id)} className="text-xs gap-1">
                        <PencilSimple className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)} className="text-xs text-destructive gap-1">
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TrainingDataEditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: TrainingDataEntry
  onSave: (id: string, title: string, content: string, category: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [category, setCategory] = useState(entry.category)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('aiAdmin.training.editTitlePlaceholder')} />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {TRAINING_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
          <X className="w-3.5 h-3.5" />
          {t('aiAdmin.training.cancel')}
        </Button>
        <Button size="sm" onClick={() => onSave(entry.id, title, content, category)} className="gap-1">
          <FloppyDisk className="w-3.5 h-3.5" />
          {t('aiAdmin.training.save')}
        </Button>
      </div>
    </div>
  )
}

// ─── Audit Log Tab ───────────────────────────────────────────

function AuditLogViewer() {
  const { t } = useTranslation()
  const [adminLogs, setAdminLogs] = useState<AIAuditLogEntry[]>([])
  const [chatLogs, setChatLogs] = useState<Array<{ timestamp: number; action: string; details: string }>>([])
  const [securityLogs, setSecurityLogs] = useState<Array<{ timestamp: number; reason: string; inputPreview: string }>>([])

  useEffect(() => {
    setAdminLogs(getAuditLog().reverse())
    setChatLogs(getChatAuditLog().reverse())
    setSecurityLogs(getSuspiciousActivityLog().reverse())
  }, [])

  const allLogs = [
    ...adminLogs.map(l => ({ ...l, source: 'admin' as const })),
    ...chatLogs.map(l => ({ id: `chat-${l.timestamp}`, ...l, source: 'chat' as const, actor: 'user', category: 'security' as const })),
    ...securityLogs.map(l => ({ id: `sec-${l.timestamp}`, timestamp: l.timestamp, action: 'suspicious_input', details: `${l.reason}: ${l.inputPreview}`, source: 'security' as const, actor: 'user', category: 'security' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100)

  const getCategoryColor = (source: string) => {
    switch (source) {
      case 'admin': return 'bg-blue-100 text-blue-700'
      case 'chat': return 'bg-green-100 text-green-700'
      case 'security': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('aiAdmin.audit.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('aiAdmin.audit.description')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{adminLogs.length}</p>
          <p className="text-xs text-muted-foreground">{t('aiAdmin.audit.adminActions')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{chatLogs.length}</p>
          <p className="text-xs text-muted-foreground">{t('aiAdmin.audit.chatRequests')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{securityLogs.length}</p>
          <p className="text-xs text-muted-foreground">{t('aiAdmin.audit.securityEvents')}</p>
        </Card>
      </div>

      {allLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <ClockClockwise className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t('aiAdmin.audit.noEntries')}</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {allLogs.map((log, idx) => (
            <div key={log.id || idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
              <Badge variant="outline" className={`text-xs shrink-0 ${getCategoryColor(log.source)}`}>
                {log.source === 'admin' ? t('aiAdmin.audit.sourceAdmin') : log.source === 'chat' ? t('aiAdmin.audit.sourceChat') : t('aiAdmin.audit.sourceSecurity')}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground truncate">{log.details}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(log.timestamp).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────

export function AIAdminPanel() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('aiAdmin.title')}
        </CardTitle>
        <CardDescription>
          {t('aiAdmin.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keys" className="gap-2 text-xs sm:text-sm">
              <Key className="w-4 h-4" />
              {t('aiAdmin.tabKeys')}
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2 text-xs sm:text-sm">
              <Brain className="w-4 h-4" />
              {t('aiAdmin.tabTraining')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" />
              {t('aiAdmin.tabAudit')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <AIKeyManager />
          </TabsContent>

          <TabsContent value="training">
            <TrainingDataManager />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
