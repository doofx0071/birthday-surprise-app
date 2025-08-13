import { NextRequest, NextResponse } from 'next/server'
import { messageFormSchema, type MessageFormData } from '@/lib/validations/message-schema'
import { messageOperations, type MessageInsert } from '@/lib/supabase'
import { z } from 'zod'

/**
 * POST /api/messages
 * Submit a new birthday message
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate the data using Zod schema
    const validationResult = messageFormSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const messageData = validationResult.data

    // Get client IP and user agent for security/analytics
    const ip = request.ip ||
               request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Prepare data for database insertion
    const insertData: MessageInsert = {
      name: messageData.name,
      email: messageData.email,
      location: messageData.location,
      message: messageData.message,
      wants_reminders: messageData.wantsReminders || false,
      ip_address: ip,
      user_agent: userAgent,
    }

    // Save to database
    const savedMessage = await messageOperations.create(insertData)

    // Log for development
    console.log('New birthday message submitted:', {
      id: savedMessage.id,
      name: savedMessage.name,
      email: savedMessage.email,
      location: savedMessage.location,
      messageLength: savedMessage.message.length,
      wantsReminders: savedMessage.wants_reminders,
      status: savedMessage.status,
      createdAt: savedMessage.created_at,
    })

    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: 'Birthday message submitted successfully!',
        data: {
          id: savedMessage.id,
          status: savedMessage.status,
          submittedAt: savedMessage.created_at,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error submitting birthday message:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/messages
 * Retrieve all approved birthday messages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'

    // Get messages from database
    const messages = includeAll
      ? await messageOperations.getApproved() // For now, only return approved messages
      : await messageOperations.getApproved()

    // Remove sensitive information for public API
    const publicMessages = messages.map(msg => ({
      id: msg.id,
      name: msg.name,
      message: msg.message,
      location: msg.location,
      status: msg.status,
      submittedAt: msg.created_at,
      // Don't expose email addresses, IP addresses, or user agents publicly
    }))

    return NextResponse.json(
      {
        success: true,
        data: publicMessages,
        count: publicMessages.length,
        total: messages.length,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error retrieving birthday messages:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve messages',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/messages
 * Clear all messages (for development/testing purposes)
 */
export async function DELETE(request: NextRequest) {
  try {
    const previousCount = messages.length
    messages = []

    console.log(`Cleared ${previousCount} birthday messages`)

    return NextResponse.json(
      {
        success: true,
        message: `Cleared ${previousCount} messages`,
        data: {
          previousCount,
          currentCount: 0,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error clearing birthday messages:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear messages',
      },
      { status: 500 }
    )
  }
}

// Export the current messages for server-side access
export function getStoredMessages() {
  return messages.filter(msg => msg.isApproved)
}

// Helper function to get message statistics
export function getMessageStats() {
  return {
    total: messages.length,
    approved: messages.filter(msg => msg.isApproved).length,
    withLocation: messages.filter(msg => msg.location || msg.detectedLocation).length,
    wantsReminders: messages.filter(msg => msg.wantsReminders).length,
  }
}
