// Admin API for manually triggering cron job for testing
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionFromRequest } from '@/lib/admin-auth'
import { emailScheduler } from '@/lib/email/scheduler'
import { emailQueue } from '@/lib/email/queue'
import { emailService } from '@/lib/email/mailtrap'

// POST - Manually trigger the cron job logic
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { forceEmailSending = false } = body

    console.log('🔧 Manual cron trigger started by admin:', adminUser.email)

    // Test email service connection
    const isConnected = await emailService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Email service connection failed' },
        { status: 500 }
      )
    }

    let emailResults = null

    if (forceEmailSending) {
      // Force email sending even if already sent (for testing)
      console.log('🔧 Force mode: Bypassing email sent check')
      
      // Temporarily reset email sent status
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      await supabase
        .from('system_configurations')
        .update({
          birthday_emails_sent: false,
          birthday_emails_sent_at: null,
        })
        .eq('is_active', true)

      // Process birthday emails
      await emailScheduler.processBirthdayEmails()
      emailResults = 'Forced email sending completed'
    } else {
      // Normal processing (respects email sent status)
      await emailScheduler.processBirthdayEmails()
      emailResults = 'Normal email processing completed'
    }

    // Process email queue
    await emailQueue.processQueue()

    // Get queue statistics
    const queueStats = await emailQueue.getQueueStats()

    // Get recent batches
    const recentBatches = emailScheduler.getAllBatches()
      .slice(-5) // Last 5 batches
      .map(batch => ({
        id: batch.id,
        type: batch.type,
        status: batch.status,
        recipientCount: batch.recipients.length,
        successCount: batch.results.filter(r => r.success).length,
        failureCount: batch.results.filter(r => !r.success).length,
        createdAt: batch.createdAt.toISOString(),
      }))

    return NextResponse.json({
      success: true,
      message: 'Manual cron job execution completed',
      timestamp: new Date().toISOString(),
      results: {
        emailProcessing: emailResults,
        queueProcessing: 'Queue processing completed',
        emailServiceConnected: isConnected,
      },
      statistics: {
        queueStats,
        recentBatches,
      },
    })

  } catch (error) {
    console.error('Manual cron trigger error:', error)
    return NextResponse.json(
      { error: 'Manual cron trigger failed', details: String(error) },
      { status: 500 }
    )
  }
}

// GET - Get cron job status and next run time
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Calculate next cron run time
    const now = new Date()
    const minutesSinceHour = now.getMinutes()
    const minutesToNextCron = 15 - (minutesSinceHour % 15)
    const nextCronTime = new Date(now.getTime() + (minutesToNextCron * 60 * 1000))

    // Get email service status
    const isEmailServiceConnected = await emailService.testConnection()

    // Get queue statistics
    const queueStats = await emailQueue.getQueueStats()

    // Check if birthday time
    const isBirthdayTime = emailScheduler.isBirthdayTime()

    return NextResponse.json({
      success: true,
      currentTime: now.toISOString(),
      nextCronRun: {
        time: nextCronTime.toISOString(),
        minutesFromNow: minutesToNextCron,
      },
      cronSchedule: '*/15 * * * * (every 15 minutes)',
      emailService: {
        connected: isEmailServiceConnected,
        provider: 'Mailtrap',
      },
      birthdayStatus: {
        isBirthdayTime,
        message: isBirthdayTime ? 'It\'s birthday time! Emails should be sending.' : 'Not birthday time yet.',
      },
      queueStats,
    })

  } catch (error) {
    console.error('Cron status error:', error)
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}
