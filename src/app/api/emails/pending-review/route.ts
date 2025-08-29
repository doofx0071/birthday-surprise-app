import { NextRequest, NextResponse } from 'next/server'
import { sendMessagePendingReviewEmail } from '@/lib/mailtrap'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      contributorName, 
      contributorEmail, 
      messagePreview,
      girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Gracela Elmera C. Betarmos',
      websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app'
    } = body

    // Validate required fields
    if (!contributorName || !contributorEmail || !messagePreview) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['contributorName', 'contributorEmail', 'messagePreview']
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contributorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send the pending review email
    const result = await sendMessagePendingReviewEmail(contributorEmail, {
      contributorName,
      messagePreview,
      girlfriendName,
      websiteUrl,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Pending review email sent successfully',
        messageId: result.messageId,
        deliveredAt: result.deliveredAt,
      })
    } else {
      console.error('Failed to send pending review email:', result.error)
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Pending review email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
