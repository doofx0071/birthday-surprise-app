import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Create admin client to access database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, check if admin_users table exists and get data from it
    let adminUsersTableData = null
    try {
      const { data: adminUsersData, error: adminUsersError } = await supabaseAdmin
        .from('admin_users')
        .select('*')

      if (!adminUsersError) {
        adminUsersTableData = adminUsersData
      } else {
        console.log('admin_users table query error:', adminUsersError.message)
      }
    } catch (tableError) {
      console.log('admin_users table does not exist or is not accessible')
    }

    // Also get Supabase Auth users for comparison
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing auth users:', authError)
    }

    // Filter admin users from auth
    const authAdminUsers = users ? users.filter((user: any) =>
      user.user_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'admin'
    ) : []

    // Return user information (without sensitive data like passwords)
    const authUserInfo = authAdminUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username,
      role: user.user_metadata?.role || user.app_metadata?.role,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }))

    const adminUsersTableInfo = adminUsersTableData ? adminUsersTableData.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Don't include password or sensitive fields
    })) : null

    return NextResponse.json({
      success: true,
      adminUsersTable: {
        exists: adminUsersTableData !== null,
        data: adminUsersTableInfo,
        count: adminUsersTableData ? adminUsersTableData.length : 0
      },
      supabaseAuth: {
        adminUsers: authUserInfo,
        totalUsers: users ? users.length : 0,
        totalAdminUsers: authAdminUsers.length,
      }
    })
  } catch (error) {
    console.error('Check users error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
