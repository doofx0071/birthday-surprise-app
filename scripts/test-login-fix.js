#!/usr/bin/env node

/**
 * Test the login fix
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🧪 Testing Login Fix...\n')
  
  try {
    // Test login with admin credentials
    console.log('1️⃣ Testing login with admin credentials...')
    const username = 'admin'
    const password = process.env.ADMIN_PASSWORD || 'CMDPremiums000_!'
    const email = `${username}@admin.local`
    
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('   ❌ Login failed:', loginError.message)
      return
    }

    console.log('   ✅ Supabase login successful!')
    
    // Check user metadata
    console.log('\n2️⃣ Checking user metadata...')
    const user = loginData.user
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   User Metadata:`, JSON.stringify(user.user_metadata, null, 2))
    console.log(`   App Metadata:`, JSON.stringify(user.app_metadata, null, 2))
    
    // Check admin status
    console.log('\n3️⃣ Checking admin status...')
    const isAdminFromUserMeta = user.user_metadata?.role === 'admin'
    const isAdminFromAppMeta = user.app_metadata?.role === 'admin'
    const isAdmin = isAdminFromUserMeta || isAdminFromAppMeta
    
    console.log(`   Admin from user_metadata: ${isAdminFromUserMeta}`)
    console.log(`   Admin from app_metadata: ${isAdminFromAppMeta}`)
    console.log(`   Overall admin status: ${isAdmin}`)
    
    if (isAdmin) {
      console.log('   ✅ User has admin privileges!')
    } else {
      console.log('   ❌ User does NOT have admin privileges!')
    }
    
    // Test logout
    console.log('\n4️⃣ Testing logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('   ❌ Logout failed:', logoutError.message)
    } else {
      console.log('   ✅ Logout successful!')
    }
    
    console.log('\n🎉 Login test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testLogin()
