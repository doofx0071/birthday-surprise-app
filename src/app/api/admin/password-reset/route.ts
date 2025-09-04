import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import PasswordResetEmail from '@/components/emails/password-reset'
import { emailService } from '@/lib/email/mailtrap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, username, email')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`

    // Send password reset email
    const emailTemplate = PasswordResetEmail({
      adminName: user.username,
      resetLink,
      expirationTime: '1 hour'
    })

    await emailService.sendTemplateEmail(
      email,
      'Password Reset Request - Birthday Surprise Admin',
      emailTemplate,
      {
        category: 'password-reset',
        recipientName: user.username
      }
    )

    // Log the password reset request
    await supabase.rpc('log_system_event', {
      p_level: 'info',
      p_message: 'Password reset requested',
      p_category: 'auth',
      p_details: { email, user_id: user.id },
      p_user_id: user.id,
    })

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    
    // Log the error
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_message: 'Password reset request failed',
      p_category: 'auth',
      p_details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find user by reset token
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, username, email, reset_token_expires')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(user.reset_token_expires)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update user password and clear reset token
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // Log the successful password reset
    await supabase.rpc('log_system_event', {
      p_level: 'info',
      p_message: 'Password reset completed',
      p_category: 'auth',
      p_details: { user_id: user.id, email: user.email },
      p_user_id: user.id,
    })

    return NextResponse.json({
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    
    // Log the error
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_message: 'Password reset failed',
      p_category: 'auth',
      p_details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
