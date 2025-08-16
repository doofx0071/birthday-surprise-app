// Email open tracking endpoint
import { NextRequest, NextResponse } from 'next/server'
import { emailAnalytics } from '@/lib/email/analytics'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const emailId = url.searchParams.get('id')

    if (!emailId) {
      return new Response('Missing email ID', { status: 400 })
    }

    // Track the email open
    await emailAnalytics.trackEmailOpened(emailId)

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Email open tracking error:', error)
    
    // Still return a pixel even if tracking fails
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
      },
    })
  }
}
