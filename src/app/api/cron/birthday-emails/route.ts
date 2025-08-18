// Cron job API endpoint for automated birthday email delivery
import { NextRequest, NextResponse } from 'next/server'
import { emailScheduler } from '@/lib/email/scheduler'
import { emailService } from '@/lib/email/mailtrap'

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured')
    return false
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current status
    const schedule = emailScheduler.calculateEmailSchedule()
    const isBirthdayTime = emailScheduler.isBirthdayTime()
    const isWeekReminder = emailScheduler.isReminderTime('week')
    const isDayReminder = emailScheduler.isReminderTime('day')
    const isHourReminder = emailScheduler.isReminderTime('hour')

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      schedule: {
        birthdayDate: schedule.birthdayDate.toISOString(),
        timezone: schedule.timezone,
        reminderSchedule: {
          week: schedule.reminderSchedule.week.toISOString(),
          day: schedule.reminderSchedule.day.toISOString(),
          hour: schedule.reminderSchedule.hour.toISOString(),
        },
      },
      triggers: {
        isBirthdayTime,
        isWeekReminder,
        isDayReminder,
        isHourReminder,
      },
      batches: emailScheduler.getAllBatches().map(batch => ({
        id: batch.id,
        type: batch.type,
        status: batch.status,
        recipientCount: batch.recipients.length,
        createdAt: batch.createdAt.toISOString(),
        completedAt: batch.completedAt?.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Cron status check failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint for cron job execution
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      console.error('Unauthorized cron job attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🕐 Birthday email cron job started at:', new Date().toISOString())

    // Test email service connection
    const isConnected = await emailService.testConnection()
    if (!isConnected) {
      throw new Error('Email service connection failed')
    }

    // Process birthday emails
    await emailScheduler.processBirthdayEmails()

    const executionTime = Date.now() - startTime
    console.log(`✅ Birthday email cron job completed in ${executionTime}ms`)

    // Get execution summary
    const recentBatches = emailScheduler.getAllBatches()
      .filter(batch => batch.createdAt.getTime() > startTime - 60000) // Last minute
      .map(batch => ({
        id: batch.id,
        type: batch.type,
        status: batch.status,
        recipientCount: batch.recipients.length,
        successCount: batch.results.filter(r => r.success).length,
        failureCount: batch.results.filter(r => !r.success).length,
      }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      batchesProcessed: recentBatches.length,
      batches: recentBatches,
      message: 'Birthday email processing completed successfully',
    })
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error('❌ Birthday email cron job failed:', error)

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: executionTime,
        error: String(error),
        message: 'Birthday email processing failed',
      },
      { status: 500 }
    )
  }
}

// PUT endpoint for manual email sending (admin use)
export async function PUT(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emailType, recipients, force = false } = body

    if (!emailType || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: emailType, recipients[]' },
        { status: 400 }
      )
    }

    console.log(`📧 Manual email sending requested: ${emailType} to ${recipients.length} recipients`)

    // Create and process batch
    const batch = await emailScheduler.createEmailBatch(emailType, recipients)
    const results = await emailScheduler.processBatch(batch.id)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      emailType,
      recipientCount: recipients.length,
      successCount,
      failureCount,
      results: results.map(r => ({
        recipientEmail: r.recipientEmail,
        success: r.success,
        messageId: r.messageId,
        error: r.error,
      })),
      message: `Manual email sending completed: ${successCount} sent, ${failureCount} failed`,
    })
  } catch (error) {
    console.error('Manual email sending failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Manual email sending failed',
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint for cleaning up old batches
export async function DELETE(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const olderThanDays = parseInt(url.searchParams.get('olderThanDays') || '7')

    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    const allBatches = emailScheduler.getAllBatches()
    const oldBatches = allBatches.filter(batch => batch.createdAt < cutoffDate)

    // In a real implementation, you'd clean up from persistent storage
    // For now, we'll just return the count that would be cleaned up
    
    return NextResponse.json({
      success: true,
      message: `Would clean up ${oldBatches.length} batches older than ${olderThanDays} days`,
      batchesFound: oldBatches.length,
      cutoffDate: cutoffDate.toISOString(),
    })
  } catch (error) {
    console.error('Batch cleanup failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Batch cleanup failed',
      },
      { status: 500 }
    )
  }
}
