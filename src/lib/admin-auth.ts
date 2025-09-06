import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const jwtSecret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface AdminUser {
  id: string
  username: string
  email: string | null
  role: 'admin'
}

export interface AdminSession {
  userId: string
  username: string
  email: string | null
  role: 'admin'
  iat: number
  exp: number
}

/**
 * Verify admin session token
 */
export async function verifyAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-session')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as AdminSession

    // Additional verification: check if user still exists in admin_users table
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email')
      .eq('id', decoded.userId)
      .single()

    if (error || !adminUser) {
      return null
    }

    return {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: 'admin'
    }

  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

/**
 * Get current admin user from session
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  return await verifyAdminSession()
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentAdminUser()
  return user !== null && user.role === 'admin'
}

/**
 * Verify admin session from request (for API routes)
 */
export function verifyAdminSessionFromRequest(request: Request): AdminUser | null {
  try {
    // Get token from cookie header
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
      return null
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies['admin-session']
    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as AdminSession

    return {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: 'admin'
    }

  } catch (error) {
    console.error('Request session verification error:', error)
    return null
  }
}
