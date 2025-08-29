#!/usr/bin/env node

/**
 * Test the complete authentication flow
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

async function testAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow...\n')
  
  try {
    // Step 1: Test unauthenticated access to admin
    console.log('1️⃣ Testing unauthenticated access to /admin...')
    const adminResponse = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' })
    console.log(`   Status: ${adminResponse.status}`)
    
    if (adminResponse.status === 307 || adminResponse.status === 302) {
      const location = adminResponse.headers.get('location')
      console.log(`   ✅ Redirected to: ${location}`)
    } else {
      console.log(`   ⚠️  Expected redirect but got status: ${adminResponse.status}`)
    }
    
    // Step 2: Test login
    console.log('\n2️⃣ Testing login...')
    const username = 'admin'
    const password = process.env.ADMIN_PASSWORD || 'CMDPremiums000_!'
    const email = `${username}@admin.local`
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.error('   ❌ Login failed:', loginError.message)
      return
    }

    console.log('   ✅ Login successful!')
    console.log(`   📋 User ID: ${loginData.user.id}`)
    console.log(`   🔑 Role: ${loginData.user.user_metadata?.role}`)
    
    // Step 3: Test authenticated access
    console.log('\n3️⃣ Testing authenticated access...')
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      console.error('   ❌ No access token found')
      return
    }
    
    // Test admin page with auth
    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `sb-access-token=${accessToken}`
    }
    
    const authAdminResponse = await fetch(`${BASE_URL}/admin`, { 
      headers: authHeaders,
      redirect: 'manual' 
    })
    
    console.log(`   Admin page status: ${authAdminResponse.status}`)
    
    if (authAdminResponse.status === 200) {
      console.log('   ✅ Admin page accessible when authenticated')
    } else {
      console.log('   ❌ Admin page not accessible when authenticated')
    }
    
    // Step 4: Test API endpoints
    console.log('\n4️⃣ Testing API endpoints...')
    
    const apiEndpoints = [
      '/api/admin/health/database',
      '/api/admin/health/storage',
      '/api/admin/health/email'
    ]
    
    for (const endpoint of apiEndpoints) {
      const apiResponse = await fetch(`${BASE_URL}${endpoint}`, { 
        headers: authHeaders 
      })
      console.log(`   ${endpoint}: ${apiResponse.status}`)
    }
    
    // Step 5: Test logout
    console.log('\n5️⃣ Testing logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('   ❌ Logout failed:', logoutError.message)
      return
    }
    
    console.log('   ✅ Logout successful!')
    
    // Step 6: Test access after logout
    console.log('\n6️⃣ Testing access after logout...')
    const postLogoutResponse = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' })
    console.log(`   Status: ${postLogoutResponse.status}`)
    
    if (postLogoutResponse.status === 307 || postLogoutResponse.status === 302) {
      console.log('   ✅ Properly redirected to login after logout')
    } else {
      console.log('   ❌ Not redirected to login after logout')
    }
    
    console.log('\n🎉 Authentication flow test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAuthFlow()
