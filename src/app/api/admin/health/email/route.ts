import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/health/email - Check email service health
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check email configuration from database
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    // Check SMTP environment variables
    const smtpConfig = {
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      username: process.env.MAILTRAP_USERNAME,
      password: process.env.MAILTRAP_PASSWORD,
    }

    // Check if required SMTP environment variables are set
    const missingSmtpConfig = []
    if (!smtpConfig.host) missingSmtpConfig.push('MAILTRAP_HOST')
    if (!smtpConfig.port) missingSmtpConfig.push('MAILTRAP_PORT')
    if (!smtpConfig.username) missingSmtpConfig.push('MAILTRAP_USERNAME')
    if (!smtpConfig.password) missingSmtpConfig.push('MAILTRAP_PASSWORD')

    let status = 'healthy'
    let message = 'Email service configured and ready'
    let issues = []

    // Check database configuration
    if (configError || !emailConfig) {
      issues.push('No email configuration found in database')
      status = 'warning'
    } else if (!emailConfig.sender_email) {
      issues.push('Sender email not configured')
      status = 'warning'
    }

    // Check SMTP configuration
    if (missingSmtpConfig.length > 0) {
      issues.push(`Missing SMTP configuration: ${missingSmtpConfig.join(', ')}`)
      status = 'error'
    }

    if (issues.length > 0) {
      message = issues.join('; ')
    }

    return NextResponse.json(
      {
        success: status !== 'error',
        status,
        message,
        config: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          senderEmail: emailConfig?.sender_email || 'Not configured',
          senderName: emailConfig?.sender_name || 'Not configured',
          hasSmtpConfig: missingSmtpConfig.length === 0,
          hasDatabaseConfig: !!emailConfig,
        },
        timestamp: new Date().toISOString(),
      },
      { status: status === 'error' ? 500 : 200 }
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
