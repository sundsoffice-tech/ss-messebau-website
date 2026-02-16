/**
 * Email service – all email operations are handled server-side.
 * The frontend only manages config UI; actual sending goes through email.php.
 */

import { emailApi } from './api-client'

interface SMTPConfig {
  provider: 'sendgrid' | 'ses' | 'test'
  fromEmail: string
  fromName: string
}

const DEFAULT_CONFIG: SMTPConfig = {
  provider: 'test',
  fromEmail: 'noreply@sunds-messebau.de',
  fromName: 'S&S Messebau GbR',
}

export async function getEmailConfig(): Promise<SMTPConfig> {
  try {
    const config = await emailApi.getConfig()
    return {
      provider: (config.provider as SMTPConfig['provider']) || 'test',
      fromEmail: config.fromEmail || DEFAULT_CONFIG.fromEmail,
      fromName: config.fromName || DEFAULT_CONFIG.fromName,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveEmailConfig(config: Partial<SMTPConfig>): Promise<void> {
  await emailApi.saveConfig(config)
}

export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const status = await emailApi.status()

    if (status.testMode) {
      return {
        success: true,
        message: 'Test-Modus aktiv. E-Mails werden simuliert (keine echten E-Mails versendet).',
      }
    }

    return {
      success: true,
      message: `Verbindung zu ${status.provider.toUpperCase()} erfolgreich. E-Mail-Versand ist bereit.`,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Verbindungstest fehlgeschlagen.',
    }
  }
}

export async function getEmailStatus(): Promise<{
  provider: string
  configured: boolean
  ready: boolean
  testMode: boolean
}> {
  try {
    return await emailApi.status()
  } catch {
    return {
      provider: 'test',
      configured: false,
      ready: false,
      testMode: true,
    }
  }
}
