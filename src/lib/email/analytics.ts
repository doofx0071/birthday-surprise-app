// Email analytics and tracking service
import { getSupabaseAdmin } from '@/lib/supabase'
import type {
  EmailTrackingData,
  EmailAnalytics,
  EmailDeliveryResult,
  EmailType
} from '@/types/email'

export class EmailAnalyticsService {
  private supabase = getSupabaseAdmin()

  // Store email tracking data
  async trackEmailSent(
    emailId: string,
    recipientEmail: string,
    emailType: EmailType,
    messageId?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .insert({
          email_id: emailId,
          recipient_email: recipientEmail,
          email_type: emailType,
          message_id: messageId,
          sent_at: new Date().toISOString(),
          delivered: false,
          opened: false,
          clicked: false,
          bounced: false,
          unsubscribed: false,
        })

      if (error) {
        console.error('Failed to track email sent:', error)
      }
    } catch (error) {
      console.error('Email tracking error:', error)
    }
  }

  // Update delivery status
  async trackEmailDelivered(emailId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .update({
          delivered: true,
          delivered_at: new Date().toISOString(),
        })
        .eq('email_id', emailId)

      if (error) {
        console.error('Failed to track email delivered:', error)
      }
    } catch (error) {
      console.error('Email delivery tracking error:', error)
    }
  }

  // Track email opens
  async trackEmailOpened(emailId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .update({
          opened: true,
          opened_at: new Date().toISOString(),
        })
        .eq('email_id', emailId)

      if (error) {
        console.error('Failed to track email opened:', error)
      }
    } catch (error) {
      console.error('Email open tracking error:', error)
    }
  }

  // Track email clicks
  async trackEmailClicked(emailId: string, clickedUrl?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .update({
          clicked: true,
          clicked_at: new Date().toISOString(),
          clicked_url: clickedUrl,
        })
        .eq('email_id', emailId)

      if (error) {
        console.error('Failed to track email clicked:', error)
      }
    } catch (error) {
      console.error('Email click tracking error:', error)
    }
  }

  // Track bounces
  async trackEmailBounced(emailId: string, bounceReason?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .update({
          bounced: true,
          bounced_at: new Date().toISOString(),
          bounce_reason: bounceReason,
        })
        .eq('email_id', emailId)

      if (error) {
        console.error('Failed to track email bounced:', error)
      }
    } catch (error) {
      console.error('Email bounce tracking error:', error)
    }
  }

  // Track unsubscribes
  async trackEmailUnsubscribed(emailId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_tracking')
        .update({
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email_id', emailId)

      if (error) {
        console.error('Failed to track email unsubscribed:', error)
      }
    } catch (error) {
      console.error('Email unsubscribe tracking error:', error)
    }
  }

  // Get email analytics for a specific type
  async getEmailAnalytics(emailType?: EmailType): Promise<EmailAnalytics> {
    try {
      let query = this.supabase
        .from('email_tracking')
        .select('*')

      if (emailType) {
        query = query.eq('email_type', emailType)
      }

      const { data: trackingData, error } = await query

      if (error) {
        console.error('Failed to get email analytics:', error)
        return this.getEmptyAnalytics()
      }

      if (!trackingData || trackingData.length === 0) {
        return this.getEmptyAnalytics()
      }

      const totalSent = trackingData.length
      const totalDelivered = trackingData.filter(t => t.delivered).length
      const totalOpened = trackingData.filter(t => t.opened).length
      const totalClicked = trackingData.filter(t => t.clicked).length
      const totalBounced = trackingData.filter(t => t.bounced).length
      const totalUnsubscribed = trackingData.filter(t => t.unsubscribed).length

      return {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalBounced,
        totalUnsubscribed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      }
    } catch (error) {
      console.error('Email analytics error:', error)
      return this.getEmptyAnalytics()
    }
  }

  // Get detailed tracking data
  async getTrackingData(
    emailType?: EmailType,
    limit: number = 100
  ): Promise<EmailTrackingData[]> {
    try {
      let query = this.supabase
        .from('email_tracking')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (emailType) {
        query = query.eq('email_type', emailType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get tracking data:', error)
        return []
      }

      return data?.map(row => ({
        emailId: row.email_id,
        recipientEmail: row.recipient_email,
        sentAt: new Date(row.sent_at),
        deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
        openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
        clickedAt: row.clicked_at ? new Date(row.clicked_at) : undefined,
        bounced: row.bounced,
        unsubscribed: row.unsubscribed,
        errorMessage: row.error_message,
      })) || []
    } catch (error) {
      console.error('Tracking data error:', error)
      return []
    }
  }

  // Get analytics by email type
  async getAnalyticsByType(): Promise<Record<EmailType, EmailAnalytics>> {
    const emailTypes: EmailType[] = [
      'birthday_notification',
      'contributor_notification',
      'reminder_week',
      'reminder_day',
      'reminder_hour',
      'thank_you',
      'admin_alert',
    ]

    const analytics: Record<string, EmailAnalytics> = {}

    for (const type of emailTypes) {
      analytics[type] = await this.getEmailAnalytics(type)
    }

    return analytics as Record<EmailType, EmailAnalytics>
  }

  // Get recent email activity
  async getRecentActivity(hours: number = 24): Promise<EmailTrackingData[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000)

      const { data, error } = await this.supabase
        .from('email_tracking')
        .select('*')
        .gte('sent_at', cutoffDate.toISOString())
        .order('sent_at', { ascending: false })

      if (error) {
        console.error('Failed to get recent activity:', error)
        return []
      }

      return data?.map(row => ({
        emailId: row.email_id,
        recipientEmail: row.recipient_email,
        sentAt: new Date(row.sent_at),
        deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
        openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
        clickedAt: row.clicked_at ? new Date(row.clicked_at) : undefined,
        bounced: row.bounced,
        unsubscribed: row.unsubscribed,
        errorMessage: row.error_message,
      })) || []
    } catch (error) {
      console.error('Recent activity error:', error)
      return []
    }
  }

  private getEmptyAnalytics(): EmailAnalytics {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalBounced: 0,
      totalUnsubscribed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    }
  }
}

// Export singleton instance
export const emailAnalytics = new EmailAnalyticsService()

// Utility functions for generating tracking URLs
export const generateTrackingPixelUrl = (emailId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/emails/track/open?id=${emailId}`
}

export const generateClickTrackingUrl = (emailId: string, targetUrl: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const encodedUrl = encodeURIComponent(targetUrl)
  return `${baseUrl}/api/emails/track/click?id=${emailId}&url=${encodedUrl}`
}

export const generateUnsubscribeUrl = (emailId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/emails/unsubscribe?id=${emailId}`
}
