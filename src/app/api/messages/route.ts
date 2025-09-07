import { NextRequest, NextResponse } from 'next/server'
import { messageFormSchema, type MessageFormData } from '@/lib/validations/message-schema'
import { messageOperations, type MessageInsert, supabase } from '@/lib/supabase'
import { finalizeUploads } from '@/lib/fileUpload'
import { geocodeLocationWithFallback } from '@/lib/geocoding'
import { z } from 'zod'

// Helper function to auto-finalize recent temp files
async function autoFinalizeRecentTempFiles(messageId: string) {
  try {
    console.log(`🤖 Auto-finalizing temp files for message ${messageId}`)

    // Get recent temp directories (last 10 minutes)
    const { data: tempDirs, error: listError } = await supabase.storage
      .from('birthday-media')
      .list('temp', { limit: 5 })

    if (listError || !tempDirs || tempDirs.length === 0) {
      console.log('No temp directories found for auto-finalization')
      return
    }

    // Process the most recent temp directory
    const latestTempDir = tempDirs[0]
    const { data: filesInDir, error: filesError } = await supabase.storage
      .from('birthday-media')
      .list(`temp/${latestTempDir.name}`, { limit: 10 })

    if (filesError || !filesInDir) {
      console.log(`No files found in temp directory ${latestTempDir.name}`)
      return
    }

    // Create temp file data for finalization
    const tempFiles = []

    for (const file of filesInDir) {
      if (file.name.includes('.') && !file.name.includes('thumbnails/')) {
        const tempPath = `temp/${latestTempDir.name}/${file.name}`
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileType = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '') ? 'image' : 'video'

        tempFiles.push({
          tempPath,
          fileInfo: {
            file_name: file.name,
            file_type: fileType,
            file_size: 12345, // Placeholder
          },
          thumbnailUrl: undefined
        })
      }
    }

    if (tempFiles.length > 0) {
      console.log(`🔄 Auto-finalizing ${tempFiles.length} temp files for message ${messageId}`)
      await finalizeUploads(tempFiles, messageId)
      console.log(`✅ Auto-finalized ${tempFiles.length} files for message ${messageId}`)
    }
  } catch (error) {
    console.error('Auto-finalization failed:', error)
  }
}

// Helper function to send pending review email
async function sendPendingReviewEmail(message: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/emails/pending-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contributorName: message.name,
        contributorEmail: message.email,
        messagePreview: message.message,
        girlfriendName: process.env.NEXT_PUBLIC_GIRLFRIEND_NAME,
        websiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      }),
    })

    if (response.ok) {
      console.log(`✅ Pending review email sent to ${message.email}`)
    } else {
      const error = await response.text()
      console.error(`❌ Pending review email failed for ${message.email}:`, error)
    }
  } catch (error) {
    console.error('Pending review email request failed:', error)
  }
}

// Helper function to send admin notification email
async function sendAdminNotificationEmail(message: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/emails/admin-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderName: message.name,
        senderEmail: message.email,
        messagePreview: message.message,
        submissionTime: message.created_at || new Date().toISOString(),
        girlfriendName: process.env.NEXT_PUBLIC_GIRLFRIEND_NAME,
      }),
    })

    if (response.ok) {
      console.log(`✅ Admin notification email sent for message from ${message.name}`)
    } else {
      const error = await response.text()
      console.error(`❌ Admin notification email failed for message from ${message.name}:`, error)
    }
  } catch (error) {
    console.error('Admin notification email request failed:', error)
  }
}

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

    // Process location data if provided but city/country are missing
    let locationCity = messageData.locationCity || ''
    let locationCountry = messageData.locationCountry || ''
    let latitude = messageData.latitude
    let longitude = messageData.longitude

    // If we have a location string but missing city/country or coordinates, try to geocode
    if (messageData.location && (!locationCity || !locationCountry || !latitude || !longitude)) {
      console.log('🌍 Attempting to geocode location:', messageData.location)
      try {
        const geocoded = await geocodeLocationWithFallback(messageData.location)
        if (geocoded) {
          console.log('✅ Geocoding successful:', geocoded)
          locationCity = geocoded.city || locationCity
          locationCountry = geocoded.country || locationCountry
          latitude = geocoded.latitude || latitude
          longitude = geocoded.longitude || longitude
        } else {
          console.log('⚠️ Geocoding returned no results for:', messageData.location)
        }
      } catch (error) {
        console.error('❌ Geocoding failed:', error)
        // Continue without geocoding - not a critical failure
      }
    }

    // Prepare data for database insertion
    const insertData: MessageInsert = {
      name: messageData.name,
      email: messageData.email,
      location: messageData.location, // Legacy field for backward compatibility
      location_city: locationCity,
      location_country: locationCountry,
      latitude: latitude,
      longitude: longitude,
      message: messageData.message,
      wants_reminders: messageData.wantsReminders || false,
      is_approved: false, // Require admin approval
      is_visible: false,  // Hidden until approved
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
      location_city: savedMessage.location_city,
      location_country: savedMessage.location_country,
      messageLength: savedMessage.message.length,
      wantsReminders: savedMessage.wants_reminders,
      isApproved: savedMessage.is_approved,
      isVisible: savedMessage.is_visible,
      createdAt: savedMessage.created_at,
    })

    // Auto-finalize any recent temp files for this message (async, don't wait for completion)
    autoFinalizeRecentTempFiles(savedMessage.id).catch(error => {
      console.error('Failed to auto-finalize temp files:', error)
      // Don't fail the request if finalization fails
    })

    // Send pending review email to user (async, don't wait for completion)
    sendPendingReviewEmail(savedMessage).catch(error => {
      console.error('Failed to send pending review email:', error)
      // Don't fail the request if email fails
    })

    // Send admin notification email (async, don't wait for completion)
    sendAdminNotificationEmail(savedMessage).catch(error => {
      console.error('Failed to send admin notification email:', error)
      // Don't fail the request if email fails
    })

    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: 'Birthday message submitted successfully!',
        data: {
          id: savedMessage.id,
          isApproved: savedMessage.is_approved,
          isVisible: savedMessage.is_visible,
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
      location: msg.location, // Legacy field
      location_city: msg.location_city,
      location_country: msg.location_country,
      latitude: msg.latitude,
      longitude: msg.longitude,
      isApproved: msg.is_approved,
      isVisible: msg.is_visible,
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
 * Delete all messages (admin only - for development/testing purposes)
 */
export async function DELETE(request: NextRequest) {
  try {
    // This would be an admin-only operation in production
    // For now, we'll just return an error as this is dangerous
    return NextResponse.json(
      {
        success: false,
        message: 'Delete all messages is not implemented for safety reasons',
      },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error in DELETE /api/messages:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process delete request',
      },
      { status: 500 }
    )
  }
}

// Helper function to get message statistics (moved to separate utility file)
// This function is now available in src/app/api/admin/messages/stats/route.ts
