/**
 * Automation, Template, and Email Tracking type definitions
 */

// ─── Automation Types ────────────────────────────────────────

export type AutomationTrigger =
  | 'order_created'
  | 'order_status_changed'
  | 'inquiry_received'
  | 'email_bounced'
  | 'time_based'

export type AutomationAction =
  | 'send_email'
  | 'send_webhook'
  | 'update_status'

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  action: AutomationAction
  actionConfig: Record<string, string>
  enabled: boolean
  delayMinutes: number
  createdAt: number
  updatedAt: number
}

// ─── Template Types ──────────────────────────────────────────

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  category: 'order' | 'inquiry' | 'reminder' | 'notification' | 'custom'
  version: number
  createdAt: number
  updatedAt: number
}

// ─── Compose Types ───────────────────────────────────────────

export type ComposeRecipientType = 'customer' | 'delivery' | 'info'

export interface ComposeEmail {
  to: string
  subject: string
  htmlBody: string
  textBody: string
  recipientType: ComposeRecipientType
  relatedOrderId?: string
  relatedInquiryId?: string
  templateId?: string
}

// ─── Email Tracking Types ────────────────────────────────────

export type EmailEventType = 'queued' | 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed'

export interface EmailTrackingEvent {
  id: string
  emailId: string
  event: EmailEventType
  timestamp: number
  details?: string
}

export interface EmailTrackingRecord {
  id: string
  to: string
  subject: string
  status: EmailEventType
  orderId?: string
  inquiryId?: string
  events: EmailTrackingEvent[]
  createdAt: number
}
