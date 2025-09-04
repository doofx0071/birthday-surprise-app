import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (level && level !== 'all') {
      query = query.eq('level', level)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: logs, error, count } = await query

    if (error) {
      throw error
    }

    // Get log statistics
    const { data: stats } = await supabase
      .from('system_logs')
      .select('level')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    const logStats = {
      total: count || 0,
      last24h: stats?.length || 0,
      byLevel: {
        info: stats?.filter(log => log.level === 'info').length || 0,
        warning: stats?.filter(log => log.level === 'warning').length || 0,
        error: stats?.filter(log => log.level === 'error').length || 0,
        debug: stats?.filter(log => log.level === 'debug').length || 0,
      }
    }

    return NextResponse.json({
      logs: logs || [],
      stats: logStats,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Error fetching system logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.level || !body.message) {
      return NextResponse.json(
        { error: 'Level and message are required' },
        { status: 400 }
      )
    }

    // Validate log level
    const validLevels = ['info', 'warning', 'error', 'debug']
    if (!validLevels.includes(body.level)) {
      return NextResponse.json(
        { error: 'Invalid log level' },
        { status: 400 }
      )
    }

    // Create log entry
    const { data: log, error } = await supabase
      .from('system_logs')
      .insert({
        level: body.level,
        message: body.message,
        category: body.category || null,
        details: body.details || null,
        user_id: body.userId || null,
        ip_address: body.ipAddress || null,
        user_agent: body.userAgent || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      log,
      message: 'Log entry created successfully'
    })
  } catch (error) {
    console.error('Error creating log entry:', error)
    return NextResponse.json(
      { error: 'Failed to create log entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Delete logs older than specified days
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const { error, count } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      throw error
    }

    // Log the cleanup action
    await supabase.rpc('log_system_event', {
      p_level: 'info',
      p_message: `Cleaned up ${count || 0} log entries older than ${days} days`,
      p_category: 'maintenance',
      p_details: { deleted_count: count, cutoff_days: days },
      p_user_id: 'system',
    })

    return NextResponse.json({
      message: `Deleted ${count || 0} log entries`,
      deletedCount: count || 0
    })
  } catch (error) {
    console.error('Error cleaning up logs:', error)
    return NextResponse.json(
      { error: 'Failed to clean up logs' },
      { status: 500 }
    )
  }
}
