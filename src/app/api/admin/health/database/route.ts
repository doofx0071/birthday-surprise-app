import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentAdminUser } from '@/lib/admin-auth'

/**
 * GET /api/admin/health/database - Check database health
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

    // Create admin Supabase client for database operations
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

    // Perform database health check
    const startTime = Date.now()
    
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: `Database error: ${error.message}`,
          responseTime,
        },
        { status: 500 }
      )
    }

    // Check response time
    let status = 'healthy'
    let message = 'Database connection healthy'

    if (responseTime > 2000) {
      status = 'warning'
      message = `Database responding slowly (${responseTime}ms)`
    } else if (responseTime > 5000) {
      status = 'error'
      message = `Database response time critical (${responseTime}ms)`
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
    console.error('Database health check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Database health check failed',
        error: String(error),
      },
      { status: 500 }
    )
  }
}
