import { NextRequest, NextResponse } from 'next/server'
import PasswordResetEmail from '@/components/emails/password-reset'

export async function GET(request: NextRequest) {
  try {
    const { render } = await import('@react-email/render')
    
    const emailTemplate = PasswordResetEmail({
      adminName: 'Admin',
      resetLink: 'https://doofio.site/admin/reset-password?token=sample-reset-token-123',
      expirationTime: '1 hour'
    })

    const html = await render(emailTemplate)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error rendering password reset email:', error)
    return NextResponse.json(
      { error: 'Failed to render email template' },
      { status: 500 }
    )
  }
}
