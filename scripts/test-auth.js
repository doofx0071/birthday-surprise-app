#!/usr/bin/env node

/**
 * Script to test the Supabase Auth implementation
 * This script tests login, authentication verification, and logout
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

async function testAuthentication() {
  try {
    console.log('🧪 Testing Supabase Auth Implementation...\n')
    
    // Test 1: Login with admin credentials
    console.log('1️⃣ Testing Login...')
    const username = 'admin'
    const password = process.env.ADMIN_PASSWORD || 'CMDPremiums000_!'
    const email = `${username}@admin.local`
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }

    console.log('✅ Login successful!')
    console.log(`📋 User ID: ${loginData.user.id}`)
    console.log(`📧 Email: ${loginData.user.email}`)
    console.log(`👤 Username: ${loginData.user.user_metadata?.username}`)
    console.log(`🔑 Role: ${loginData.user.user_metadata?.role}`)
    
    // Test 2: Verify session
    console.log('\n2️⃣ Testing Session Verification...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !sessionData.session) {
      console.error('❌ Session verification failed:', sessionError?.message || 'No session')
      return
    }
    
    console.log('✅ Session verified!')
    console.log(`🕒 Session expires at: ${new Date(sessionData.session.expires_at * 1000).toLocaleString()}`)
    
    // Test 3: Check admin role
    console.log('\n3️⃣ Testing Admin Role Check...')
    const user = sessionData.session.user
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    
    if (!isAdmin) {
      console.error('❌ User does not have admin role')
      return
    }
    
    console.log('✅ Admin role verified!')
    
    // Test 4: Logout
    console.log('\n4️⃣ Testing Logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message)
      return
    }
    
    console.log('✅ Logout successful!')
    
    // Test 5: Verify session is cleared
    console.log('\n5️⃣ Testing Session Cleared...')
    const { data: postLogoutSession, error: postLogoutError } = await supabase.auth.getSession()
    
    if (postLogoutSession.session) {
      console.error('❌ Session still exists after logout!')
      return
    }
    
    console.log('✅ Session properly cleared!')
    
    console.log('\n🎉 All authentication tests passed!')
    console.log('\n📝 Test Summary:')
    console.log('   ✅ Login with username/password')
    console.log('   ✅ Session verification')
    console.log('   ✅ Admin role check')
    console.log('   ✅ Logout functionality')
    console.log('   ✅ Session invalidation')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the test
testAuthentication()
