import { NextRequest, NextResponse } from 'next/server'
import { BirthdayNotificationEmail } from '@/components/emails/BirthdayNotification'

export async function GET(request: NextRequest) {
  try {
    const { render } = await import('@react-email/render')
    
    const emailTemplate = BirthdayNotificationEmail({
      recipientName: 'Gracela Elmera C. Betarmos',
      recipientEmail: 'gracela@example.com',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      messageCount: 25,
      contributorCount: 12,
      locationCount: 8,
      websiteUrl: 'https://birthday-surprise-app.vercel.app',
      previewText: 'Your special day has arrived! See all the love waiting for you...',
    })

    const html = await render(emailTemplate)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Birthday email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate birthday email preview', details: String(error) },
      { status: 500 }
    )
  }
}
