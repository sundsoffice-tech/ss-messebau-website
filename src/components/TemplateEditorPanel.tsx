import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Article, Plus, Trash, PencilSimple, Eye, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { templatesApi } from '@/lib/api-client'
import type { EmailTemplate } from '@/types/automation'
import { useTranslation } from '@/lib/i18n'

const CATEGORY_LABELS: Record<string, string> = {
  order: 'Bestellung',
  inquiry: 'Anfrage',
  reminder: 'Erinnerung',
  notification: 'Benachrichtigung',
  custom: 'Benutzerdefiniert',
}

const AVAILABLE_VARIABLES = [
  '{{name}}',
  '{{email}}',
  '{{company}}',
  '{{bestellnummer}}',
  '{{status}}',
  '{{datum}}',
  '{{betrag}}',
  '{{ansprechpartner}}',
  '{{telefon}}',
]

const EMPTY_TEMPLATE: Omit<EmailTemplate, 'id' | 'version' | 'createdAt' | 'updatedAt'> = {
  name: '',
  subject: '',
  htmlContent: '',
  textContent: '',
  variables: [],
  category: 'custom',
}

export function TemplateEditorPanel() {
  const { t } = useTranslation()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await templatesApi.list()
      setTemplates(res.templates)
    } catch {
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = useMemo(() => {
    let result = templates
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (tpl) =>
          tpl.name.toLowerCase().includes(q) ||
          tpl.subject.toLowerCase().includes(q)
      )
    }
    if (categoryFilter !== 'all') {
      result = result.filter((tpl) => tpl.category === categoryFilter)
    }
    return result
  }, [templates, searchQuery, categoryFilter])

  const handleSave = async () => {
    if (!editingTemplate?.name || !editingTemplate?.subject) {
      toast.error(t('admin.templates.nameSubjectRequired'))
      return
    }
    try {
      // Extract variables from content using Set for O(n) complexity
      const variableRegex = /\{\{(\w+)\}\}/g
      const foundVarsSet = new Set<string>()
      const content = (editingTemplate.htmlContent || '') + (editingTemplate.subject || '')
      let match
      while ((match = variableRegex.exec(content)) !== null) {
        foundVarsSet.add(`{{${match[1]}}}`)
      }

      const templateData = {
        ...editingTemplate,
        variables: Array.from(foundVarsSet),
      }

      if (editingTemplate.id) {
        await templatesApi.update(editingTemplate.id, templateData)
        toast.success(t('admin.templates.updated'))
      } else {
        await templatesApi.create(templateData as Omit<EmailTemplate, 'id' | 'version' | 'createdAt' | 'updatedAt'>)
        toast.success(t('admin.templates.created'))
      }
      setEditDialogOpen(false)
      setEditingTemplate(null)
      loadTemplates()
    } catch {
      toast.error(t('admin.templates.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await templatesApi.delete(deleteId)
      toast.success(t('admin.templates.deleted'))
      loadTemplates()
    } catch {
      toast.error(t('admin.templates.deleteError'))
    } finally {
      setDeleteId(null)
    }
  }

  const handlePreview = (template: Partial<EmailTemplate>) => {
    const sampleVars: Record<string, string> = {
      name: 'Max Mustermann',
      email: 'max@example.com',
      company: 'Musterfirma GmbH',
      bestellnummer: 'BNR-20260001',
      status: 'In Bearbeitung',
      datum: new Date().toLocaleDateString('de-DE'),
      betrag: '1.250,00 €',
      ansprechpartner: 'Max Mustermann',
      telefon: '+49 123 456789',
    }

    let html = template.htmlContent || '<p>Kein Inhalt</p>'
    html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleVars[key] || `{{${key}}}`)
    setPreviewHtml(html)
    setPreviewDialogOpen(true)
  }

  const insertVariable = (variable: string) => {
    if (!editingTemplate) return
    setEditingTemplate({
      ...editingTemplate,
      htmlContent: (editingTemplate.htmlContent || '') + variable,
    })
  }

  const openCreate = () => {
    setEditingTemplate({ ...EMPTY_TEMPLATE })
    setEditDialogOpen(true)
  }

  const openEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template })
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('admin.templates.loading')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('admin.templates.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('admin.templates.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.templates.create')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.templates.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.templates.filterCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.templates.allCategories')}</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <Article className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">{t('admin.templates.noTemplates')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('admin.templates.noTemplatesHint')}</p>
        </Card>
      ) : (
        filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="outline">{CATEGORY_LABELS[template.category] || template.category}</Badge>
                  <Badge variant="secondary">v{template.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t('admin.templates.subject')}: {template.subject}</p>
                {template.variables.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                  <Eye className="w-4 h-4 mr-1" />
                  {t('admin.templates.preview')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                  <PencilSimple className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteId(template.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditingTemplate(null) } }}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? t('admin.templates.edit') : t('admin.templates.create')}
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.templates.templateName')}</Label>
                  <Input
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder={t('admin.templates.templateNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.templates.category')}</Label>
                  <Select
                    value={editingTemplate.category || 'custom'}
                    onValueChange={(v) => setEditingTemplate({ ...editingTemplate, category: v as EmailTemplate['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.templates.subject')}</Label>
                <Input
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  placeholder={t('admin.templates.subjectPlaceholder')}
                />
              </div>

              {/* Variable Helpers */}
              <div className="space-y-2">
                <Label>{t('admin.templates.availableVariables')}</Label>
                <div className="flex gap-1 flex-wrap">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => insertVariable(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.templates.htmlContent')}</Label>
                <Textarea
                  value={editingTemplate.htmlContent || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                  placeholder={t('admin.templates.htmlContentPlaceholder')}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.templates.textContent')}</Label>
                <Textarea
                  value={editingTemplate.textContent || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, textContent: e.target.value })}
                  placeholder={t('admin.templates.textContentPlaceholder')}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <Button variant="outline" onClick={() => handlePreview(editingTemplate)} className="gap-2">
                <Eye className="w-4 h-4" />
                {t('admin.templates.previewButton')}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingTemplate(null) }}>
              {t('admin.templates.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate?.id ? t('admin.templates.saveChanges') : t('admin.templates.createTemplate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.templates.previewTitle')}</DialogTitle>
          </DialogHeader>
          <iframe
            sandbox=""
            srcDoc={previewHtml}
            className="border rounded-lg bg-white w-full min-h-[400px]"
            title={t('admin.templates.previewTitle')}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.templates.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.templates.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.templates.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('admin.templates.deleteConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
