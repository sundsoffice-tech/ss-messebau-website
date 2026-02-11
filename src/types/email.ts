/**
 * Email system type definitions
 */

export interface FileAttachment {
  filename: string;
  content: string;
  encoding: string;
  contentType?: string;
  size?: number;
}

export interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments: FileAttachment[];
  timestamp: number;
  attempts?: number;
  lastError?: string;
}

export interface SerializedFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface SMTPConfig {
  provider: 'sendgrid' | 'aws-ses' | 'smtp';
  apiKey?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  error?: string;
}
