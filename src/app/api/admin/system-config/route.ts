import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch system configuration from database
    const { data: config, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // If no config exists, return default values
    if (!config) {
      return NextResponse.json({
        birthdayDate: '',
        birthdayPersonName: '',
        timezone: 'Asia/Manila',
        enableCountdown: true,
        countdownStartDate: '',
        enableEmailNotifications: true,
        requireMessageApproval: true,
        lastUpdated: new Date().toISOString(),
        isConfigured: false,
      })
    }

    return NextResponse.json({
      birthdayDate: config.birth_date,
      birthdayPersonName: config.birthday_person_name,
      timezone: config.timezone,
      enableCountdown: config.enable_countdown,
      countdownStartDate: config.countdown_start_date,
      enableEmailNotifications: config.enable_email_notifications,
      requireMessageApproval: config.require_message_approval,
      lastUpdated: config.updated_at,
      isConfigured: !!(config.birth_date && config.birthday_person_name),
    })
  } catch (error) {
    console.error('Error fetching system config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.birthdayDate || !body.birthdayPersonName) {
      return NextResponse.json(
        { error: 'Birthday date and person name are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const birthdayDate = new Date(body.birthdayDate)
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birthday date format' },
        { status: 400 }
      )
    }

    // Prepare configuration data
    const configData = {
      birth_date: body.birthdayDate,
      birthday_person_name: body.birthdayPersonName,
      timezone: body.timezone || 'Asia/Manila',
      enable_countdown: body.enableCountdown ?? true,
      countdown_start_date: body.countdownStartDate || null,
      enable_email_notifications: body.enableEmailNotifications ?? true,
      require_message_approval: body.requireMessageApproval ?? true,
      is_active: true,
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('system_configurations')
      .select('id')
      .eq('is_active', true)
      .single()

    let result
    if (existingConfig) {
      // Update existing configuration
      result = await supabase
        .from('system_configurations')
        .update(configData)
        .eq('id', existingConfig.id)
        .select()
        .single()
    } else {
      // Insert new configuration
      result = await supabase
        .from('system_configurations')
        .insert(configData)
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    // Log the configuration update
    await supabase.rpc('log_system_event', {
      p_level: 'info',
      p_message: 'System configuration updated',
      p_category: 'configuration',
      p_details: { updated_fields: Object.keys(configData) },
      p_user_id: 'admin', // TODO: Get actual user ID from session
    })

    const config = result.data
    return NextResponse.json({
      birthdayDate: config.birth_date,
      birthdayPersonName: config.birthday_person_name,
      timezone: config.timezone,
      enableCountdown: config.enable_countdown,
      countdownStartDate: config.countdown_start_date,
      enableEmailNotifications: config.enable_email_notifications,
      requireMessageApproval: config.require_message_approval,
      lastUpdated: config.updated_at,
      isConfigured: true,
      message: 'System configuration updated successfully',
    })
  } catch (error) {
    console.error('Error updating system config:', error)

    // Log the error
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_message: 'Failed to update system configuration',
      p_category: 'configuration',
      p_details: { error: error instanceof Error ? error.message : 'Unknown error' },
      p_user_id: 'admin',
    })

    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    )
  }
}
