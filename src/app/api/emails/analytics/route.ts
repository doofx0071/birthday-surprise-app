// Email analytics API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailAnalytics } from '@/lib/email/analytics'
import type { EmailType } from '@/types/email'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const emailType = url.searchParams.get('type') as EmailType | null
    const detailed = url.searchParams.get('detailed') === 'true'
    const hours = parseInt(url.searchParams.get('hours') || '24')

    if (detailed) {
      // Return detailed analytics with tracking data
      const [analytics, trackingData, recentActivity, analyticsByType] = await Promise.all([
        emailAnalytics.getEmailAnalytics(emailType || undefined),
        emailAnalytics.getTrackingData(emailType || undefined, 50),
        emailAnalytics.getRecentActivity(hours),
        emailAnalytics.getAnalyticsByType(),
      ])

      return NextResponse.json({
        success: true,
        data: {
          analytics,
          trackingData,
          recentActivity,
          analyticsByType,
          filters: {
            emailType: emailType || 'all',
            hours,
          },
        },
      })
    } else {
      // Return basic analytics only
      const analytics = await emailAnalytics.getEmailAnalytics(emailType || undefined)
      
      return NextResponse.json({
        success: true,
        data: {
          analytics,
          filters: {
            emailType: emailType || 'all',
          },
        },
      })
    }
  } catch (error) {
    console.error('Email analytics API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Failed to get email analytics',
      },
      { status: 500 }
    )
  }
}

// POST endpoint for manual tracking events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, emailId, data } = body

    if (!action || !emailId) {
      return NextResponse.json(
        { error: 'Missing action or emailId' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'delivered':
        await emailAnalytics.trackEmailDelivered(emailId)
        break
      
      case 'opened':
        await emailAnalytics.trackEmailOpened(emailId)
        break
      
      case 'clicked':
        await emailAnalytics.trackEmailClicked(emailId, data?.url)
        break
      
      case 'bounced':
        await emailAnalytics.trackEmailBounced(emailId, data?.reason)
        break
      
      case 'unsubscribed':
        await emailAnalytics.trackEmailUnsubscribed(emailId)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Email ${action} tracked successfully`,
      emailId,
    })
  } catch (error) {
    console.error('Email tracking API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Failed to track email event',
      },
      { status: 500 }
    )
  }
}
