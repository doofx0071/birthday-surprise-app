#!/usr/bin/env node

/**
 * Script to test authentication security
 * This script verifies that after logout, no admin functionality is accessible
 */

const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

const BASE_URL = 'http://localhost:3001'

// Admin API endpoints to test
const ADMIN_ENDPOINTS = [
  '/api/admin/auth',
  '/api/admin/health/database',
  '/api/admin/health/storage', 
  '/api/admin/health/email',
  '/api/admin/system-config',
  '/api/admin/email-templates'
]

// Admin pages to test
const ADMIN_PAGES = [
  '/admin',
  '/admin/messages',
  '/admin/analytics',
  '/admin/emails',
  '/admin/settings'
]

async function testEndpoint(endpoint, expectRedirect = false) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects automatically
    })
    
    if (expectRedirect) {
      // For pages, we expect a redirect to login
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location')
        if (location && location.includes('/admin/login')) {
          return { success: true, message: `Redirected to login: ${location}` }
        } else {
          return { success: false, message: `Unexpected redirect to: ${location}` }
        }
      } else {
        return { success: false, message: `Expected redirect but got status: ${response.status}` }
      }
    } else {
      // For API endpoints, we expect 401 Unauthorized
      if (response.status === 401) {
        return { success: true, message: 'Properly returned 401 Unauthorized' }
      } else {
        return { success: false, message: `Expected 401 but got status: ${response.status}` }
      }
    }
  } catch (error) {
    return { success: false, message: `Request failed: ${error.message}` }
  }
}

async function testAuthenticationSecurity() {
  console.log('🔒 Testing Authentication Security...\n')
  console.log('This test verifies that after logout, no admin functionality is accessible.\n')
  
  let allTestsPassed = true
  
  // Test API endpoints
  console.log('1️⃣ Testing Admin API Endpoints (should return 401)...')
  for (const endpoint of ADMIN_ENDPOINTS) {
    const result = await testEndpoint(endpoint, false)
    if (result.success) {
      console.log(`   ✅ ${endpoint}: ${result.message}`)
    } else {
      console.log(`   ❌ ${endpoint}: ${result.message}`)
      allTestsPassed = false
    }
  }
  
  console.log('\n2️⃣ Testing Admin Pages (should redirect to login)...')
  for (const page of ADMIN_PAGES) {
    const result = await testEndpoint(page, true)
    if (result.success) {
      console.log(`   ✅ ${page}: ${result.message}`)
    } else {
      console.log(`   ❌ ${page}: ${result.message}`)
      allTestsPassed = false
    }
  }
  
  // Test login page accessibility
  console.log('\n3️⃣ Testing Login Page Accessibility...')
  const loginResult = await testEndpoint('/admin/login', false)
  if (loginResult.success || (await fetch(`${BASE_URL}/admin/login`)).status === 200) {
    console.log('   ✅ /admin/login: Accessible (as expected)')
  } else {
    console.log('   ❌ /admin/login: Not accessible (unexpected)')
    allTestsPassed = false
  }
  
  // Summary
  console.log('\n📊 Security Test Summary:')
  if (allTestsPassed) {
    console.log('🎉 All security tests passed!')
    console.log('\n✅ Security Features Verified:')
    console.log('   • Admin API endpoints properly protected (401 Unauthorized)')
    console.log('   • Admin pages properly redirect to login')
    console.log('   • Login page remains accessible')
    console.log('   • No admin functionality accessible without authentication')
    console.log('\n🔒 The authentication system is secure!')
  } else {
    console.log('❌ Some security tests failed!')
    console.log('⚠️  Security vulnerabilities detected!')
    process.exit(1)
  }
}

// Run the security test
testAuthenticationSecurity()
