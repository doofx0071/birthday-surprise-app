import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format, dateRange, customDateRange } = body

    // Calculate date range
    let startDate: Date
    let endDate = new Date()

    if (dateRange === 'custom' && customDateRange?.start && customDateRange?.end) {
      startDate = new Date(customDateRange.start)
      endDate = new Date(customDateRange.end)
    } else {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    const supabase = createSupabaseClient()

    // Fetch analytics data with media files
    const [
      { data: messages, error: messagesError },
      { data: mediaFiles, error: mediaError }
    ] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),

      supabase
        .from('media_files')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
    ])

    if (messagesError) {
      console.error('Error fetching messages for export:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    if (mediaError) {
      console.error('Error fetching media files for export:', mediaError)
    }

    if (format === 'csv') {
      // Generate CSV with current schema
      const csvHeaders = [
        'Date',
        'Message ID',
        'Sender Name',
        'Sender Email',
        'Message Content',
        'Status',
        'Wants Reminders',
        'Location',
        'Media Files Count',
        'Created At',
        'Updated At'
      ]

      // Create a map of message IDs to media file counts
      const mediaCountMap = new Map<string, number>()
      mediaFiles?.forEach((file: any) => {
        const count = mediaCountMap.get(file.message_id) || 0
        mediaCountMap.set(file.message_id, count + 1)
      })

      const csvRows = (messages || []).map((message: any) => [
        new Date(message.created_at).toLocaleDateString(),
        message.id,
        message.name || '',
        message.email || '',
        `"${(message.message || '').replace(/"/g, '""')}"`,
        message.status || 'pending',
        message.wants_reminders ? 'Yes' : 'No',
        message.location || '',
        mediaCountMap.get(message.id) || 0,
        message.created_at,
        message.updated_at || message.created_at
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-report-${dateRange}.csv"`,
        },
      })
    } else if (format === 'pdf') {
      // Calculate comprehensive statistics
      const totalMessages = messages?.length || 0
      const approvedMessages = messages?.filter((m: any) => m.status === 'approved').length || 0
      const pendingMessages = messages?.filter((m: any) => m.status === 'pending').length || 0
      const rejectedMessages = messages?.filter((m: any) => m.status === 'rejected').length || 0
      const withReminders = messages?.filter((m: any) => m.wants_reminders).length || 0
      const totalMediaFiles = mediaFiles?.length || 0

      // Geographic distribution
      const locationMap = new Map<string, number>()
      messages?.forEach((message: any) => {
        if (message.location) {
          const parts = message.location.split(',')
          const country = parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown'
          locationMap.set(country, (locationMap.get(country) || 0) + 1)
        }
      })

      // Media statistics
      const imageFiles = mediaFiles?.filter((f: any) => f.file_type === 'image' || f.file_type?.startsWith('image/')).length || 0
      const videoFiles = mediaFiles?.filter((f: any) => f.file_type === 'video' || f.file_type?.startsWith('video/')).length || 0
      const totalSize = mediaFiles?.reduce((sum: number, file: any) => sum + (file.file_size || 0), 0) || 0

      const reportContent = `
BIRTHDAY SURPRISE - ANALYTICS REPORT
=====================================

Generated: ${new Date().toLocaleString()}
Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
Date Range: ${dateRange.toUpperCase()}

EXECUTIVE SUMMARY
=================
Total Messages: ${totalMessages}
Approved Messages: ${approvedMessages} (${totalMessages > 0 ? Math.round((approvedMessages / totalMessages) * 100) : 0}%)
Pending Review: ${pendingMessages} (${totalMessages > 0 ? Math.round((pendingMessages / totalMessages) * 100) : 0}%)
Rejected Messages: ${rejectedMessages} (${totalMessages > 0 ? Math.round((rejectedMessages / totalMessages) * 100) : 0}%)
Want Reminders: ${withReminders} (${totalMessages > 0 ? Math.round((withReminders / totalMessages) * 100) : 0}%)

MEDIA STATISTICS
================
Total Media Files: ${totalMediaFiles}
Image Files: ${imageFiles}
Video Files: ${videoFiles}
Total Storage Used: ${(totalSize / (1024 * 1024)).toFixed(2)} MB

GEOGRAPHIC DISTRIBUTION
=======================
${Array.from(locationMap.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([country, count]) => `${country}: ${count} messages`)
  .join('\n')}

RECENT MESSAGES
===============
${(messages || []).slice(0, 10).map((m: any) => `
Date: ${new Date(m.created_at).toLocaleDateString()}
From: ${m.name || 'Anonymous'} (${m.email || 'No email'})
Status: ${m.status?.toUpperCase() || 'PENDING'}
Location: ${m.location || 'Not specified'}
Content: ${(m.message || '').substring(0, 150)}${(m.message || '').length > 150 ? '...' : ''}
${'-'.repeat(80)}
`).join('')}

ENGAGEMENT METRICS
==================
Approval Rate: ${totalMessages > 0 ? Math.round((approvedMessages / totalMessages) * 100) : 0}%
Response Rate: ${totalMessages > 0 ? Math.round(((approvedMessages + rejectedMessages) / totalMessages) * 100) : 0}%
Reminder Engagement: ${totalMessages > 0 ? Math.round((withReminders / totalMessages) * 100) : 0}%
Media Attachment Rate: ${totalMessages > 0 ? Math.round((mediaFiles?.filter((f: any) => messages?.some((m: any) => m.id === f.message_id)).length || 0) / totalMessages * 100) : 0}%

Report generated by Birthday Surprise Admin Dashboard
      `.trim()

      return new NextResponse(reportContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="analytics-report-${dateRange}.txt"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format specified' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}
