import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/messages - Fetch all messages for admin dashboard
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // all, pending, approved, rejected
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('messages')
      .select(`
        *,
        media_files (*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.eq('status', 'pending')
      } else if (status === 'approved') {
        query = query.eq('status', 'approved')
      } else if (status === 'rejected') {
        query = query.eq('status', 'rejected')
      }
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`)
    }

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Database error fetching messages:', error)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch messages: ${error.message}`,
        },
        { status: 500 }
      )
    }

    // Transform messages to include proper status
    const transformedMessages = (messages || []).map((message: any) => ({
      ...message,
      status: message.status || (message.is_approved === true ? 'approved' : 
               message.is_approved === false ? 'rejected' : 'pending'),
      media_files: message.media_files || []
    }))

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json(
      {
        success: true,
        data: transformedMessages,
        pagination: {
          total: totalCount || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (totalCount || 0)
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in admin messages API:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
