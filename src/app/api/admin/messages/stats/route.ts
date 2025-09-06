import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all messages with their media files
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        is_approved,
        status,
        location_country,
        media_files (
          id
        )
      `)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total: messages?.length || 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      withMedia: 0,
      countries: 0,
    }

    const uniqueCountries = new Set<string>()

    messages?.forEach(message => {
      // Count by approval status
      if (message.is_approved === true) {
        stats.approved++
      } else if (message.is_approved === false) {
        stats.rejected++
      } else {
        stats.pending++
      }

      // Count messages with media
      if (message.media_files && message.media_files.length > 0) {
        stats.withMedia++
      }

      // Count unique countries
      if (message.location_country) {
        uniqueCountries.add(message.location_country)
      }
    })

    stats.countries = uniqueCountries.size

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in message stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
