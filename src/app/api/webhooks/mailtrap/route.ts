import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

interface MailtrapWebhookEvent {
  event: string
  timestamp: number
  sending_stream: string
  category?: string
  custom_variables?: Record<string, string | number | boolean>
  message_id: string
  email: string
  event_id: string
  sending_domain_name: string
  reason?: string
  response?: string
  response_code?: number
  bounce_category?: string
  ip?: string
  user_agent?: string
  url?: string
}

interface MailtrapWebhookPayload {
  events: MailtrapWebhookEvent[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MailtrapWebhookPayload
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Process each event
    for (const event of body.events) {
      try {
        // Insert event into database
        const { error } = await supabase
          .from('email_events')
          .insert({
            event_id: event.event_id,
            event_type: event.event,
            message_id: event.message_id,
            email: event.email,
            timestamp: event.timestamp,
            sending_stream: event.sending_stream,
            category: event.category,
            custom_variables: event.custom_variables,
            sending_domain_name: event.sending_domain_name,
            reason: event.reason,
            response: event.response,
            response_code: event.response_code,
            bounce_category: event.bounce_category,
            ip_address: event.ip,
            user_agent: event.user_agent,
            url: event.url,
          })

        if (error) {
          console.error('Error inserting email event:', error)
          // Continue processing other events even if one fails
        }
      } catch (eventError) {
        console.error('Error processing individual event:', eventError)
        // Continue processing other events
      }
    }

    return NextResponse.json({ success: true, processed: body.events.length })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle JSON Lines format as well
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text()
    const lines = body.trim().split('\n')
    
    const supabase = createSupabaseClient()
    let processed = 0

    for (const line of lines) {
      try {
        const event = JSON.parse(line) as MailtrapWebhookEvent
        
        // Insert event into database
        const { error } = await supabase
          .from('email_events')
          .insert({
            event_id: event.event_id,
            event_type: event.event,
            message_id: event.message_id,
            email: event.email,
            timestamp: event.timestamp,
            sending_stream: event.sending_stream,
            category: event.category,
            custom_variables: event.custom_variables,
            sending_domain_name: event.sending_domain_name,
            reason: event.reason,
            response: event.response,
            response_code: event.response_code,
            bounce_category: event.bounce_category,
            ip_address: event.ip,
            user_agent: event.user_agent,
            url: event.url,
          })

        if (!error) {
          processed++
        } else {
          console.error('Error inserting email event:', error)
        }
      } catch (lineError) {
        console.error('Error processing line:', lineError)
        // Continue processing other lines
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (error) {
    console.error('JSON Lines webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
