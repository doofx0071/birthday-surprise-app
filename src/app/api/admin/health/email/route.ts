import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/health/email - Check email service health
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check email service configuration
    const emailConfig = {
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      username: process.env.MAILTRAP_USERNAME,
      password: process.env.MAILTRAP_PASSWORD,
      apiToken: process.env.MAILTRAP_API_TOKEN,
      from: process.env.EMAIL_FROM,
    }

    // Check if required environment variables are set
    const missingConfig = []
    if (!emailConfig.host) missingConfig.push('MAILTRAP_HOST')
    if (!emailConfig.port) missingConfig.push('MAILTRAP_PORT')
    if (!emailConfig.username) missingConfig.push('MAILTRAP_USERNAME')
    if (!emailConfig.password) missingConfig.push('MAILTRAP_PASSWORD')
    if (!emailConfig.from) missingConfig.push('EMAIL_FROM')

    if (missingConfig.length > 0) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: `Missing email configuration: ${missingConfig.join(', ')}`,
        },
        { status: 500 }
      )
    }

    // For now, we'll just check configuration
    // In a real implementation, you might want to send a test email
    let status = 'healthy'
    let message = 'Email service configured and ready'

    // Check if API token is available for enhanced features
    if (!emailConfig.apiToken) {
      status = 'warning'
      message = 'Email service configured but API token missing (SMTP only)'
    }

    return NextResponse.json(
      {
        success: true,
        status,
        message,
        config: {
          host: emailConfig.host,
          port: emailConfig.port,
          from: emailConfig.from,
          hasApiToken: !!emailConfig.apiToken,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email health check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Email health check failed',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
