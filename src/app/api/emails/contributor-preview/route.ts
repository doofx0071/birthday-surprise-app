import { NextRequest, NextResponse } from 'next/server'
import { ContributorNotificationEmail } from '@/components/emails/ContributorNotification'

export async function GET(request: NextRequest) {
  try {
    const { render } = await import('@react-email/render')
    
    const emailTemplate = ContributorNotificationEmail({
      recipientName: 'Cris',
      recipientEmail: 'cris@snoorlaxx.com',
      contributorName: 'Cris',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      messageCount: 25,
      contributorCount: 12,
      locationCount: 8,
      websiteUrl: 'https://birthday-surprise-app.vercel.app',
      previewText: 'Today is Gracela Elmera C. Betarmos\'s birthday! See all the love you helped create...',
    })

    const html = await render(emailTemplate)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Contributor email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate contributor email preview', details: String(error) },
      { status: 500 }
    )
  }
}
