// Email click tracking endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailAnalytics } from '@/lib/email/analytics'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const emailId = url.searchParams.get('id')
    const targetUrl = url.searchParams.get('url')

    if (!emailId || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing email ID or target URL' },
        { status: 400 }
      )
    }

    // Track the email click
    await emailAnalytics.trackEmailClicked(emailId, targetUrl)

    // Redirect to the target URL
    return NextResponse.redirect(decodeURIComponent(targetUrl))
  } catch (error) {
    console.error('Email click tracking error:', error)
    
    // If tracking fails, still try to redirect
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')
    
    if (targetUrl) {
      return NextResponse.redirect(decodeURIComponent(targetUrl))
    }
    
    return NextResponse.json(
      { error: 'Click tracking failed' },
      { status: 500 }
    )
  }
}
