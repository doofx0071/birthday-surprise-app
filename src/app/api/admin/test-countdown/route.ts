// Admin API for testing countdown and email system with temporary dates
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionFromRequest } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// POST - Set temporary test countdown date
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
    const { testDate, minutesFromNow, resetToOriginal } = body

    if (resetToOriginal) {
      // Reset to original birthday date
      const { error } = await supabase
        .from('system_configurations')
        .update({
          birth_date: '2025-09-08T00:00:00+08:00', // Original date
          updated_at: new Date().toISOString(),
        })
        .eq('is_active', true)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Reset to original birthday date: September 8, 2025',
        newDate: '2025-09-08T00:00:00+08:00',
      })
    }

    let targetDate: string

    if (testDate) {
      // Use provided test date
      targetDate = new Date(testDate).toISOString()
    } else if (minutesFromNow) {
      // Set countdown to complete in X minutes from now
      const futureDate = new Date(Date.now() + (minutesFromNow * 60 * 1000))
      targetDate = futureDate.toISOString()
    } else {
      return NextResponse.json(
        { error: 'Provide either testDate or minutesFromNow' },
        { status: 400 }
      )
    }

    // Update the system configuration with test date
    const { error } = await supabase
      .from('system_configurations')
      .update({
        birth_date: targetDate,
        updated_at: new Date().toISOString(),
      })
      .eq('is_active', true)

    if (error) {
      throw error
    }

    // Also reset email sent status for testing
    await supabase
      .from('system_configurations')
      .update({
        birthday_emails_sent: false,
        birthday_emails_sent_at: null,
      })
      .eq('is_active', true)

    const timeUntilTest = new Date(targetDate).getTime() - Date.now()
    const minutesUntil = Math.round(timeUntilTest / (1000 * 60))

    return NextResponse.json({
      success: true,
      message: `Test countdown set! Emails will trigger in ${minutesUntil} minutes`,
      testDate: targetDate,
      minutesUntilTrigger: minutesUntil,
      cronWillTriggerIn: `${minutesUntil % 15} to ${15 - (minutesUntil % 15)} minutes (next cron cycle)`,
    })

  } catch (error) {
    console.error('Test countdown setup error:', error)
    return NextResponse.json(
      { error: 'Failed to set test countdown' },
      { status: 500 }
    )
  }
}

// GET - Get current countdown status and test info
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

    // Get current system configuration
    const { data: config, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      throw error
    }

    const now = new Date()
    const birthdayDate = new Date(config.birth_date)
    const timeRemaining = birthdayDate.getTime() - now.getTime()
    const isComplete = timeRemaining <= 0

    let timeUntil = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }

    if (!isComplete) {
      timeUntil = {
        days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000),
      }
    }

    // Calculate when next cron job will run
    const minutesSinceHour = now.getMinutes()
    const minutesToNextCron = 15 - (minutesSinceHour % 15)

    return NextResponse.json({
      success: true,
      currentDate: now.toISOString(),
      birthdayDate: config.birth_date,
      birthdayPersonName: config.birthday_person_name,
      timezone: config.timezone,
      timeRemaining: timeUntil,
      isComplete,
      emailsSent: config.birthday_emails_sent || false,
      emailsSentAt: config.birthday_emails_sent_at,
      nextCronRunIn: `${minutesToNextCron} minutes`,
      isOriginalDate: config.birth_date === '2025-09-08T00:00:00+08:00',
    })

  } catch (error) {
    console.error('Test countdown status error:', error)
    return NextResponse.json(
      { error: 'Failed to get countdown status' },
      { status: 500 }
    )
  }
}

// DELETE - Reset email sent status (for re-testing)
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

    // Reset email sent status
    const { error } = await supabase
      .from('system_configurations')
      .update({
        birthday_emails_sent: false,
        birthday_emails_sent_at: null,
      })
      .eq('is_active', true)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent status reset - emails can be triggered again',
    })

  } catch (error) {
    console.error('Reset email status error:', error)
    return NextResponse.json(
      { error: 'Failed to reset email status' },
      { status: 500 }
    )
  }
}
