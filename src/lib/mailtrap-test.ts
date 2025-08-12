/**
 * Mailtrap Testing and Demo Functions
 * 
 * This file contains functions to test and demonstrate the enhanced Mailtrap integration.
 * Use these functions to verify your Mailtrap configuration is working correctly.
 */

import { 
  testAllConnections, 
  sendEmailSmart, 
  sendBirthdayReminderAPI, 
  sendThankYouEmailAPI 
} from './mailtrap'
import type { EmailTemplateData } from '@/types'

/**
 * Test all Mailtrap connections (SMTP + API)
 */
export async function runConnectionTests() {
  console.log('🧪 Testing Mailtrap connections...')
  
  const results = await testAllConnections()
  
  console.log('📊 Connection Test Results:')
  console.log('SMTP:', results.smtp.success ? '✅ Connected' : '❌ Failed', results.smtp.error || '')
  console.log('API:', results.api.success ? '✅ Connected' : '❌ Failed', results.api.error || '')
  console.log('Overall:', results.overall ? '✅ At least one method works' : '❌ All methods failed')
  
  return results
}

/**
 * Send a test birthday reminder email
 */
export async function sendTestBirthdayEmail(recipientEmail: string) {
  console.log('🎂 Sending test birthday reminder...')
  
  const testData: EmailTemplateData = {
    recipientName: 'Test User',
    girlfriendName: 'Sarah',
    messageCount: 25,
    contributorCount: 15,
    websiteUrl: 'https://birthday-surprise-app.vercel.app',
    unsubscribeUrl: 'https://birthday-surprise-app.vercel.app/unsubscribe',
  }
  
  try {
    // Try the smart sending method (API first, SMTP fallback)
    const result = await sendEmailSmart('birthday', recipientEmail, testData)
    
    console.log('📧 Birthday email result:')
    console.log('Success:', result.success ? '✅' : '❌')
    console.log('Method:', result.method)
    console.log('Message ID:', result.messageId || 'N/A')
    
    return result
  } catch (error) {
    console.error('❌ Failed to send test birthday email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send a test thank you email
 */
export async function sendTestThankYouEmail(recipientEmail: string) {
  console.log('💌 Sending test thank you email...')
  
  const testData: EmailTemplateData = {
    recipientName: 'Test Contributor',
    girlfriendName: 'Sarah',
    messageCount: 25,
    contributorCount: 15,
    websiteUrl: 'https://birthday-surprise-app.vercel.app',
    unsubscribeUrl: 'https://birthday-surprise-app.vercel.app/unsubscribe',
  }
  
  try {
    // Try the smart sending method (API first, SMTP fallback)
    const result = await sendEmailSmart('thank_you', recipientEmail, testData)
    
    console.log('📧 Thank you email result:')
    console.log('Success:', result.success ? '✅' : '❌')
    console.log('Method:', result.method)
    console.log('Message ID:', result.messageId || 'N/A')
    
    return result
  } catch (error) {
    console.error('❌ Failed to send test thank you email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Test API-specific features
 */
export async function testAPIFeatures(recipientEmail: string) {
  console.log('🚀 Testing Mailtrap API features...')
  
  const testData: EmailTemplateData = {
    recipientName: 'API Test User',
    girlfriendName: 'Sarah',
    messageCount: 30,
    contributorCount: 20,
    websiteUrl: 'https://birthday-surprise-app.vercel.app',
    unsubscribeUrl: 'https://birthday-surprise-app.vercel.app/unsubscribe',
  }
  
  try {
    // Test API-specific birthday email with custom variables and categories
    const birthdayResult = await sendBirthdayReminderAPI(recipientEmail, testData)
    
    console.log('🎂 API Birthday Email:')
    console.log('Success:', birthdayResult.success ? '✅' : '❌')
    console.log('Message ID:', birthdayResult.messageId || 'N/A')
    console.log('Full Result:', birthdayResult.result || 'N/A')
    
    // Test API-specific thank you email
    const thankYouResult = await sendThankYouEmailAPI(recipientEmail, testData)
    
    console.log('💌 API Thank You Email:')
    console.log('Success:', thankYouResult.success ? '✅' : '❌')
    console.log('Message ID:', thankYouResult.messageId || 'N/A')
    console.log('Full Result:', thankYouResult.result || 'N/A')
    
    return {
      birthday: birthdayResult,
      thankYou: thankYouResult,
      overall: birthdayResult.success && thankYouResult.success,
    }
  } catch (error) {
    console.error('❌ Failed to test API features:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Complete Mailtrap test suite
 */
export async function runCompleteTestSuite(recipientEmail: string) {
  console.log('🧪 Running complete Mailtrap test suite...')
  console.log('📧 Recipient:', recipientEmail)
  console.log('⏰ Started at:', new Date().toISOString())
  
  const results = {
    connections: await runConnectionTests(),
    birthdayEmail: await sendTestBirthdayEmail(recipientEmail),
    thankYouEmail: await sendTestThankYouEmail(recipientEmail),
    apiFeatures: await testAPIFeatures(recipientEmail),
  }
  
  console.log('📊 Complete Test Results:')
  console.log('Connections:', results.connections.overall ? '✅' : '❌')
  console.log('Birthday Email:', results.birthdayEmail.success ? '✅' : '❌')
  console.log('Thank You Email:', results.thankYouEmail.success ? '✅' : '❌')
  console.log('API Features:', results.apiFeatures.overall ? '✅' : '❌')
  
  const overallSuccess = results.connections.overall && 
                        results.birthdayEmail.success && 
                        results.thankYouEmail.success
  
  console.log('🎯 Overall Result:', overallSuccess ? '✅ ALL TESTS PASSED' : '❌ Some tests failed')
  console.log('⏰ Completed at:', new Date().toISOString())
  
  return {
    ...results,
    overall: overallSuccess,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Quick configuration check
 */
export function checkMailtrapConfig() {
  console.log('🔧 Checking Mailtrap configuration...')
  
  const config = {
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    username: process.env.MAILTRAP_USERNAME,
    password: process.env.MAILTRAP_PASSWORD,
    emailFrom: process.env.EMAIL_FROM,
    apiToken: process.env.MAILTRAP_API_TOKEN,
  }
  
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)
  
  console.log('📋 Configuration Status:')
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}:`, value ? '✅ Set' : '❌ Missing')
  })
  
  if (missing.length === 0) {
    console.log('🎉 All configuration variables are set!')
  } else {
    console.log('⚠️  Missing configuration:', missing.join(', '))
    console.log('💡 Check your .env.local file')
  }
  
  return {
    config,
    missing,
    isComplete: missing.length === 0,
  }
}
