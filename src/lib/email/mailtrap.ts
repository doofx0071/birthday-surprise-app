// Mailtrap email service for birthday notification system
import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import type { 
  EmailConfig, 
  EmailDeliveryResult, 
  MailtrapEmailData, 
  MailtrapResponse 
} from '@/types/email'

// Email configuration from environment variables
const emailConfig: EmailConfig = {
  host: process.env.MAILTRAP_HOST || 'bulk.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.MAILTRAP_USERNAME || '',
    pass: process.env.MAILTRAP_PASSWORD || '',
  },
  from: process.env.EMAIL_FROM || 'no-reply@doofio.site',
  apiToken: process.env.MAILTRAP_API_TOKEN,
}

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  })
}

// Mailtrap API client for advanced features
class MailtrapAPI {
  private apiToken: string
  private baseUrl = 'https://send.api.mailtrap.io/api/send'

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  async sendEmail(emailData: MailtrapEmailData): Promise<MailtrapResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        throw new Error(`Mailtrap API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return { success: true, message_ids: result.message_ids }
    } catch (error) {
      console.error('Mailtrap API error:', error)
      return { 
        success: false, 
        errors: [{ email: emailData.to[0]?.email || 'unknown', message: String(error) }] 
      }
    }
  }
}

// Main email service class
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private mailtrapAPI: MailtrapAPI | null = null

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    try {
      // Initialize SMTP transporter
      this.transporter = createTransporter()
      
      // Initialize Mailtrap API if token is available
      if (emailConfig.apiToken) {
        this.mailtrapAPI = new MailtrapAPI(emailConfig.apiToken)
      }
      
      console.log('Email service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize email service:', error)
    }
  }

  // Send email using React Email template
  async sendTemplateEmail(
    to: string | string[],
    subject: string,
    template: React.ReactElement,
    options: {
      recipientName?: string
      category?: string
      customVariables?: Record<string, string>
    } = {}
  ): Promise<EmailDeliveryResult> {
    const recipients = Array.isArray(to) ? to : [to]
    const primaryRecipient = recipients[0]

    try {
      // Render template to HTML and text
      const html = await render(template)
      const text = await render(template, { plainText: true })

      // Try Mailtrap API first (better tracking and analytics)
      if (this.mailtrapAPI) {
        const emailData: MailtrapEmailData = {
          from: {
            email: emailConfig.from,
            name: 'Cela\'s Birthday',
          },
          to: recipients.map(email => ({
            email,
            name: options.recipientName || email.split('@')[0],
          })),
          subject,
          html,
          text,
          category: options.category || 'birthday-notification',
          custom_variables: options.customVariables,
        }

        const result = await this.mailtrapAPI.sendEmail(emailData)
        
        if (result.success) {
          return {
            success: true,
            messageId: result.message_ids?.[0],
            deliveredAt: new Date(),
            recipientEmail: primaryRecipient,
          }
        }
      }

      // Fallback to SMTP if API fails or is not available
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: `Cela's Birthday <${emailConfig.from}>`,
          to: recipients.join(', '),
          subject,
          html,
          text,
          headers: {
            'X-Category': options.category || 'birthday-notification',
            'X-Custom-Variables': JSON.stringify(options.customVariables || {}),
          },
        })

        return {
          success: true,
          messageId: info.messageId,
          deliveredAt: new Date(),
          recipientEmail: primaryRecipient,
        }
      }

      throw new Error('No email service available')
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        error: String(error),
        recipientEmail: primaryRecipient,
      }
    }
  }

  // Send batch emails with optimized rate limiting
  async sendBatchEmails(
    emails: Array<{
      to: string
      subject: string
      template: React.ReactElement
      options?: any
    }>,
    batchSize: number = 25, // Increased default for better performance
    delayMs: number = 500   // Reduced delay for faster processing
  ): Promise<EmailDeliveryResult[]> {
    const results: EmailDeliveryResult[] = []
    const totalBatches = Math.ceil(emails.length / batchSize)

    console.log(`📧 Processing ${emails.length} emails in ${totalBatches} batches (${batchSize} per batch)`)

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`)

      const batchPromises = batch.map(email =>
        this.sendTemplateEmailWithRetry(email.to, email.subject, email.template, email.options)
      )

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error(`❌ Email failed for ${batch[index].to}:`, result.reason)
          results.push({
            success: false,
            error: result.reason,
            recipientEmail: batch[index].to,
          })
        }
      })

      const successCount = batchResults.filter(r => r.status === 'fulfilled').length
      console.log(`✅ Batch ${batchNumber} completed: ${successCount}/${batch.length} successful`)

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    const totalSuccess = results.filter(r => r.success).length
    console.log(`🎉 Bulk email completed: ${totalSuccess}/${emails.length} emails sent successfully`)
    
    return results
  }

  // Send email with retry logic for production reliability
  private async sendTemplateEmailWithRetry(
    to: string,
    subject: string,
    template: React.ReactElement,
    options?: any,
    maxRetries: number = 3
  ): Promise<EmailDeliveryResult> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.sendTemplateEmail(to, subject, template, options)

        if (result.success) {
          if (attempt > 1) {
            console.log(`✅ Email to ${to} succeeded on attempt ${attempt}`)
          }
          return result
        }

        lastError = result.error

        // If it's a permanent failure (like invalid email), don't retry
        if (result.error?.includes('invalid') || result.error?.includes('rejected')) {
          break
        }

      } catch (error) {
        lastError = error
        console.warn(`⚠️ Email attempt ${attempt}/${maxRetries} failed for ${to}:`, error)
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Max 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.error(`❌ Email to ${to} failed after ${maxRetries} attempts:`, lastError)
    return {
      success: false,
      error: lastError,
      recipientEmail: to,
    }
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.verify()
        return true
      }
      return false
    } catch (error) {
      console.error('Email connection test failed:', error)
      return false
    }
  }

  // Close connections
  async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close()
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Utility functions
export const validateEmailConfig = (): boolean => {
  const required = ['MAILTRAP_HOST', 'MAILTRAP_USERNAME', 'MAILTRAP_PASSWORD', 'EMAIL_FROM']
  return required.every(key => process.env[key])
}

export const getEmailConfig = (): EmailConfig => emailConfig
