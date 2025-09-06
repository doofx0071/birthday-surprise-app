// Admin API endpoint for monitoring email queue
import { NextRequest, NextResponse } from 'next/server'
import { emailQueue } from '@/lib/email/queue'
import { verifyAdminSessionFromRequest } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// GET - Get email queue status and recent items
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const status = url.searchParams.get('status') // pending, processing, sent, failed
    const priority = url.searchParams.get('priority') // high, normal, low

    // Get queue statistics
    const stats = await emailQueue.getQueueStats()

    // Get recent queue items
    let query = supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: queueItems, error } = await query

    if (error) {
      console.error('Failed to fetch queue items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch queue data' },
        { status: 500 }
      )
    }

    // Get processing summary for last 24 hours
    const { data: recentActivity, error: activityError } = await supabase
      .from('email_queue')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const activityStats = {
      last24Hours: {
        total: recentActivity?.length || 0,
        sent: recentActivity?.filter(item => item.status === 'sent').length || 0,
        failed: recentActivity?.filter(item => item.status === 'failed').length || 0,
        pending: recentActivity?.filter(item => item.status === 'pending').length || 0,
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      activityStats,
      queueItems: queueItems?.map(item => ({
        id: item.id,
        to: item.to_email,
        subject: item.subject,
        templateName: item.template_name,
        priority: item.priority,
        status: item.status,
        attempts: item.attempts,
        maxAttempts: item.max_attempts,
        scheduledFor: item.scheduled_for,
        createdAt: item.created_at,
        sentAt: item.sent_at,
        error: item.error,
      })) || [],
    })

  } catch (error) {
    console.error('Email queue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add email to queue manually (admin testing)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      to, 
      subject, 
      templateName, 
      templateData, 
      priority = 'normal',
      scheduledFor 
    } = body

    if (!to || !subject || !templateName || !templateData) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, templateName, templateData' },
        { status: 400 }
      )
    }

    const queueId = await emailQueue.addToQueue(
      to,
      subject,
      templateName,
      templateData,
      {
        priority,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      }
    )

    return NextResponse.json({
      success: true,
      queueId,
      message: 'Email added to queue successfully',
    })

  } catch (error) {
    console.error('Failed to add email to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add email to queue' },
      { status: 500 }
    )
  }
}

// DELETE - Clean up old processed emails
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const olderThanDays = parseInt(url.searchParams.get('olderThanDays') || '30')

    // Call the cleanup function
    const { data, error } = await supabase
      .rpc('cleanup_old_email_queue')

    if (error) {
      console.error('Failed to cleanup email queue:', error)
      return NextResponse.json(
        { error: 'Failed to cleanup email queue' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deletedCount: data,
      message: `Cleaned up ${data} old email records`,
    })

  } catch (error) {
    console.error('Email queue cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Retry failed emails
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSessionFromRequest(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emailIds, resetAttempts = false } = body

    if (!emailIds || !Array.isArray(emailIds)) {
      return NextResponse.json(
        { error: 'emailIds array is required' },
        { status: 400 }
      )
    }

    // Reset failed emails to pending status
    const updateData: any = { status: 'pending' }
    if (resetAttempts) {
      updateData.attempts = 0
      updateData.error = null
    }

    const { data, error } = await supabase
      .from('email_queue')
      .update(updateData)
      .in('id', emailIds)
      .eq('status', 'failed')

    if (error) {
      console.error('Failed to retry emails:', error)
      return NextResponse.json(
        { error: 'Failed to retry emails' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${emailIds.length} emails marked for retry`,
    })

  } catch (error) {
    console.error('Email retry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
