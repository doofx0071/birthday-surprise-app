import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/health/storage - Check storage health
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Perform storage health check
    const startTime = Date.now()
    
    // Check if storage bucket exists and is accessible
    const { data, error } = await supabase.storage
      .from('birthday-media')
      .list('', { limit: 1 })

    const responseTime = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Storage error: ${error.message}`,
          responseTime,
        },
        { status: 500 }
      )
    }

    // Check response time
    let status = 'healthy'
    let message = 'Storage service operational'

    if (responseTime > 3000) {
      status = 'warning'
      message = `Storage responding slowly (${responseTime}ms)`
    } else if (responseTime > 6000) {
      status = 'error'
      message = `Storage response time critical (${responseTime}ms)`
    }

    return NextResponse.json(
      {
        success: true,
        status,
        message,
        responseTime,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Storage health check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Storage health check failed',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
