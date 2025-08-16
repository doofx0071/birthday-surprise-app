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
            name: 'Birthday Surprise Team',
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
          from: `Birthday Surprise Team <${emailConfig.from}>`,
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

  // Send batch emails with rate limiting
  async sendBatchEmails(
    emails: Array<{
      to: string
      subject: string
      template: React.ReactElement
      options?: any
    }>,
    batchSize: number = 10,
    delayMs: number = 1000
  ): Promise<EmailDeliveryResult[]> {
    const results: EmailDeliveryResult[] = []
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      
      const batchPromises = batch.map(email =>
        this.sendTemplateEmail(email.to, email.subject, email.template, email.options)
      )
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            success: false,
            error: result.reason,
            recipientEmail: batch[index].to,
          })
        }
      })
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
    
    return results
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
