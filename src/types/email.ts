// Email system types for birthday notification system

export interface EmailTemplateProps {
  recipientName: string
  recipientEmail: string
  girlfriendName: string
  messageCount: number
  contributorCount: number
  locationCount: number
  websiteUrl: string
  unsubscribeUrl?: string
  previewText?: string
}

export interface BirthdayNotificationProps extends EmailTemplateProps {
  // Main birthday notification for the girlfriend
  personalizedMessage?: string
  featuredMessages?: Array<{
    name: string
    message: string
    location: string
  }>
}

export interface ContributorNotificationProps extends EmailTemplateProps {
  // Notification for people who contributed messages
  contributorName: string
  contributorMessage?: string
  contributorLocation?: string
}

export interface ReminderEmailProps extends EmailTemplateProps {
  // Reminder emails (1 week, 1 day before)
  daysUntilBirthday: number
  reminderType: 'week' | 'day' | 'hour'
}

export interface ThankYouEmailProps {
  // Thank you confirmation after message submission
  contributorName: string
  contributorEmail: string
  girlfriendName: string
  messagePreview: string
  websiteUrl: string
}

export interface EmailDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  deliveredAt?: Date
  recipientEmail: string
}

export interface EmailBatch {
  id: string
  type: EmailType
  recipients: string[]
  scheduledFor: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results: EmailDeliveryResult[]
  createdAt: Date
  completedAt?: Date
}

export type EmailType = 
  | 'birthday_notification'
  | 'contributor_notification' 
  | 'reminder_week'
  | 'reminder_day'
  | 'reminder_hour'
  | 'thank_you'
  | 'admin_alert'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  apiToken?: string
}

export interface EmailTrackingData {
  emailId: string
  recipientEmail: string
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bounced: boolean
  unsubscribed: boolean
  errorMessage?: string
}

export interface EmailSchedule {
  birthdayDate: Date
  timezone: string
  reminderSchedule: {
    week: Date
    day: Date
    hour: Date
  }
  deliveryTime: {
    hour: number
    minute: number
  }
}

export interface EmailAnalytics {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalUnsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
}

// Mailtrap API specific types
export interface MailtrapResponse {
  success: boolean
  message_ids?: string[]
  errors?: Array<{
    email: string
    message: string
  }>
}

export interface MailtrapEmailData {
  from: {
    email: string
    name?: string
  }
  to: Array<{
    email: string
    name?: string
  }>
  subject: string
  html: string
  text?: string
  category?: string
  custom_variables?: Record<string, string>
  headers?: Record<string, string>
}
