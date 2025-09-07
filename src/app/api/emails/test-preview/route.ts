import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { TestEmail } from '@/components/emails/TestEmail'

/**
 * GET /api/emails/test-preview - Preview test email template
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters from query string
    const recipientName = searchParams.get('recipientName') || 'Test User'
    const recipientEmail = searchParams.get('recipientEmail') || 'test@example.com'
    const senderName = searchParams.get('senderName') || "Cela's Birthday"
    const senderEmail = searchParams.get('senderEmail') || 'birthday@example.com'
    const replyToEmail = searchParams.get('replyToEmail') || 'noreply@example.com'
    const testTimestamp = searchParams.get('testTimestamp') || new Date().toISOString()
    const websiteUrl = searchParams.get('websiteUrl') || 'https://doofio.site'

    // Render the email template
    const emailHtml = await render(
      TestEmail({
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        replyToEmail,
        testTimestamp,
        websiteUrl,
      })
    )

    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error rendering test email preview:', error)
    return NextResponse.json(
      { error: 'Failed to render test email preview' },
      { status: 500 }
    )
  }
}
