import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Create a Supabase client for server-side operations
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Verify admin authentication on the server side
 */
export async function verifyAdminAuth() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { isAuthenticated: false, user: null, error: 'Not authenticated' }
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'

    if (!isAdmin) {
      return { isAuthenticated: true, user, error: 'Not authorized' }
    }

    return { isAuthenticated: true, user, error: null }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { isAuthenticated: false, user: null, error: 'Auth verification failed' }
  }
}

/**
 * Require admin authentication - redirect to login if not authenticated
 */
export async function requireAdminAuth() {
  const { isAuthenticated, user, error } = await verifyAdminAuth()

  if (!isAuthenticated || error) {
    redirect('/admin/login')
  }

  return { user }
}

/**
 * Get authenticated admin user or return null
 */
export async function getAdminUser() {
  const { isAuthenticated, user, error } = await verifyAdminAuth()

  if (!isAuthenticated || error) {
    return null
  }

  return user
}
