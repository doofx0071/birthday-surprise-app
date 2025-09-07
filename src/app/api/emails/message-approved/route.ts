import { NextRequest, NextResponse } from 'next/server'
import { sendMessageApprovedEmail } from '@/lib/mailtrap'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      contributorName, 
      contributorEmail, 
      messagePreview,
      girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Gracela Elmera C. Betarmos',
      websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
      approvedAt = new Date().toLocaleDateString()
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

    // Send the message approved email
    const result = await sendMessageApprovedEmail(contributorEmail, {
      contributorName,
      messagePreview,
      girlfriendName,
      websiteUrl,
      approvedAt,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Message approved email sent successfully',
        messageId: (result as any).messageId,
        deliveredAt: (result as any).deliveredAt,
      })
    } else {
      console.error('Failed to send message approved email:', result.error)
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Message approved email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
