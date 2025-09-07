// API endpoint for sending thank you emails after message submission
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/mailtrap'
import { ThankYouEmail } from '@/components/emails/ThankYouEmail'

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

    console.log(`📧 Sending thank you email to: ${contributorEmail}`)

    // Create email template
    const emailTemplate = ThankYouEmail({
      contributorName,
      contributorEmail,
      girlfriendName,
      messagePreview,
      websiteUrl,
    })

    // Send email
    const result = await emailService.sendTemplateEmail(
      contributorEmail,
      `Thank you for your birthday message for ${girlfriendName}! 🎉`,
      emailTemplate,
      {
        recipientName: contributorName,
        category: 'thank-you',
        customVariables: {
          contributor_name: contributorName,
          girlfriend_name: girlfriendName,
          message_preview: messagePreview.substring(0, 100),
        },
      }
    )

    if (result.success) {
      console.log(`✅ Thank you email sent successfully to ${contributorEmail}`)
      return NextResponse.json({
        success: true,
        messageId: (result as any).messageId,
        recipientEmail: (result as any).recipientEmail,
        deliveredAt: (result as any).deliveredAt,
        message: 'Thank you email sent successfully',
      })
    } else {
      console.error(`❌ Failed to send thank you email to ${contributorEmail}:`, result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          recipientEmail: result.recipientEmail,
          message: 'Failed to send thank you email',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Thank you email API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing email templates
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const preview = url.searchParams.get('preview')
    
    if (preview === 'true') {
      // Return HTML preview of the email template
      const { render } = await import('@react-email/render')
      
      const emailTemplate = ThankYouEmail({
        contributorName: 'John Doe',
        contributorEmail: 'john.doe@example.com',
        girlfriendName: 'Gracela Elmera C. Betarmos',
        messagePreview: 'Happy birthday! Hope you have an amazing day filled with joy and laughter! You deserve all the happiness in the world.',
        websiteUrl: 'https://birthday-surprise-app.vercel.app',
      })

      const html = await render(emailTemplate)
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }

    // Return API information
    return NextResponse.json({
      endpoint: '/api/emails/thank-you',
      methods: ['POST', 'GET'],
      description: 'Send thank you emails to message contributors',
      parameters: {
        POST: {
          contributorName: 'string (required)',
          contributorEmail: 'string (required)',
          messagePreview: 'string (required)',
          girlfriendName: 'string (optional)',
          websiteUrl: 'string (optional)',
        },
        GET: {
          preview: 'boolean (optional) - returns HTML preview of email template',
        },
      },
      examples: {
        POST: {
          contributorName: 'John Doe',
          contributorEmail: 'john.doe@example.com',
          messagePreview: 'Happy birthday! Hope you have an amazing day...',
        },
        GET: '?preview=true',
      },
    })
  } catch (error) {
    console.error('Thank you email GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
