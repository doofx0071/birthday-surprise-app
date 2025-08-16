// Email system testing endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailService, validateEmailConfig } from '@/lib/email/mailtrap'
import { emailScheduler } from '@/lib/email/scheduler'
import { emailAnalytics } from '@/lib/email/analytics'
import { BirthdayNotificationEmail } from '@/components/emails/BirthdayNotification'
import { ContributorNotificationEmail } from '@/components/emails/ContributorNotification'
import { ThankYouEmail } from '@/components/emails/ThankYouEmail'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const testType = url.searchParams.get('type') || 'all'
    const sendEmail = url.searchParams.get('send') === 'true'
    const testEmail = url.searchParams.get('email') || 'test@example.com'

    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      results: {},
    }

    // Test 1: Email Configuration
    if (testType === 'all' || testType === 'config') {
      results.results.configuration = {
        isValid: validateEmailConfig(),
        environment: {
          MAILTRAP_HOST: !!process.env.MAILTRAP_HOST,
          MAILTRAP_USERNAME: !!process.env.MAILTRAP_USERNAME,
          MAILTRAP_PASSWORD: !!process.env.MAILTRAP_PASSWORD,
          EMAIL_FROM: !!process.env.EMAIL_FROM,
          MAILTRAP_API_TOKEN: !!process.env.MAILTRAP_API_TOKEN,
        },
      }
    }

    // Test 2: Email Service Connection
    if (testType === 'all' || testType === 'connection') {
      try {
        const isConnected = await emailService.testConnection()
        results.results.connection = {
          success: isConnected,
          message: isConnected ? 'Email service connected successfully' : 'Email service connection failed',
        }
      } catch (error) {
        results.results.connection = {
          success: false,
          error: String(error),
        }
      }
    }

    // Test 3: Email Templates
    if (testType === 'all' || testType === 'templates') {
      try {
        const { render } = await import('@react-email/render')
        
        const birthdayTemplate = BirthdayNotificationEmail({
          recipientName: 'Test User',
          recipientEmail: testEmail,
          girlfriendName: 'Gracela Elmera C. Betarmos',
          messageCount: 15,
          contributorCount: 8,
          locationCount: 5,
          websiteUrl: 'https://birthday-surprise-app.vercel.app',
        })

        const contributorTemplate = ContributorNotificationEmail({
          recipientName: 'Test Contributor',
          recipientEmail: testEmail,
          contributorName: 'Test Contributor',
          girlfriendName: 'Gracela Elmera C. Betarmos',
          messageCount: 15,
          contributorCount: 8,
          locationCount: 5,
          websiteUrl: 'https://birthday-surprise-app.vercel.app',
        })

        const thankYouTemplate = ThankYouEmail({
          contributorName: 'Test Contributor',
          contributorEmail: testEmail,
          girlfriendName: 'Gracela Elmera C. Betarmos',
          messagePreview: 'Happy birthday! Hope you have an amazing day!',
          websiteUrl: 'https://birthday-surprise-app.vercel.app',
        })

        const birthdayHtml = await render(birthdayTemplate)
        const contributorHtml = await render(contributorTemplate)
        const thankYouHtml = await render(thankYouTemplate)

        results.results.templates = {
          success: true,
          templates: {
            birthday: {
              rendered: birthdayHtml.length > 0,
              size: birthdayHtml.length,
            },
            contributor: {
              rendered: contributorHtml.length > 0,
              size: contributorHtml.length,
            },
            thankYou: {
              rendered: thankYouHtml.length > 0,
              size: thankYouHtml.length,
            },
          },
        }
      } catch (error) {
        results.results.templates = {
          success: false,
          error: String(error),
        }
      }
    }

    // Test 4: Email Scheduling
    if (testType === 'all' || testType === 'scheduling') {
      try {
        const schedule = emailScheduler.calculateEmailSchedule()
        const isBirthdayTime = emailScheduler.isBirthdayTime()
        const isWeekReminder = emailScheduler.isReminderTime('week')
        const isDayReminder = emailScheduler.isReminderTime('day')
        const isHourReminder = emailScheduler.isReminderTime('hour')

        results.results.scheduling = {
          success: true,
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
        }
      } catch (error) {
        results.results.scheduling = {
          success: false,
          error: String(error),
        }
      }
    }

    // Test 5: Email Analytics
    if (testType === 'all' || testType === 'analytics') {
      try {
        const analytics = await emailAnalytics.getEmailAnalytics()
        const recentActivity = await emailAnalytics.getRecentActivity(1)

        results.results.analytics = {
          success: true,
          analytics,
          recentActivityCount: recentActivity.length,
        }
      } catch (error) {
        results.results.analytics = {
          success: false,
          error: String(error),
        }
      }
    }

    // Test 6: Send Test Email (if requested)
    if (sendEmail && (testType === 'all' || testType === 'send')) {
      try {
        const testTemplate = ThankYouEmail({
          contributorName: 'Test User',
          contributorEmail: testEmail,
          girlfriendName: 'Gracela Elmera C. Betarmos',
          messagePreview: 'This is a test email from the birthday surprise system!',
          websiteUrl: 'https://birthday-surprise-app.vercel.app',
        })

        const result = await emailService.sendTemplateEmail(
          testEmail,
          '🧪 Test Email from Birthday Surprise System',
          testTemplate,
          {
            recipientName: 'Test User',
            category: 'test',
            customVariables: {
              test_type: 'system_test',
              timestamp: new Date().toISOString(),
            },
          }
        )

        results.results.sendTest = {
          success: result.success,
          messageId: result.messageId,
          recipientEmail: result.recipientEmail,
          deliveredAt: result.deliveredAt,
          error: result.error,
        }
      } catch (error) {
        results.results.sendTest = {
          success: false,
          error: String(error),
        }
      }
    }

    // Calculate overall success
    const allTests = Object.values(results.results)
    const successfulTests = allTests.filter((test: any) => test.success !== false)
    const overallSuccess = successfulTests.length === allTests.length

    return NextResponse.json({
      success: overallSuccess,
      summary: {
        totalTests: allTests.length,
        successfulTests: successfulTests.length,
        failedTests: allTests.length - successfulTests.length,
        overallSuccess,
      },
      ...results,
    })
  } catch (error) {
    console.error('Email system test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Email system test failed',
      },
      { status: 500 }
    )
  }
}

// POST endpoint for running specific tests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, recipients, emailType } = body

    if (testType === 'batch') {
      // Test batch email sending
      if (!recipients || !Array.isArray(recipients)) {
        return NextResponse.json(
          { error: 'Recipients array required for batch test' },
          { status: 400 }
        )
      }

      const batch = await emailScheduler.createEmailBatch(
        emailType || 'thank_you',
        recipients
      )

      const results = await emailScheduler.processBatch(batch.id)

      return NextResponse.json({
        success: true,
        batchId: batch.id,
        results: results.map(r => ({
          recipientEmail: r.recipientEmail,
          success: r.success,
          messageId: r.messageId,
          error: r.error,
        })),
      })
    }

    return NextResponse.json(
      { error: 'Invalid test type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email test POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Email test failed',
      },
      { status: 500 }
    )
  }
}
