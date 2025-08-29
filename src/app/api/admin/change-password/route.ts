import { NextRequest, NextResponse } from 'next/server'
import { envManager } from '@/lib/env-manager'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Get current password from environment
    const currentHashedPassword = envManager.getEnvVariable('ADMIN_PASSWORD')
    
    if (!currentHashedPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, currentHashedPassword)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const saltRounds = 12
    const newHashedPassword = await bcrypt.hash(body.newPassword, saltRounds)

    // Update password in environment variables
    const success = envManager.setEnvVariable('ADMIN_PASSWORD', newHashedPassword)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Log the password change
    try {
      await fetch(`${request.nextUrl.origin}/api/admin/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: 'info',
          category: 'auth',
          message: 'Admin password changed successfully',
          details: 'Password was updated via admin panel',
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
        }),
      })
    } catch (logError) {
      console.error('Failed to log password change:', logError)
    }

    return NextResponse.json({
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
