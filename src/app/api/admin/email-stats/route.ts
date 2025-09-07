import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminToken = request.cookies.get('admin-token')?.value
    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const endDate = new Date()
    let startDate = new Date()

    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    const supabase = createSupabaseClient()

    // Get email statistics from the view
    const { data: statsData, error: statsError } = await supabase
      .from('email_statistics')
      .select('*')
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching email statistics:', statsError)
    }

    // Get events in date range for daily stats
    const { data: events, error: eventsError } = await supabase
      .from('email_events')
      .select('event_type, created_at, category')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (eventsError) {
      console.error('Error fetching email events:', eventsError)
    }

    // Process daily statistics
    const dailyStatsMap = new Map()
    const campaignStatsMap = new Map()

    // Initialize daily stats for the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dailyStatsMap.set(dateKey, {
        date: dateKey,
        sent: 0,
        delivered: 0,
        bounced: 0,
      })
    }

    // Process events
    events?.forEach((event: any) => {
      const dateKey = event.created_at.split('T')[0]
      const dailyStat = dailyStatsMap.get(dateKey)

      if (dailyStat) {
        if (event.event_type === 'delivery') {
          dailyStat.sent += 1
          dailyStat.delivered += 1
        } else if (event.event_type === 'bounce' || event.event_type === 'soft_bounce') {
          dailyStat.sent += 1
          dailyStat.bounced += 1
        }
      }

      // Process campaign stats
      const category = event.category || 'General'
      if (!campaignStatsMap.has(category)) {
        campaignStatsMap.set(category, {
          name: category,
          sent: 0,
          delivered: 0,
          bounceRate: 0,
        })
      }

      const campaignStat = campaignStatsMap.get(category)
      if (event.event_type === 'delivery') {
        campaignStat.sent += 1
        campaignStat.delivered += 1
      } else if (event.event_type === 'bounce' || event.event_type === 'soft_bounce') {
        campaignStat.sent += 1
      }
    })

    // Calculate bounce rates for campaigns
    campaignStatsMap.forEach(campaign => {
      if (campaign.sent > 0) {
        campaign.bounceRate = Math.round(((campaign.sent - campaign.delivered) / campaign.sent) * 100)
      }
    })

    // Convert maps to arrays
    const dailyStats = Array.from(dailyStatsMap.values())
      .map(stat => ({
        ...stat,
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    const campaignStats = Array.from(campaignStatsMap.values())

    // Use real stats if available, otherwise use calculated stats
    const stats = statsData || {
      total_events: events?.length || 0,
      delivered: events?.filter((e: any) => e.event_type === 'delivery').length || 0,
      opened: events?.filter((e: any) => e.event_type === 'open').length || 0,
      clicked: events?.filter((e: any) => e.event_type === 'click').length || 0,
      bounced: events?.filter((e: any) => e.event_type === 'bounce' || e.event_type === 'soft_bounce').length || 0,
      spam: events?.filter((e: any) => e.event_type === 'spam').length || 0,
      unsubscribed: events?.filter((e: any) => e.event_type === 'unsubscribe').length || 0,
      delivery_rate: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
    }

    // Calculate rates if we have data
    const totalSent = stats.delivered + stats.bounced
    if (totalSent > 0) {
      stats.delivery_rate = Math.round((stats.delivered / totalSent) * 100)
      stats.bounce_rate = Math.round((stats.bounced / totalSent) * 100)
    }
    if (stats.delivered > 0) {
      stats.open_rate = Math.round((stats.opened / stats.delivered) * 100)
      stats.click_rate = Math.round((stats.clicked / stats.delivered) * 100)
    }

    const response = {
      totalSent: totalSent,
      delivered: stats.delivered,
      bounced: stats.bounced,
      failed: 0, // We don't track failed separately from bounced
      pending: 0, // Real-time system, no pending
      deliveryRate: stats.delivery_rate,
      bounceRate: stats.bounce_rate,
      openRate: stats.open_rate,
      clickRate: stats.click_rate,
      dailyStats,
      campaignStats,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching email stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email statistics' },
      { status: 500 }
    )
  }
}
