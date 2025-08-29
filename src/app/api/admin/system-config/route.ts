import { NextRequest, NextResponse } from 'next/server'
import { envManager } from '@/lib/env-manager'

export async function GET() {
  try {
    const config = envManager.getSystemConfig()
    
    return NextResponse.json({
      ...config,
      lastUpdated: new Date().toISOString(),
      isConfigured: !!(config.birthdayDate && config.birthdayPersonName),
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

    // Update environment variables
    const success = envManager.updateSystemConfig({
      birthdayDate: body.birthdayDate,
      birthdayPersonName: body.birthdayPersonName,
      timezone: body.timezone || 'Asia/Manila',
      countdownStartDate: body.countdownStartDate || '',
      enableCountdown: body.enableCountdown ?? true,
      enableEmailNotifications: body.enableEmailNotifications ?? true,
      enableMessageApproval: body.enableMessageApproval ?? true,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update system configuration' },
        { status: 500 }
      )
    }

    // Return updated configuration
    const updatedConfig = envManager.getSystemConfig()
    
    return NextResponse.json({
      ...updatedConfig,
      lastUpdated: new Date().toISOString(),
      isConfigured: true,
      message: 'System configuration updated successfully',
    })
  } catch (error) {
    console.error('Error updating system config:', error)
    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    )
  }
}
