import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/email-config - Get email configuration from database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the active email configuration
    const { data, error } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // Return default values if no configuration exists
    const config = data || {
      id: null,
      sender_name: "Cela's Birthday",
      sender_email: '',
      reply_to_email: '',
      webhook_url: '',
      webhook_secret: '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      id: config.id,
      senderName: config.sender_name,
      senderEmail: config.sender_email,
      replyToEmail: config.reply_to_email,
      webhookUrl: config.webhook_url,
      webhookSecret: config.webhook_secret ? '••••••••' : '',
      isActive: config.is_active,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    })
  } catch (error) {
    console.error('Failed to get email config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get email configuration' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/email-config - Update email configuration in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.senderName || !body.senderEmail) {
      return NextResponse.json(
        { success: false, message: 'Sender name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.senderEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sender email format' },
        { status: 400 }
      )
    }

    if (body.replyToEmail && !emailRegex.test(body.replyToEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reply-to email format' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Prepare update data
    const updateData = {
      sender_name: body.senderName,
      sender_email: body.senderEmail,
      reply_to_email: body.replyToEmail || '',
      webhook_url: body.webhookUrl || '',
      webhook_secret: body.webhookSecret && body.webhookSecret !== '••••••••' ? body.webhookSecret : undefined,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Check if configuration exists
    const { data: existingConfig } = await supabase
      .from('email_configurations')
      .select('id')
      .eq('is_active', true)
      .single()

    let result
    if (existingConfig) {
      // Update existing configuration
      result = await supabase
        .from('email_configurations')
        .update(updateData)
        .eq('id', existingConfig.id)
        .select()
        .single()
    } else {
      // Create new configuration
      result = await supabase
        .from('email_configurations')
        .insert({
          ...updateData,
          is_active: true,
        })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    const config = result.data

    return NextResponse.json({
      success: true,
      message: 'Email configuration updated successfully',
      id: config.id,
      senderName: config.sender_name,
      senderEmail: config.sender_email,
      replyToEmail: config.reply_to_email,
      webhookUrl: config.webhook_url,
      webhookSecret: config.webhook_secret ? '••••••••' : '',
      isActive: config.is_active,
      updatedAt: config.updated_at,
    })
  } catch (error) {
    console.error('Error updating email config:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update email configuration' },
      { status: 500 }
    )
  }
}
