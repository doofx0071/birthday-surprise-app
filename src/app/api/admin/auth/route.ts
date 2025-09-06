import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/admin-auth'

/**
 * GET /api/admin/auth - Check admin authentication status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentAdminUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'Not authenticated or not an admin',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        message: 'Admin authenticated',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/auth - Admin logout
 */
export async function DELETE(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Admin logout successful',
      },
      { status: 200 }
    )

    // Clear the admin session cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
