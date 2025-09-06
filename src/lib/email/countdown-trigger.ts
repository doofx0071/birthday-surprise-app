// Countdown trigger system for automatic birthday email sending
import { emailScheduler } from './scheduler'
import { getBirthdayConfig, getTimeUntilBirthday, getBirthdayConfigFromDatabase, getTimeUntilBirthdayFromDatabase } from '../config/birthday'
import { createClient } from '@supabase/supabase-js'

// Create admin Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface CountdownTriggerState {
  isMonitoring: boolean
  lastCheck: Date | null
  emailsSent: boolean
  celebrantEmailSent: boolean
  contributorEmailsSent: boolean
}

class CountdownTrigger {
  private state: CountdownTriggerState = {
    isMonitoring: false,
    lastCheck: null,
    emailsSent: false,
    celebrantEmailSent: false,
    contributorEmailsSent: false,
  }
  
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL_MS = 30000 // Check every 30 seconds

  // Start monitoring the countdown
  async startMonitoring(): Promise<void> {
    // Check if already monitoring
    if (this.state.isMonitoring) {
      console.log('Countdown trigger already monitoring')
      return
    }

    // Always stop any existing monitoring first to prevent multiple instances
    this.stopMonitoring()

    // Check if emails have already been sent before starting monitoring
    const emailsSentPersistent = await this.checkEmailsSentFromDatabase()
    if (emailsSentPersistent) {
      console.log('📧 Birthday emails already sent (found in database), not starting monitoring')
      this.state.emailsSent = true
      this.state.celebrantEmailSent = true
      this.state.contributorEmailsSent = true
      return
    }

    console.log('Starting countdown trigger monitoring...')
    this.state.isMonitoring = true

    // Initial check
    this.checkCountdown()

    // Set up interval for regular checks
    this.checkInterval = setInterval(() => {
      this.checkCountdown()
    }, this.CHECK_INTERVAL_MS)
  }

  // Stop monitoring the countdown
  stopMonitoring(): void {
    if (!this.state.isMonitoring) {
      return
    }

    console.log('Stopping countdown trigger monitoring...')
    this.state.isMonitoring = false
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Check if countdown has reached zero and trigger emails
  private async checkCountdown(): Promise<void> {
    try {
      this.state.lastCheck = new Date()

      // Check if emails have already been sent (persistent state)
      const emailsSentPersistent = await this.checkEmailsSentFromDatabase()

      // If emails have been sent (either in memory or database), stop monitoring
      if (this.state.emailsSent || emailsSentPersistent) {
        if (!this.state.emailsSent && emailsSentPersistent) {
          // Update memory state if database shows emails were already sent
          this.state.emailsSent = true
          this.state.celebrantEmailSent = true
          this.state.contributorEmailsSent = true
          console.log('📧 Birthday emails already sent (found in database), stopping monitoring...')
        } else {
          console.log('📧 Birthday emails already sent (in memory), stopping monitoring...')
        }
        this.stopMonitoring()
        return
      }

      const timeRemaining = await getTimeUntilBirthdayFromDatabase()
      console.log(`Countdown check: ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`)

      // If countdown is complete and emails haven't been sent yet
      if (timeRemaining.isComplete) {
        console.log('🎂 COUNTDOWN COMPLETE! Triggering birthday emails...')
        await this.triggerBirthdayEmails()
      }
    } catch (error) {
      console.error('Error checking countdown:', error)
    }
  }

  // Trigger both celebrant and contributor emails
  private async triggerBirthdayEmails(): Promise<void> {
    try {
      const config = await getBirthdayConfigFromDatabase()

      console.log('🎉 Birthday time! Sending celebration emails...')

      // Send birthday notification to celebrant
      if (!this.state.celebrantEmailSent) {
        await this.sendCelebrantEmail()
      }

      // Send notification to all contributors
      if (!this.state.contributorEmailsSent) {
        await this.sendContributorEmails()
      }

      // Mark emails as sent in both memory and database
      this.state.emailsSent = true
      await this.markEmailsSentInDatabase()

      console.log('✅ All birthday emails sent successfully!')

      // Stop monitoring since emails have been sent
      this.stopMonitoring()

    } catch (error) {
      console.error('❌ Error sending birthday emails:', error)
      throw error
    }
  }

  // Send birthday notification email to the celebrant
  private async sendCelebrantEmail(): Promise<void> {
    try {
      const config = await getBirthdayConfigFromDatabase()

      console.log(`📧 Sending birthday notification to celebrant: ${config.celebrant.email}`)

      // Get message statistics for the email
      const stats = await this.getMessageStats()

      // Create email batch for celebrant
      const celebrantBatch = await emailScheduler.createEmailBatch(
        'birthday_notification',
        [config.celebrant.email]
      )
      
      // Process the batch
      const results = await emailScheduler.processBatch(celebrantBatch.id)
      
      if (results.length > 0 && results[0].success) {
        this.state.celebrantEmailSent = true
        console.log('✅ Celebrant birthday email sent successfully')
      } else {
        throw new Error('Failed to send celebrant email')
      }
      
    } catch (error) {
      console.error('❌ Error sending celebrant email:', error)
      throw error
    }
  }

  // Send notification emails to all contributors
  private async sendContributorEmails(): Promise<void> {
    try {
      console.log('📧 Sending contributor notification emails...')
      
      // Get all contributor email addresses
      const contributorEmails = await this.getContributorEmails()
      
      if (contributorEmails.length === 0) {
        console.log('ℹ️ No contributors to notify')
        this.state.contributorEmailsSent = true
        return
      }
      
      console.log(`📧 Sending notifications to ${contributorEmails.length} contributors`)
      
      // Create email batch for contributors
      const contributorBatch = await emailScheduler.createEmailBatch(
        'contributor_notification',
        contributorEmails
      )
      
      // Process the batch
      const results = await emailScheduler.processBatch(contributorBatch.id)
      
      const successCount = results.filter(r => r.success).length
      
      if (successCount > 0) {
        this.state.contributorEmailsSent = true
        console.log(`✅ Contributor emails sent successfully to ${successCount}/${contributorEmails.length} recipients`)
      } else {
        throw new Error('Failed to send contributor emails')
      }
      
    } catch (error) {
      console.error('❌ Error sending contributor emails:', error)
      throw error
    }
  }

  // Get contributor email addresses from database
  private async getContributorEmails(): Promise<string[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('email')
        .eq('is_approved', true)
        .not('email', 'is', null)
      
      if (error) {
        throw error
      }
      
      // Remove duplicates and filter out empty emails
      const uniqueEmails = [...new Set(messages?.map(m => m.email).filter(Boolean) || [])]
      
      return uniqueEmails
    } catch (error) {
      console.error('Error fetching contributor emails:', error)
      return []
    }
  }

