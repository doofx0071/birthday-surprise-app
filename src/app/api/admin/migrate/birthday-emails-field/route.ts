import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/admin/migrate/birthday-emails-field - Add birthday_emails_sent field to system_configurations table
 */
export async function POST() {
  try {
    console.log('🔄 Starting migration: Add birthday_emails_sent field...')

    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if the field already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'system_configurations')
      .eq('column_name', 'birthday_emails_sent')

    if (columnsError) {
      console.error('Error checking columns:', columnsError)
    }

    if (columns && columns.length > 0) {
      console.log('✅ birthday_emails_sent field already exists')
      return NextResponse.json({
        success: true,
        message: 'Migration skipped: birthday_emails_sent field already exists',
        timestamp: new Date().toISOString(),
      })
    }

    // Since we can't use DDL directly, let's try a different approach
    // We'll manually add the field using a direct SQL query
    console.log('⚠️ Cannot add columns via API. Please run the migration manually in Supabase SQL Editor.')

    return NextResponse.json({
      success: false,
      error: 'Manual migration required',
      message: 'Please run the following SQL in Supabase SQL Editor:',
      sql: `
        ALTER TABLE system_configurations
        ADD COLUMN IF NOT EXISTS birthday_emails_sent BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS birthday_emails_sent_at TIMESTAMP WITH TIME ZONE;

        CREATE INDEX IF NOT EXISTS idx_system_configurations_birthday_emails_sent
        ON system_configurations(birthday_emails_sent);
      `,
      timestamp: new Date().toISOString(),
    }, { status: 400 })

    // Log the migration
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Migration completed: Added birthday_emails_sent field',
      details: {
        action: 'migrate_birthday_emails_field',
        timestamp: new Date().toISOString(),
      }
    })

    console.log('✅ Migration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Migration completed: birthday_emails_sent field added to system_configurations table',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Migration failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
