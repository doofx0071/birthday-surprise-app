import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/admin-auth'

/**
 * GET /api/admin/auth/verify - Verify admin session
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentAdminUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'Not authenticated'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: 'Admin authenticated'
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
