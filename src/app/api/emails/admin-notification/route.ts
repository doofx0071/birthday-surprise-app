import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/mailtrap'
import { AdminNotificationEmail } from '@/components/emails/admin-notification'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/emails/admin-notification
 * Send admin notification email when a new birthday message is submitted
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      senderName, 
      senderEmail, 
      messagePreview,
      submissionTime,
      girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Gracela Elmera C. Betarmos',
      adminDashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/messages`
    } = body

    // Validate required fields
    if (!senderName || !senderEmail || !messagePreview) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['senderName', 'senderEmail', 'messagePreview']
        },
        { status: 400 }
      )
    }

    // Get admin email from database configuration
    const adminEmail = await getAdminEmail()
    if (!adminEmail) {
      console.error('No admin email configured - skipping admin notification')
      return NextResponse.json(
        { 
          success: false,
          error: 'No admin email configured',
          message: 'Admin notification skipped - no admin email found'
        },
        { status: 200 } // Don't fail the request, just log the issue
      )
    }

    // Format submission time
    const formattedTime = submissionTime 
      ? new Date(submissionTime).toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      : new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })

    // Truncate message preview to 100 characters
    const truncatedPreview = messagePreview.length > 100 
      ? messagePreview.substring(0, 100)
      : messagePreview

    // Create email service instance
    const emailService = new EmailService()

    // Create admin notification email template
    const template = AdminNotificationEmail({
      senderName,
      senderEmail,
      messagePreview: truncatedPreview,
      submissionTime: formattedTime,
      adminDashboardUrl,
      girlfriendName,
      previewText: `New birthday message from ${senderName}`
    })

    // Send email to admin
    const result = await emailService.sendTemplateEmail(
      [adminEmail],
      `🎂 New Birthday Message from ${senderName}`,
      template,
      {
        recipientName: 'Admin',
        category: 'admin-notification',
        customVariables: {
          sender_name: senderName,
          sender_email: senderEmail,
          submission_time: formattedTime,
          girlfriend_name: girlfriendName,
          message_length: messagePreview.length.toString(),
        },
      }
    )

    if (result.success) {
      console.log(`✅ Admin notification sent successfully to ${adminEmail}`)
      return NextResponse.json({
        success: true,
        message: 'Admin notification sent successfully',
        adminEmail: adminEmail,
        messageId: (result as any).messageId,
        deliveredAt: (result as any).deliveredAt,
      })
    } else {
      console.error(`❌ Failed to send admin notification to ${adminEmail}:`, result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Failed to send admin notification email'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Admin notification email error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Internal server error while sending admin notification'
      },
      { status: 500 }
    )
  }
}

/**
 * Get admin email address from database configuration
 * Checks admin_users table first, then falls back to other sources
 */
async function getAdminEmail(): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, try to get admin email from admin_users table
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .limit(1)
      .single()

    if (!adminError && adminUsers?.email) {
      console.log(`✅ Found admin email in admin_users table: ${adminUsers.email}`)
      return adminUsers.email
    }

    // Fallback: Try to get admin email from email_configurations table
    const { data: emailConfig, error: emailError } = await supabase
      .from('email_configurations')
      .select('reply_to_email, sender_email')
      .eq('is_active', true)
      .single()

    if (!emailError && emailConfig) {
      // Use reply_to_email if available, otherwise sender_email
      const adminEmail = emailConfig.reply_to_email || emailConfig.sender_email
      if (adminEmail && adminEmail !== 'birthday@example.com' && adminEmail !== 'noreply@example.com') {
        console.log(`✅ Found admin email in email_configurations: ${adminEmail}`)
        return adminEmail
      }
    }

    // Last resort: Try to get admin email from environment variable
    const envAdminEmail = process.env.ADMIN_EMAIL
    if (envAdminEmail) {
      console.log(`✅ Using admin email from environment: ${envAdminEmail}`)
      return envAdminEmail
    }

    // If no admin email found anywhere, return null
    console.warn('❌ No admin email found in admin_users, email_configurations, or environment variables')
    return null

  } catch (error) {
    console.error('Error retrieving admin email:', error)
    return null
  }
}
