import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface AdminUser {
  id: string
  username: string
  email: string | null
  password: string
  created_at: string
  updated_at: string
}

/**
 * POST /api/admin/auth/login - Admin login with admin_users table
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Create admin client to access database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Query admin_users table
    const { data: adminUsers, error: queryError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1)

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      )
    }

    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const adminUser = adminUsers[0] as AdminUser

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, adminUser.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token for session
    const token = jwt.sign(
      {
        userId: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin'
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin'
      },
      message: 'Login successful'
    })

    // Set secure HTTP-only cookie
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
