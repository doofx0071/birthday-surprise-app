import { NextRequest, NextResponse } from 'next/server'
import { messageFormSchema, type MessageFormData } from '@/lib/validations/message-schema'
import { z } from 'zod'

// In-memory storage for demo purposes
// In production, this would be replaced with a database
let messages: Array<MessageFormData & { id: string; submittedAt: string; isApproved: boolean }> = []

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

    // Generate unique ID and timestamp
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const submittedAt = new Date().toISOString()

    // Create message object
    const newMessage = {
      ...messageData,
      id,
      submittedAt,
      isApproved: true, // Auto-approve for demo purposes
    }

    // Store message (in production, save to database)
    messages.push(newMessage)

    // Log for development
    console.log('New birthday message submitted:', {
      id,
      name: messageData.name,
      email: messageData.email,
      location: messageData.location,
      messageLength: messageData.message.length,
      wantsReminders: messageData.wantsReminders,
      submittedAt,
    })

    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: 'Birthday message submitted successfully!',
        data: {
          id,
          submittedAt,
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
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true'

    // Filter messages based on approval status
    const filteredMessages = includeUnapproved 
      ? messages 
      : messages.filter(msg => msg.isApproved)

    // Sort by submission date (newest first)
    const sortedMessages = filteredMessages.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )

    // Remove sensitive information for public API
    const publicMessages = sortedMessages.map(msg => ({
      id: msg.id,
      name: msg.name,
      message: msg.message,
      location: msg.location,
      detectedLocation: msg.detectedLocation,
      submittedAt: msg.submittedAt,
      // Don't expose email addresses publicly
    }))

    return NextResponse.json(
      {
        success: true,
        data: publicMessages,
        count: publicMessages.length,
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
