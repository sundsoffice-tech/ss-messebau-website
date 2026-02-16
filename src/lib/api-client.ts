/**
 * S&S Messebau - API Client
 * Centralized fetch wrapper for all PHP backend API endpoints.
 * Replaces localStorage calls for persistent data with server-side PHP APIs.
 */

const API_BASE = '/api'

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}/${endpoint}`
  const res = await fetch(url, {
    credentials: 'include', // send session cookies
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  })

  // For DELETE that may return empty body
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    throw new Error(data.error || `API Error ${res.status}`)
  }

  return data as T
}

// ─── Auth ────────────────────────────────────────────────────

export interface AuthUser {
  username: string
  displayName: string
}

export interface AuthResponse {
  authenticated: boolean
  user: AuthUser | null
}

export const authApi = {
  me: () => apiFetch<AuthResponse>('auth.php?action=me'),

  login: (username: string, password: string) =>
    apiFetch<{ success: boolean; user: AuthUser }>('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => apiFetch<{ success: boolean }>('auth.php?action=logout'),

  setup: (username: string, password: string, displayName?: string) =>
    apiFetch<{ success: boolean; user: AuthUser }>('auth.php?action=setup', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    }),

  checkSetup: () =>
    apiFetch<{ needsSetup: boolean }>('auth.php?action=check_setup'),
}

// ─── Orders ──────────────────────────────────────────────────

export interface OrderRecord {
  id: number
  config_id: string
  customer_email: string
  customer_name: string
  company: string
  phone: string
  status: string
  order_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export const ordersApi = {
  list: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return apiFetch<{ orders: OrderRecord[]; total: number }>(
      `orders.php${query ? '?' + query : ''}`
    )
  },

  get: (id: string | number) =>
    apiFetch<OrderRecord>(`orders.php?id=${id}`),

  create: (configId: string, orderData: Record<string, unknown>) =>
    apiFetch<{ success: boolean; id: number; config_id: string }>(
      'orders.php',
      {
        method: 'POST',
        body: JSON.stringify({ config_id: configId, order_data: orderData }),
      }
    ),

  updateStatus: (id: string | number, status: string) =>
    apiFetch<{ success: boolean }>('orders.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    }),

  delete: (id: string | number) =>
    apiFetch<{ success: boolean }>(`orders.php?id=${id}`, {
      method: 'DELETE',
    }),
}

// ─── Inquiries ───────────────────────────────────────────────

export interface InquiryRecord {
  id: number
  inquiry_id: string
  type: string
  name: string
  email: string
  company: string
  phone: string
  message: string
  form_data: Record<string, unknown> | null
  created_at: string
}

export const inquiriesApi = {
  list: (params?: { type?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return apiFetch<{ inquiries: InquiryRecord[]; total: number }>(
      `inquiries.php${query ? '?' + query : ''}`
    )
  },

  create: (data: {
    inquiry_id: string
    type?: string
    name?: string
    email?: string
    company?: string
    phone?: string
    message?: string
    form_data?: Record<string, unknown>
  }) =>
    apiFetch<{ success: boolean; id: number; inquiry_id: string }>(
      'inquiries.php',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  delete: (id: string | number) =>
    apiFetch<{ success: boolean }>(`inquiries.php?id=${id}`, {
      method: 'DELETE',
    }),
}

// ─── Email Queue ─────────────────────────────────────────────

export interface EmailQueueRecord {
  id: number
  queue_id: string
  to_email: string
  subject: string
  html_body: string
  text_body: string
  customer_email: string
  customer_subject: string
  customer_html_body: string
  customer_text_body: string
  attachments: unknown[]
  order_id: string
  sent: number
  sent_at: string | null
  error: string | null
  created_at: string
}

export const emailApi = {
  enqueue: (data: {
    queue_id: string
    to_email: string
    subject: string
    html_body: string
    text_body?: string
    customer_email?: string
    customer_subject?: string
    customer_html_body?: string
    customer_text_body?: string
    attachments?: unknown[]
    order_id?: string
  }) =>
    apiFetch<{ success: boolean; queue_id: string }>(
      'email.php?action=enqueue',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  autoSend: (data: {
    queue_id: string
    to_email: string
    subject: string
    html_body: string
    text_body?: string
    customer_email?: string
    customer_subject?: string
    customer_html_body?: string
    customer_text_body?: string
    attachments?: unknown[]
    order_id?: string
  }) =>
    apiFetch<{ success: boolean; queue_id: string; error?: string }>(
      'email.php?action=auto_send',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  send: (queueId: string) =>
    apiFetch<{ success: boolean; error?: string }>('email.php?action=send', {
      method: 'POST',
      body: JSON.stringify({ queue_id: queueId }),
    }),

  list: (sent?: number) => {
    const qs = sent !== undefined ? `&sent=${sent}` : ''
    return apiFetch<{ emails: EmailQueueRecord[]; total: number }>(
      `email.php?action=list${qs}`
    )
  },

  delete: (id: string | number) =>
    apiFetch<{ success: boolean }>(`email.php?action=delete&id=${id}`, {
      method: 'DELETE',
    }),

  status: () =>
    apiFetch<{
      provider: string
      configured: boolean
      ready: boolean
      testMode: boolean
    }>('email.php?action=status'),

  getConfig: () =>
    apiFetch<{
      provider: string
      fromEmail: string
      fromName: string
    }>('email.php?action=config'),

  saveConfig: (config: Record<string, unknown>) =>
    apiFetch<{ success: boolean; message?: string }>('email.php?action=config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
}

// ─── Blog ────────────────────────────────────────────────────

export interface BlogPostRecord {
  id: string
  slug: string
  title: string
  category: string
  imageUrl: string
  excerpt: string
  content: string
  publishedAt: number
  createdAt: number
  updatedAt: number
}

export const blogApi = {
  list: (category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiFetch<{ posts: BlogPostRecord[]; total: number }>(
      `blog.php${qs}`
    )
  },

  get: (idOrSlug: string) => {
    const isNumeric = /^\d+$/.test(idOrSlug)
    const param = isNumeric ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`
    return apiFetch<BlogPostRecord>(`blog.php?${param}`)
  },

  create: (data: {
    title: string
    slug?: string
    category?: string
    imageUrl?: string
    excerpt?: string
    content: string
    publishedAt?: number
  }) =>
    apiFetch<{ success: boolean; post: BlogPostRecord }>('blog.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ success: boolean }>('blog.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`blog.php?id=${id}`, {
      method: 'DELETE',
    }),
}

