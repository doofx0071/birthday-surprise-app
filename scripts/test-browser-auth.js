#!/usr/bin/env node

/**
 * Test browser authentication flow
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BASE_URL = 'http://localhost:3000'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBrowserAuth() {
  console.log('🧪 Testing Browser Authentication Flow...\n')
  
  try {
    // Step 1: Test login page accessibility
    console.log('1️⃣ Testing login page accessibility...')
    const loginPageResponse = await fetch(`${BASE_URL}/admin/login`)
    console.log(`   Login page status: ${loginPageResponse.status}`)
    
    if (loginPageResponse.status === 200) {
      console.log('   ✅ Login page is accessible')
    } else {
      console.log('   ❌ Login page is not accessible')
      return
    }
    
    // Step 2: Test Supabase authentication
    console.log('\n2️⃣ Testing Supabase authentication...')
    const username = 'admin'
    const password = process.env.ADMIN_PASSWORD || 'CMDPremiums000_!'
    const email = `${username}@admin.local`
    
    // Clear any existing session
    await supabase.auth.signOut()
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('   ❌ Supabase login failed:', loginError.message)
      return
    }

    console.log('   ✅ Supabase login successful!')
    
    // Step 3: Verify admin role
    console.log('\n3️⃣ Verifying admin role...')
    const user = loginData.user
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    
    console.log(`   User metadata role: ${user.user_metadata?.role}`)
    console.log(`   App metadata role: ${user.app_metadata?.role}`)
    console.log(`   Is admin: ${isAdmin}`)
    
    if (isAdmin) {
      console.log('   ✅ User has admin role!')
    } else {
      console.log('   ❌ User does NOT have admin role!')
      return
    }
    
    // Step 4: Test session persistence
    console.log('\n4️⃣ Testing session persistence...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !sessionData.session) {
      console.error('   ❌ Session not found:', sessionError?.message)
      return
    }
    
    console.log('   ✅ Session is persistent!')
    console.log(`   Session expires: ${new Date(sessionData.session.expires_at * 1000).toLocaleString()}`)
    
    // Step 5: Test logout
    console.log('\n5️⃣ Testing logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('   ❌ Logout failed:', logoutError.message)
      return
    }
    
    console.log('   ✅ Logout successful!')
    
    // Step 6: Verify session is cleared
    console.log('\n6️⃣ Verifying session is cleared...')
    const { data: postLogoutSession } = await supabase.auth.getSession()
    
    if (postLogoutSession.session) {
      console.log('   ❌ Session still exists after logout!')
      return
    }
    
    console.log('   ✅ Session properly cleared!')
    
    console.log('\n🎉 All authentication tests passed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Login page accessible')
    console.log('   ✅ Supabase authentication working')
    console.log('   ✅ Admin role verification working')
    console.log('   ✅ Session persistence working')
    console.log('   ✅ Logout working')
    console.log('   ✅ Session cleanup working')
    
    console.log('\n🔑 Login Credentials:')
    console.log(`   URL: ${BASE_URL}/admin/login`)
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testBrowserAuth()
