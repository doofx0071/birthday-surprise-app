// Email scheduling system for birthday notifications
import { emailService } from './mailtrap'
import type { 
  EmailBatch, 
  EmailType, 
  EmailSchedule, 
  EmailDeliveryResult 
} from '@/types/email'

// Birthday configuration from environment
const BIRTHDAY_CONFIG = {
  date: new Date(process.env.NEXT_PUBLIC_BIRTHDAY_DATE || '2025-09-08T00:00:00+08:00'),
  timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Manila',
  girlfriendName: process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Gracela Elmera C. Betarmos',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
}

// Email scheduling service
export class EmailScheduler {
  private batches: Map<string, EmailBatch> = new Map()

  // Utility methods for Philippine timezone handling
  private getPhilippineTime(): Date {
    const now = new Date()
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
    return phTime
  }

  private formatPhilippineTime(date: Date): string {
    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
    })
  }

  // Calculate email schedule based on birthday date
  calculateEmailSchedule(): EmailSchedule {
    const birthdayDate = new Date(BIRTHDAY_CONFIG.date)
    
    // Calculate reminder dates
    const weekBefore = new Date(birthdayDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dayBefore = new Date(birthdayDate.getTime() - 24 * 60 * 60 * 1000)
    const hourBefore = new Date(birthdayDate.getTime() - 60 * 60 * 1000)

    return {
      birthdayDate,
      timezone: BIRTHDAY_CONFIG.timezone,
      reminderSchedule: {
        week: weekBefore,
        day: dayBefore,
        hour: hourBefore,
      },
      deliveryTime: {
        hour: 0, // Midnight
        minute: 0,
      },
    }
  }

  // Check if it's time to send birthday emails (Philippine timezone)
  isBirthdayTime(): boolean {
    const phNow = this.getPhilippineTime()
    const birthday = new Date(BIRTHDAY_CONFIG.date)

    // Check if it's the birthday date in Philippine timezone
    const isSameDate =
      phNow.getFullYear() === birthday.getFullYear() &&
      phNow.getMonth() === birthday.getMonth() &&
      phNow.getDate() === birthday.getDate()

    // Check if it's around midnight Philippine time (within 1 hour window)
    const currentHour = phNow.getHours()
    const isAroundMidnight = currentHour === 0 || currentHour === 23

    console.log(`Birthday check - PH Time: ${this.formatPhilippineTime(phNow)}, Same date: ${isSameDate}, Around midnight: ${isAroundMidnight}`)

    return isSameDate && isAroundMidnight
  }

  // Check if it's time for reminder emails (Philippine timezone)
  isReminderTime(type: 'week' | 'day' | 'hour'): boolean {
    const phNow = this.getPhilippineTime()
    const schedule = this.calculateEmailSchedule()
    const targetDate = schedule.reminderSchedule[type]

    // Check if it's within 1 hour of the reminder time in Philippine timezone
    const timeDiff = Math.abs(phNow.getTime() - targetDate.getTime())
    const oneHour = 60 * 60 * 1000

    console.log(`Reminder check (${type}) - PH Time: ${this.formatPhilippineTime(phNow)}, Target: ${this.formatPhilippineTime(targetDate)}, Within window: ${timeDiff <= oneHour}`)

    return timeDiff <= oneHour
  }

  // Get recipients from database
  async getEmailRecipients(type: EmailType): Promise<string[]> {
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { getSupabaseAdmin } = await import('@/lib/supabase')
      const supabase = getSupabaseAdmin()

      switch (type) {
        case 'birthday_notification':
          // Send to the girlfriend (main recipient)
          return [BIRTHDAY_CONFIG.girlfriendName.toLowerCase().replace(/\s+/g, '.') + '@gmail.com']
        
        case 'contributor_notification':
        case 'reminder_week':
        case 'reminder_day':
        case 'reminder_hour':
          // Send to all message contributors who opted in
          const { data: messages } = await supabase
            .from('messages')
            .select('email, send_reminders')
            .eq('send_reminders', true)
            .eq('is_approved', true)
          
          return messages?.map(m => m.email).filter(Boolean) || []
        
        default:
          return []
      }
    } catch (error) {
      console.error('Failed to get email recipients:', error)
      return []
    }
  }

  // Get message statistics for email content
  async getMessageStats() {
    try {
      const { getSupabaseAdmin } = await import('@/lib/supabase')
      const supabase = getSupabaseAdmin()

      const { data: stats } = await supabase
        .rpc('get_message_stats')
        .single()

      return {
        messageCount: stats?.total_messages || 0,
        contributorCount: stats?.total_contributors || 0,
        locationCount: stats?.total_locations || 0,
      }
    } catch (error) {
      console.error('Failed to get message stats:', error)
      return {
        messageCount: 0,
        contributorCount: 0,
        locationCount: 0,
      }
    }
  }

  // Create email batch for processing
  async createEmailBatch(
    type: EmailType,
    recipients: string[],
    scheduledFor: Date = new Date()
  ): Promise<EmailBatch> {
    const batch: EmailBatch = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      recipients,
      scheduledFor,
      status: 'pending',
      results: [],
      createdAt: new Date(),
    }

    this.batches.set(batch.id, batch)
    return batch
  }

  // Process email batch
  async processBatch(batchId: string): Promise<EmailDeliveryResult[]> {
    const batch = this.batches.get(batchId)
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`)
    }

    batch.status = 'processing'
    
    try {
      const stats = await this.getMessageStats()
      const emails = []

      // Import email templates dynamically
      const { BirthdayNotificationEmail } = await import('@/components/emails/BirthdayNotification')
      const { ContributorNotificationEmail } = await import('@/components/emails/ContributorNotification')

      for (const recipient of batch.recipients) {
        let template: React.ReactElement
        let subject: string

        switch (batch.type) {
          case 'birthday_notification':
            template = BirthdayNotificationEmail({
              recipientName: BIRTHDAY_CONFIG.girlfriendName,
              recipientEmail: recipient,
              girlfriendName: BIRTHDAY_CONFIG.girlfriendName,
              messageCount: stats.messageCount,
              contributorCount: stats.contributorCount,
              locationCount: stats.locationCount,
              websiteUrl: BIRTHDAY_CONFIG.websiteUrl,
            })
            subject = `🎂 Happy Birthday ${BIRTHDAY_CONFIG.girlfriendName}! Your Surprise Awaits`
            break

          case 'contributor_notification':
            template = ContributorNotificationEmail({
              recipientName: recipient.split('@')[0],
              recipientEmail: recipient,
              girlfriendName: BIRTHDAY_CONFIG.girlfriendName,
              contributorName: recipient.split('@')[0],
              messageCount: stats.messageCount,
              contributorCount: stats.contributorCount,
              locationCount: stats.locationCount,
              websiteUrl: BIRTHDAY_CONFIG.websiteUrl,
            })
            subject = `🎉 ${BIRTHDAY_CONFIG.girlfriendName}'s Birthday is Today! See All the Love`
            break

          default:
            continue
        }

        emails.push({
          to: recipient,
          subject,
          template,
          options: {
            recipientName: recipient.split('@')[0],
            category: batch.type,
            customVariables: {
              batch_id: batchId,
              email_type: batch.type,
              girlfriend_name: BIRTHDAY_CONFIG.girlfriendName,
            },
          },
        })
      }

      // Send emails in batches
      const results = await emailService.sendBatchEmails(emails, 5, 2000)
      
      batch.results = results
      batch.status = results.every(r => r.success) ? 'completed' : 'failed'
      batch.completedAt = new Date()

      return results
    } catch (error) {
      console.error('Batch processing failed:', error)
      batch.status = 'failed'
      batch.completedAt = new Date()
      throw error
    }
  }

  // Main function to process birthday emails
  async processBirthdayEmails(): Promise<void> {
    console.log('Processing birthday emails...')
    
    try {
      if (this.isBirthdayTime()) {
        console.log('It\'s birthday time! Sending birthday notifications...')
        
        // Send birthday notification to girlfriend
        const birthdayRecipients = await this.getEmailRecipients('birthday_notification')
        if (birthdayRecipients.length > 0) {
          const birthdayBatch = await this.createEmailBatch('birthday_notification', birthdayRecipients)
          await this.processBatch(birthdayBatch.id)
          console.log(`Birthday notification sent to ${birthdayRecipients.length} recipients`)
        }

        // Send contributor notifications
        const contributorRecipients = await this.getEmailRecipients('contributor_notification')
        if (contributorRecipients.length > 0) {
          const contributorBatch = await this.createEmailBatch('contributor_notification', contributorRecipients)
          await this.processBatch(contributorBatch.id)
          console.log(`Contributor notifications sent to ${contributorRecipients.length} recipients`)
        }
      }

      // Check for reminder emails
      for (const reminderType of ['week', 'day', 'hour'] as const) {
        if (this.isReminderTime(reminderType)) {
          console.log(`Sending ${reminderType} reminder emails...`)
          const reminderRecipients = await this.getEmailRecipients(`reminder_${reminderType}`)
          
          if (reminderRecipients.length > 0) {
            const reminderBatch = await this.createEmailBatch(`reminder_${reminderType}`, reminderRecipients)
            await this.processBatch(reminderBatch.id)
            console.log(`${reminderType} reminders sent to ${reminderRecipients.length} recipients`)
          }
        }
      }
    } catch (error) {
      console.error('Birthday email processing failed:', error)
      throw error
    }
  }

  // Get batch status
  getBatch(batchId: string): EmailBatch | undefined {
    return this.batches.get(batchId)
  }

  // Get all batches
  getAllBatches(): EmailBatch[] {
    return Array.from(this.batches.values())
  }
}

// Export singleton instance
export const emailScheduler = new EmailScheduler()

// Utility functions for Philippine timezone handling
export const formatBirthdayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: BIRTHDAY_CONFIG.timezone,
  })
}

export const formatPhilippineTime = (date: Date): string => {
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  })
}

export const getPhilippineTime = (): Date => {
  // Get current time in Philippine timezone
  const now = new Date()
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
  return phTime
}

export const getDaysUntilBirthday = (): number => {
  const now = getPhilippineTime()
  const birthday = new Date(BIRTHDAY_CONFIG.date)
  const diffTime = birthday.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
