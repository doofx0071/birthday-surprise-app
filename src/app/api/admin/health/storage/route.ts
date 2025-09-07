import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentAdminUser } from '@/lib/admin-auth'

/**
 * GET /api/admin/health/storage - Check storage health
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using custom JWT system
    const adminUser = await getCurrentAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create admin Supabase client for storage operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

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