// ─── Messen ──────────────────────────────────────────────────

export interface MesseEventRecord {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  category: string
  website: string
  description: string
  ssPresent: boolean
  imageUrl: string
  createdAt: number
  updatedAt: number
}

export const messenApi = {
  list: (category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiFetch<{ events: MesseEventRecord[]; total: number }>(
      `messen.php${qs}`
    )
  },

  get: (id: string) =>
    apiFetch<MesseEventRecord>(`messen.php?id=${id}`),

  create: (data: {
    name: string
    location?: string
    startDate?: string
    endDate?: string
    category?: string
    website?: string
    description?: string
    ssPresent?: boolean
    imageUrl?: string
  }) =>
    apiFetch<{ success: boolean; event: MesseEventRecord }>('messen.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ success: boolean }>('messen.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`messen.php?id=${id}`, {
      method: 'DELETE',
    }),
}

// ─── External API Keys ──────────────────────────────────────

export interface ExternalApiKeyRecord {
  id: string
  serviceName: string
  maskedKey: string
  description: string
  createdAt: number
  updatedAt: number
}

export const apiKeysApi = {
  list: () =>
    apiFetch<{ keys: ExternalApiKeyRecord[] }>('apikeys.php'),

  create: (serviceName: string, key: string, description: string) =>
    apiFetch<{ success: boolean; key: ExternalApiKeyRecord }>('apikeys.php', {
      method: 'POST',
      body: JSON.stringify({ serviceName, key, description }),
    }),

  update: (id: string, data: { serviceName?: string; key?: string; description?: string }) =>
    apiFetch<{ success: boolean }>('apikeys.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`apikeys.php?id=${id}`, {
      method: 'DELETE',
    }),
}

// ─── Notifications ───────────────────────────────────────────

export interface NotificationConfigRecord {
  recipients: string[]
  webhooks: Array<{
    url: string
    enabled: boolean
    channel: string
    types: string[]
  }>
  sendCustomerConfirmation: boolean
}

export const notificationsApi = {
  getConfig: () =>
    apiFetch<NotificationConfigRecord>('notifications.php?action=config'),

  saveConfig: (config: NotificationConfigRecord) =>
    apiFetch<{ success: boolean }>('notifications.php?action=config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  testWebhook: (url: string) =>
    apiFetch<{ success: boolean; message?: string; error?: string }>('notifications.php?action=webhook_test', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  sendWebhook: (url: string, payload: Record<string, unknown>) =>
    apiFetch<{ success: boolean; error?: string }>('notifications.php?action=send_webhook', {
      method: 'POST',
      body: JSON.stringify({ url, payload }),
    }),
}

// ─── AI Training & Audit ─────────────────────────────────────

export interface TrainingDataRecord {
  id: string
  title: string
  content: string
  category: string
  active: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface AuditLogRecord {
  id: string
  timestamp: number
  action: string
  actor: string
  details: string
  category: string
}

export const aiApi = {
  getTrainingData: () =>
    apiFetch<{ data: TrainingDataRecord[]; total: number }>('ai.php?action=training'),

  addTrainingData: (data: { title: string; content: string; category?: string; createdBy?: string }) =>
    apiFetch<{ success: boolean; entry: TrainingDataRecord }>('ai.php?action=training', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTrainingData: (id: string, data: { title?: string; content?: string; category?: string; active?: boolean }) =>
    apiFetch<{ success: boolean }>('ai.php?action=training', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }),

  deleteTrainingData: (id: string) =>
    apiFetch<{ success: boolean }>(`ai.php?action=training&id=${id}`, {
      method: 'DELETE',
    }),

  getAuditLog: (limit?: number) => {
    const qs = limit ? `&limit=${limit}` : ''
    return apiFetch<{ logs: AuditLogRecord[]; total: number }>(
      `ai.php?action=audit${qs}`
    )
  },

  addAuditEntry: (data: { action: string; details: string; category?: string; actor?: string }) =>
    apiFetch<{ success: boolean }>('ai.php?action=audit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  clearAuditLog: () =>
    apiFetch<{ success: boolean }>('ai.php?action=audit', {
      method: 'DELETE',
    }),
}
