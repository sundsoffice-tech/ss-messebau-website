import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Lightning, Plus, Trash, PencilSimple, Timer } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { automationApi } from '@/lib/api-client'
import type { AutomationRule, AutomationTrigger, AutomationAction, AutomationCondition } from '@/types/automation'
import { useTranslation } from '@/lib/i18n'

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  order_created: 'Bestellung erstellt',
  order_status_changed: 'Bestellstatus geändert',
  inquiry_received: 'Anfrage eingegangen',
  email_bounced: 'E-Mail bounced',
  time_based: 'Zeitbasiert (Timer)',
}

const ACTION_LABELS: Record<AutomationAction, string> = {
  send_email: 'E-Mail senden',
  send_webhook: 'Webhook auslösen',
  update_status: 'Status aktualisieren',
}

const EMPTY_RULE: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  trigger: 'order_created',
  conditions: [],
  action: 'send_email',
  actionConfig: {},
  enabled: true,
  delayMinutes: 0,
}

export function AutomationPanel() {
  const { t } = useTranslation()
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Partial<AutomationRule> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const res = await automationApi.listRules()
      setRules(res.rules)
    } catch {
      // API may not be available yet — show empty state
      setRules([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await automationApi.toggleRule(id, enabled)
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)))
      toast.success(enabled ? t('admin.automation.enabled') : t('admin.automation.disabled'))
    } catch {
      toast.error(t('admin.automation.toggleError'))
    }
  }

  const handleSave = async () => {
    if (!editingRule?.name) {
      toast.error(t('admin.automation.nameRequired'))
      return
    }
    try {
      if (editingRule.id) {
        await automationApi.updateRule(editingRule.id, editingRule)
        toast.success(t('admin.automation.updated'))
      } else {
        await automationApi.createRule(editingRule as Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>)
        toast.success(t('admin.automation.created'))
      }
      setEditDialogOpen(false)
      setEditingRule(null)
      loadRules()
    } catch {
      toast.error(t('admin.automation.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await automationApi.deleteRule(deleteId)
      toast.success(t('admin.automation.deleted'))
      loadRules()
    } catch {
      toast.error(t('admin.automation.deleteError'))
    } finally {
      setDeleteId(null)
    }
  }

  const openCreate = () => {
    setEditingRule({ ...EMPTY_RULE })
    setEditDialogOpen(true)
  }

  const openEdit = (rule: AutomationRule) => {
    setEditingRule({ ...rule })
    setEditDialogOpen(true)
  }

  const addCondition = () => {
    if (!editingRule) return
    const conditions = [...(editingRule.conditions || []), { field: '', operator: 'equals' as const, value: '' }]
    setEditingRule({ ...editingRule, conditions })
  }

  const updateCondition = (index: number, field: keyof AutomationCondition, value: string) => {
    if (!editingRule) return
    const conditions = [...(editingRule.conditions || [])]
    conditions[index] = { ...conditions[index], [field]: value }
    setEditingRule({ ...editingRule, conditions })
  }

  const removeCondition = (index: number) => {
    if (!editingRule) return
    const conditions = (editingRule.conditions || []).filter((_, i) => i !== index)
    setEditingRule({ ...editingRule, conditions })
  }

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t('admin.automation.loading')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('admin.automation.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('admin.automation.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.automation.createRule')}
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightning className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">{t('admin.automation.noRules')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('admin.automation.noRulesHint')}</p>
        </Card>
      ) : (
        rules.map((rule) => (
          <Card key={rule.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{rule.name}</h3>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? t('admin.automation.active') : t('admin.automation.inactive')}
                  </Badge>
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span>
                    <Lightning className="w-3 h-3 inline mr-1" />
                    {TRIGGER_LABELS[rule.trigger]}
                  </span>
                  <span>→ {ACTION_LABELS[rule.action]}</span>
                  {rule.delayMinutes > 0 && (
                    <span>
                      <Timer className="w-3 h-3 inline mr-1" />
                      {rule.delayMinutes >= 60
                        ? `${Math.floor(rule.delayMinutes / 60)}h ${rule.delayMinutes % 60}min`
                        : `${rule.delayMinutes}min`}
                    </span>
                  )}
                  {rule.conditions.length > 0 && (
                    <span>{rule.conditions.length} {t('admin.automation.conditions')}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                />
                <Button variant="outline" size="sm" onClick={() => openEdit(rule)}>
                  <PencilSimple className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteId(rule.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditingRule(null) } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? t('admin.automation.editRule') : t('admin.automation.createRule')}
            </DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.automation.ruleName')}</Label>
                <Input
                  value={editingRule.name || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder={t('admin.automation.ruleNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.automation.description')}</Label>
                <Input
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder={t('admin.automation.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.automation.trigger')}</Label>
                  <Select
                    value={editingRule.trigger || 'order_created'}
                    onValueChange={(v) => setEditingRule({ ...editingRule, trigger: v as AutomationTrigger })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.automation.action')}</Label>
                  <Select
                    value={editingRule.action || 'send_email'}
                    onValueChange={(v) => setEditingRule({ ...editingRule, action: v as AutomationAction })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.automation.delay')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={editingRule.delayMinutes ?? 0}
                    onChange={(e) => setEditingRule({ ...editingRule, delayMinutes: parseInt(e.target.value) || 0 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('admin.automation.minutes')}</span>
                </div>
              </div>

              {/* Action Config */}
              {editingRule.action === 'send_email' && (
                <div className="space-y-2">
                  <Label>{t('admin.automation.templateId')}</Label>
                  <Input
                    value={editingRule.actionConfig?.templateId || ''}
                    onChange={(e) => setEditingRule({
                      ...editingRule,
                      actionConfig: { ...editingRule.actionConfig, templateId: e.target.value },
                    })}
                    placeholder={t('admin.automation.templateIdPlaceholder')}
                  />
                </div>
              )}

              {editingRule.action === 'send_webhook' && (
                <div className="space-y-2">
                  <Label>{t('admin.automation.webhookUrl')}</Label>
                  <Input
                    value={editingRule.actionConfig?.webhookUrl || ''}
                    onChange={(e) => setEditingRule({
                      ...editingRule,
                      actionConfig: { ...editingRule.actionConfig, webhookUrl: e.target.value },
                    })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {editingRule.action === 'update_status' && (
                <div className="space-y-2">
                  <Label>{t('admin.automation.newStatus')}</Label>
                  <Input
                    value={editingRule.actionConfig?.newStatus || ''}
                    onChange={(e) => setEditingRule({
                      ...editingRule,
                      actionConfig: { ...editingRule.actionConfig, newStatus: e.target.value },
                    })}
                    placeholder={t('admin.automation.newStatusPlaceholder')}
                  />
                </div>
              )}

              {/* Conditions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('admin.automation.conditions')}</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="w-3 h-3 mr-1" />
                    {t('admin.automation.addCondition')}
                  </Button>
                </div>

                {(editingRule.conditions || []).map((cond, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={cond.field}
                      onChange={(e) => updateCondition(i, 'field', e.target.value)}
                      placeholder={t('admin.automation.field')}
                      className="flex-1"
                    />
                    <Select
                      value={cond.operator}
                      onValueChange={(v) => updateCondition(i, 'operator', v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">=</SelectItem>
                        <SelectItem value="not_equals">≠</SelectItem>
                        <SelectItem value="contains">{t('admin.automation.contains')}</SelectItem>
                        <SelectItem value="greater_than">&gt;</SelectItem>
                        <SelectItem value="less_than">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={cond.value}
                      onChange={(e) => updateCondition(i, 'value', e.target.value)}
                      placeholder={t('admin.automation.value')}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeCondition(i)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingRule(null) }}>
              {t('admin.automation.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {editingRule?.id ? t('admin.automation.save') : t('admin.automation.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.automation.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.automation.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.automation.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('admin.automation.deleteConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
