import { NextRequest, NextResponse } from 'next/server'
import { countdownTrigger } from '@/lib/email/countdown-trigger'
import { getTimeUntilBirthday, getBirthdayConfig } from '@/lib/config/birthday'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    switch (action) {
      case 'status':
        // Get current trigger status and countdown info
        const triggerState = countdownTrigger.getState()
        const timeRemaining = getTimeUntilBirthday()
        const config = getBirthdayConfig()
        
        return NextResponse.json({
          success: true,
          data: {
            trigger: triggerState,
            countdown: timeRemaining,
            config: {
              celebrantName: config.celebrant.name,
              celebrantEmail: config.celebrant.email,
              birthdayDate: config.birthday.date.toISOString(),
              timezone: config.birthday.timezone,
            },
          },
        })
      
      case 'start':
        // Start monitoring the countdown
        countdownTrigger.startMonitoring()
        return NextResponse.json({
          success: true,
          message: 'Countdown trigger monitoring started',
          data: countdownTrigger.getState(),
        })
      
      case 'stop':
        // Stop monitoring the countdown
        countdownTrigger.stopMonitoring()
        return NextResponse.json({
          success: true,
          message: 'Countdown trigger monitoring stopped',
          data: countdownTrigger.getState(),
        })
      
      case 'reset':
        // Reset trigger state (for testing)
        countdownTrigger.reset()
        return NextResponse.json({
          success: true,
          message: 'Countdown trigger reset',
          data: countdownTrigger.getState(),
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: status, start, stop, or reset',
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Countdown trigger API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error),
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, celebrantEmail } = body
    
    switch (action) {
      case 'update_celebrant_email':
        if (!celebrantEmail || typeof celebrantEmail !== 'string') {
          return NextResponse.json({
            success: false,
            error: 'Valid celebrant email is required',
          }, { status: 400 })
        }
        
        // Update celebrant email configuration
        const { updateCelebrantEmail } = await import('@/lib/config/birthday')
        const updatedConfig = updateCelebrantEmail(celebrantEmail)
        
        return NextResponse.json({
          success: true,
          message: 'Celebrant email updated successfully',
          data: {
            celebrantName: updatedConfig.celebrant.name,
            celebrantEmail: updatedConfig.celebrant.email,
          },
        })
      
      case 'trigger_test':
        // Manually trigger birthday emails (for testing)
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json({
            success: false,
            error: 'Test trigger only available in development mode',
          }, { status: 403 })
        }
        
        // Import and trigger emails manually
        const { emailScheduler } = await import('@/lib/email/scheduler')
        
        // Send birthday notification to celebrant
        const config = getBirthdayConfig()
        const birthdayBatch = await emailScheduler.createEmailBatch(
          'birthday_notification',
          [config.celebrant.email]
        )
        const birthdayResults = await emailScheduler.processBatch(birthdayBatch.id)
        
        // Send notifications to contributors
        const contributorEmails = await emailScheduler.getEmailRecipients('contributor_notification')
        let contributorResults: any[] = []
        
        if (contributorEmails.length > 0) {
          const contributorBatch = await emailScheduler.createEmailBatch(
            'contributor_notification',
            contributorEmails
          )
          contributorResults = await emailScheduler.processBatch(contributorBatch.id)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Test emails triggered successfully',
          data: {
            celebrantEmail: {
              sent: birthdayResults.length > 0 && birthdayResults[0].success,
              recipient: config.celebrant.email,
            },
            contributorEmails: {
              sent: contributorResults.filter(r => r.success).length,
              total: contributorResults.length,
              recipients: contributorEmails,
            },
          },
        })
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Countdown trigger POST API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error),
    }, { status: 500 })
  }
}
