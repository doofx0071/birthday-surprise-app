import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // TODO: Get actual user ID from session
    // For now, updating the first admin user
    const { data: adminUser, error: findError } = await supabase
      .from('admin_users')
      .select('id, username')
      .limit(1)
      .single()

    if (findError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if email is already in use by another admin
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .neq('id', adminUser.id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      )
    }

    // Update admin user email
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ email })
      .eq('id', adminUser.id)

    if (updateError) {
      throw updateError
    }

    // Log the email update
    await supabase.rpc('log_system_event', {
      p_level: 'info',
      p_message: 'Admin email updated',
      p_category: 'auth',
      p_details: { 
        user_id: adminUser.id, 
        username: adminUser.username,
        new_email: email 
      },
      p_user_id: adminUser.id,
    })

    return NextResponse.json({
      message: 'Email updated successfully',
      email
    })
  } catch (error) {
    console.error('Error updating email:', error)
    
    // Log the error
    await supabase.rpc('log_system_event', {
      p_level: 'error',
      p_message: 'Failed to update admin email',
      p_category: 'auth',
      p_details: { error: error instanceof Error ? error.message : 'Unknown error' },
    })

    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}
