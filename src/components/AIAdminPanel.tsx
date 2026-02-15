import { useState, useEffect } from 'react'
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
  const [keys, setKeys] = useState<AIKeyInfo[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState('openai')
  const [newKey, setNewKey] = useState('')

  useEffect(() => {
    setKeys(getAIKeys())
  }, [])

  const handleAdd = () => {
    if (!newKey.trim()) {
      toast.error('Bitte geben Sie einen API-Schlüssel ein.')
      return
    }
    const added = addAIKey(newProvider, newKey.trim())
    setKeys(prev => [...prev, added])
    setNewKey('')
    setNewProvider('openai')
    setShowAddForm(false)
    toast.success('API-Schlüssel hinzugefügt')
  }

  const handleRevoke = (id: string) => {
    revokeAIKey(id)
    setKeys(getAIKeys())
    toast.success('API-Schlüssel widerrufen')
  }

  const handleDelete = (id: string) => {
    deleteAIKey(id)
    setKeys(prev => prev.filter(k => k.id !== id))
    toast.success('API-Schlüssel gelöscht')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API-Schlüssel</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre KI-API-Schlüssel sicher. Schlüssel werden nie vollständig angezeigt.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Schlüssel
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Provider</label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="other">Sonstiger</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">API-Schlüssel</label>
                <Input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleAdd} className="gap-2">
                <FloppyDisk className="w-4 h-4" />
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Keine API-Schlüssel konfiguriert</p>
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
                        {key.status === 'active' ? 'Aktiv' : 'Widerrufen'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{key.maskedKey}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {key.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(key.id)} className="text-xs gap-1">
                      <EyeSlash className="w-3.5 h-3.5" />
                      Widerrufen
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(key.id)} className="text-xs text-destructive gap-1">
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
            <p className="font-medium">Sicherheitshinweis</p>
            <p className="mt-1">
              API-Schlüssel werden nie vollständig im Frontend angezeigt. Die Verwaltung erfolgt serverseitig. 
              Änderungen werden im Audit-Log protokolliert.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Training Data Management Tab ────────────────────────────

function TrainingDataManager() {
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
      toast.error('Titel und Inhalt sind erforderlich.')
      return
    }
    const entry = addTrainingData(newTitle.trim(), newContent.trim(), newCategory)
    setData(prev => [...prev, entry])
    setNewTitle('')
    setNewContent('')
    setNewCategory('faq')
    setShowAddForm(false)
    toast.success('Wissensdatei hinzugefügt')
  }

  const handleToggleActive = (id: string, active: boolean) => {
    updateTrainingData(id, { active: !active })
    setData(getTrainingData())
  }

  const handleDelete = (id: string) => {
    deleteTrainingData(id)
    setData(prev => prev.filter(d => d.id !== id))
    toast.success('Wissensdatei gelöscht')
  }

  const handleSaveEdit = (id: string, title: string, content: string, category: string) => {
    updateTrainingData(id, { title, content, category })
    setData(getTrainingData())
    setEditingId(null)
    toast.success('Wissensdatei aktualisiert')
  }

  const categoryLabel = (value: string) =>
    TRAINING_CATEGORIES.find(c => c.value === value)?.label || value

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trainingsdaten & Wissen</h3>
          <p className="text-sm text-muted-foreground">
            Pflegen Sie FAQ-Einträge und Wissensdateien für den KI-Chatbot.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Eintrag
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Titel</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="z.B. Öffnungszeiten" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kategorie</label>
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
              <label className="text-sm font-medium mb-1 block">Inhalt</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Geben Sie hier das Wissen ein, das der KI-Berater nutzen soll..."
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleAdd} className="gap-2">
                <FloppyDisk className="w-4 h-4" />
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Keine Trainingsdaten vorhanden</p>
          <p className="text-xs text-muted-foreground mt-1">
            Fügen Sie FAQ-Einträge und Wissen hinzu, um den KI-Berater zu verbessern.
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
                          {entry.active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Erstellt: {new Date(entry.createdAt).toLocaleDateString('de-DE')} · 
                        Aktualisiert: {new Date(entry.updatedAt).toLocaleDateString('de-DE')}
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
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [category, setCategory] = useState(entry.category)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel" />
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
          Abbrechen
        </Button>
        <Button size="sm" onClick={() => onSave(entry.id, title, content, category)} className="gap-1">
          <FloppyDisk className="w-3.5 h-3.5" />
          Speichern
        </Button>
      </div>
    </div>
  )
}

// ─── Audit Log Tab ───────────────────────────────────────────

function AuditLogViewer() {
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
        <h3 className="text-lg font-semibold">Audit-Log & Sicherheit</h3>
        <p className="text-sm text-muted-foreground">
          Protokoll aller sicherheitsrelevanten Aktionen und Chat-Aktivitäten.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{adminLogs.length}</p>
          <p className="text-xs text-muted-foreground">Admin-Aktionen</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{chatLogs.length}</p>
          <p className="text-xs text-muted-foreground">Chat-Anfragen</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{securityLogs.length}</p>
          <p className="text-xs text-muted-foreground">Sicherheitsereignisse</p>
        </Card>
      </div>

      {allLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <ClockClockwise className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Keine Audit-Einträge vorhanden</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {allLogs.map((log, idx) => (
            <div key={log.id || idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
              <Badge variant="outline" className={`text-xs shrink-0 ${getCategoryColor(log.source)}`}>
                {log.source === 'admin' ? 'Admin' : log.source === 'chat' ? 'Chat' : 'Sicherheit'}
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          KI-Chatbot Verwaltung
        </CardTitle>
        <CardDescription>
          API-Schlüssel, Trainingsdaten und Sicherheitseinstellungen für den KI-Berater verwalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keys" className="gap-2 text-xs sm:text-sm">
              <Key className="w-4 h-4" />
              API-Schlüssel
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2 text-xs sm:text-sm">
              <Brain className="w-4 h-4" />
              Trainingsdaten
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" />
              Audit-Log
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
