import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email/mailtrap'
import { render } from '@react-email/render'
import { TestEmail } from '@/components/emails/TestEmail'

/**
 * POST /api/admin/email-test - Send test email with current configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail, senderName, senderEmail, replyToEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid test email format' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current email configuration from database
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    // Use provided configuration or fall back to database/defaults
    const finalConfig = {
      senderName: senderName || emailConfig?.sender_name || "Cela's Birthday",
      senderEmail: senderEmail || emailConfig?.sender_email || 'birthday@example.com',
      replyToEmail: replyToEmail || emailConfig?.reply_to_email || 'noreply@example.com',
    }

    // Create test email template
    const testEmailTemplate = TestEmail({
      recipientName: 'Test User',
      recipientEmail: testEmail,
      senderName: finalConfig.senderName,
      senderEmail: finalConfig.senderEmail,
      replyToEmail: finalConfig.replyToEmail,
      testTimestamp: new Date().toISOString(),
      websiteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    })

    // Send test email
    const result = await emailService.sendTemplateEmail(
      testEmail,
      `🧪 Test Email from ${finalConfig.senderName}`,
      testEmailTemplate,
      {
        recipientName: 'Test User',
        category: 'test',
        customVariables: {
          test_type: 'configuration_test',
          sender_name: finalConfig.senderName,
          sender_email: finalConfig.senderEmail,
          reply_to_email: finalConfig.replyToEmail,
          timestamp: new Date().toISOString(),
        },
      }
    )

    if (result.success) {
      // Log successful test email
      await supabase.rpc('log_system_event', {
        p_level: 'info',
        p_message: 'Test email sent successfully',
        p_category: 'email',
        p_details: {
          recipient: testEmail,
          sender_name: finalConfig.senderName,
          sender_email: finalConfig.senderEmail,
          message_id: result.messageId,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        messageId: result.messageId,
        config: finalConfig,
      })
    } else {
      throw new Error(result.error || 'Failed to send test email')
    }
  } catch (error) {
    console.error('Test email error:', error)

    // Log error
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      await supabase.rpc('log_system_event', {
        p_level: 'error',
        p_message: 'Test email failed',
        p_category: 'email',
        p_details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    } catch (logError) {
      console.error('Failed to log test email error:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}
