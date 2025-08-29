import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI, getCurrentUser, isAdminUser } from '@/lib/supabase-server'

/**
 * GET /api/admin/auth - Check admin authentication status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const isAdmin = await isAdminUser()

    if (!user || !isAdmin) {
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
          username: user.user_metadata?.username || user.email?.split('@')[0],
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
    const supabase = await createSupabaseServerClientForAPI()

    // Sign out from Supabase
    await supabase.auth.signOut()

    return NextResponse.json(
      {
        success: true,
        message: 'Admin logout successful',
      },
      { status: 200 }
    )
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
