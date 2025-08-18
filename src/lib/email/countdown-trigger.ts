// Countdown trigger system for automatic birthday email sending
import { emailScheduler } from './scheduler'
import { getBirthdayConfig, getTimeUntilBirthday } from '../config/birthday'
import { supabase } from '../supabase'

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
  startMonitoring(): void {
    if (this.state.isMonitoring) {
      console.log('Countdown trigger already monitoring')
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
      const timeRemaining = getTimeUntilBirthday()
      
      console.log(`Countdown check: ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`)
      
      // If countdown is complete and emails haven't been sent yet
      if (timeRemaining.isComplete && !this.state.emailsSent) {
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
      const config = getBirthdayConfig()
      
      console.log('🎉 Birthday time! Sending celebration emails...')
      
      // Send birthday notification to celebrant
      if (!this.state.celebrantEmailSent) {
        await this.sendCelebrantEmail()
      }
      
      // Send notification to all contributors
      if (!this.state.contributorEmailsSent) {
        await this.sendContributorEmails()
      }
      
      // Mark emails as sent
      this.state.emailsSent = true
      
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
      const config = getBirthdayConfig()
      
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
}

// Export singleton instance
export const countdownTrigger = new CountdownTrigger()

// Auto-start monitoring when module is imported (in production)
if (process.env.NODE_ENV === 'production') {
  countdownTrigger.startMonitoring()
}
