#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 * This script creates an admin user with username-based authentication
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...')
    
    // Admin credentials
    const username = 'admin'
    const password = process.env.ADMIN_PASSWORD || 'CMDPremiums000_!'
    const email = `${username}@admin.local` // Using local domain for username-based auth
    
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Username: ${username}`)
    
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        username,
        role: 'admin',
        full_name: 'Admin User'
      },
      app_metadata: {
        role: 'admin'
      },
      email_confirm: true // Auto-confirm email
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Admin user already exists')
        
        // Update existing user to ensure admin role
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === email)
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                username,
                role: 'admin',
                full_name: 'Admin User'
              },
              app_metadata: {
                role: 'admin'
              }
            }
          )
          
          if (updateError) {
            console.error('❌ Failed to update existing admin user:', updateError.message)
            process.exit(1)
          }
          
          console.log('✅ Updated existing admin user with admin role')
        }
      } else {
        console.error('❌ Failed to create admin user:', error.message)
        process.exit(1)
      }
    } else {
      console.log('✅ Admin user created successfully!')
      console.log(`📋 User ID: ${data.user.id}`)
    }
    
    console.log('\n🎉 Admin setup complete!')
    console.log('\n📝 Login credentials:')
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    console.log('\n🔗 Admin dashboard: http://localhost:3000/admin/login')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the script
createAdminUser()