  // Get message statistics for email content
  private async getMessageStats(): Promise<{
    messageCount: number
    contributorCount: number
    locationCount: number
  }> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('email, location')
        .eq('is_approved', true)
      
      if (error) {
        throw error
      }
      
      const messageCount = messages?.length || 0
      const contributorCount = new Set(messages?.map(m => m.email).filter(Boolean)).size
      const locationCount = new Set(messages?.map(m => m.location).filter(Boolean)).size
      
      return {
        messageCount,
        contributorCount,
        locationCount,
      }
    } catch (error) {
      console.error('Error fetching message stats:', error)
      return {
        messageCount: 0,
        contributorCount: 0,
        locationCount: 0,
      }
    }
  }

  // Get current trigger state
  getState(): CountdownTriggerState {
    return { ...this.state }
  }

  // Reset trigger state (for testing purposes)
  reset(): void {
    this.state = {
      isMonitoring: false,
      lastCheck: null,
      emailsSent: false,
      celebrantEmailSent: false,
      contributorEmailsSent: false,
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Check if birthday emails have been sent (from database)
  private async checkEmailsSentFromDatabase(): Promise<boolean> {
    try {
      const { data: config, error } = await supabase
        .from('system_configurations')
        .select('birthday_emails_sent')
        .eq('is_active', true)
        .single()

      if (error) {
        // If the column doesn't exist (PGRST116) or other errors, assume emails not sent
        if (error.code === 'PGRST116' || error.message?.includes('column "birthday_emails_sent" does not exist')) {
          console.log('⚠️ birthday_emails_sent column does not exist, assuming emails not sent')
          return false
        }
        throw error
      }

      return config?.birthday_emails_sent || false
    } catch (error) {
      console.error('Error checking emails sent status from database:', error)
      // If there's any error, assume emails haven't been sent to be safe
      return false
    }
  }

  // Mark birthday emails as sent in database
  private async markEmailsSentInDatabase(): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_configurations')
        .update({
          birthday_emails_sent: true,
          birthday_emails_sent_at: new Date().toISOString(),
        })
        .eq('is_active', true)

      if (error) {
        // If the column doesn't exist, log a warning but don't fail
        if (error.message?.includes('column "birthday_emails_sent" does not exist')) {
          console.log('⚠️ birthday_emails_sent column does not exist, cannot mark emails as sent in database')
          console.log('📧 Please add the birthday_emails_sent field to system_configurations table')
          return
        }
        throw error
      }

      console.log('📧 Marked birthday emails as sent in database')
    } catch (error) {
      console.error('Error marking emails as sent in database:', error)
      // Don't throw the error to prevent email sending from failing
      console.log('⚠️ Continuing without database marking...')
    }
  }
}

// Export singleton instance
export const countdownTrigger = new CountdownTrigger()

// Note: Auto-start removed to prevent multiple instances
// The countdown trigger should be started manually via API calls
