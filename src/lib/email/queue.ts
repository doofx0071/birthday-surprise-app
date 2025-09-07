// Production-ready email queue system for handling large volumes
import { emailService } from './mailtrap'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface EmailQueueItem {
  id: string
  to: string
  subject: string
  templateName: string
  templateData: any
  priority: 'high' | 'normal' | 'low'
  status: 'pending' | 'processing' | 'sent' | 'failed'
  attempts: number
  maxAttempts: number
  scheduledFor: Date
  createdAt: Date
  sentAt?: Date
  error?: string
}

class EmailQueue {
  private supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null

  // Add email to queue
  async addToQueue(
    to: string,
    subject: string,
    templateName: string,
    templateData: any,
    options: {
      priority?: 'high' | 'normal' | 'low'
      scheduledFor?: Date
      maxAttempts?: number
    } = {}
  ): Promise<string> {
    const queueItem: Omit<EmailQueueItem, 'id'> = {
      to,
      subject,
      templateName,
      templateData,
      priority: options.priority || 'normal',
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      scheduledFor: options.scheduledFor || new Date(),
      createdAt: new Date(),
    }

    // In production, store in database
    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await this.supabase
        .from('email_queue')
        .insert(queueItem)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to add email to queue:', error)
        throw error
      }

      return data.id
    }

    // In development, process immediately
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await this.processEmailItem({ ...queueItem, id })
    return id
  }

  // Add multiple emails to queue (bulk operation)
  async addBulkToQueue(
    emails: Array<{
      to: string
      subject: string
      templateName: string
      templateData: any
      priority?: 'high' | 'normal' | 'low'
    }>,
    options: {
      scheduledFor?: Date
      maxAttempts?: number
    } = {}
  ): Promise<string[]> {
    const queueItems = emails.map(email => ({
      ...email,
      priority: email.priority || 'normal',
      status: 'pending' as const,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      scheduledFor: options.scheduledFor || new Date(),
      createdAt: new Date(),
    }))

    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await this.supabase
        .from('email_queue')
        .insert(queueItems)
        .select('id')

      if (error) {
        console.error('Failed to add bulk emails to queue:', error)
        throw error
      }

      return data.map(item => item.id)
    }

    // In development, process immediately
    const ids = queueItems.map(() => 
      `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    )
    
    for (let i = 0; i < queueItems.length; i++) {
      await this.processEmailItem({ ...queueItems[i], id: ids[i] })
    }
    
    return ids
  }

  // Process queue (called by cron job)
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processing already in progress, skipping...')
      return
    }

    this.isProcessing = true
    console.log('🔄 Starting email queue processing...')

    try {
      // Get pending emails from queue (prioritized)
      const { data: queueItems, error } = await this.supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false }) // high, normal, low
        .order('created_at', { ascending: true })
        .limit(100) // Process max 100 emails per run

      if (error) {
        console.error('Failed to fetch queue items:', error)
        return
      }

      if (!queueItems || queueItems.length === 0) {
        console.log('📭 No emails in queue to process')
        return
      }

      console.log(`📧 Processing ${queueItems.length} emails from queue`)

      // Process emails in batches
      const batchSize = 25
      for (let i = 0; i < queueItems.length; i += batchSize) {
        const batch = queueItems.slice(i, i + batchSize)
        
        await Promise.allSettled(
          batch.map(item => this.processEmailItem(item))
        )

        // Small delay between batches
        if (i + batchSize < queueItems.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log('✅ Queue processing completed')

    } catch (error) {
      console.error('❌ Queue processing failed:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process individual email item
  private async processEmailItem(item: EmailQueueItem): Promise<void> {
    try {
      // Mark as processing
      if (process.env.NODE_ENV === 'production') {
        await this.supabase
          .from('email_queue')
          .update({ 
            status: 'processing',
            attempts: item.attempts + 1 
          })
          .eq('id', item.id)
      }

      // Import template dynamically
      const template = await this.getEmailTemplate(item.templateName, item.templateData)
      
      // Send email
      const result = await emailService.sendTemplateEmail(
        item.to,
        item.subject,
        template
      )

      if (result.success) {
        // Mark as sent
        if (process.env.NODE_ENV === 'production') {
          await this.supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', item.id)
        }
        
        console.log(`✅ Email sent successfully to ${item.to}`)
      } else {
        throw new Error(result.error || 'Email sending failed')
      }

    } catch (error) {
      console.error(`❌ Failed to process email for ${item.to}:`, error)
      
      // Update failure status
      if (process.env.NODE_ENV === 'production') {
        const newAttempts = item.attempts + 1
        const status = newAttempts >= item.maxAttempts ? 'failed' : 'pending'
        
        await this.supabase
          .from('email_queue')
          .update({ 
            status,
            attempts: newAttempts,
            error: String(error)
          })
          .eq('id', item.id)
      }
    }
  }

  // Get email template
  private async getEmailTemplate(templateName: string, data: any): Promise<React.ReactElement> {
    switch (templateName) {
      case 'birthday_notification':
        const { BirthdayNotificationEmail } = await import('@/components/emails/BirthdayNotification')
        return BirthdayNotificationEmail(data)
        
      case 'contributor_notification':
        const { ContributorNotificationEmail } = await import('@/components/emails/ContributorNotification')
        return ContributorNotificationEmail(data)
        
      case 'thank_you':
        const { ThankYouEmail } = await import('@/components/emails/ThankYouEmail')
        return ThankYouEmail(data)
        
      case 'pending_review':
        const { PendingReviewEmail } = await import('@/components/emails/message-pending-review')
        return PendingReviewEmail(data)
        
      default:
        throw new Error(`Unknown email template: ${templateName}`)
    }
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    pending: number
    processing: number
    sent: number
    failed: number
  }> {
    if (process.env.NODE_ENV !== 'production') {
      return { pending: 0, processing: 0, sent: 0, failed: 0 }
    }

    const { data, error } = await this.supabase
      .from('email_queue')
      .select('status')

    if (error) {
      console.error('Failed to get queue stats:', error)
      return { pending: 0, processing: 0, sent: 0, failed: 0 }
    }

    const stats = { pending: 0, processing: 0, sent: 0, failed: 0 }
    data.forEach(item => {
      stats[item.status as keyof typeof stats]++
    })

    return stats
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue()
