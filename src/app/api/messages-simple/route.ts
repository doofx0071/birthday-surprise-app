import { NextRequest, NextResponse } from 'next/server'
import { messageFormSchema, type MessageFormData } from '@/lib/validations/message-schema'
import { messageOperations, type MessageInsert } from '@/lib/supabase'
import { geocodeLocationWithFallback } from '@/lib/geocoding'

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
 * POST /api/messages-simple
 * Submit a new birthday message with direct file upload (no temp storage)
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
          errors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Process location data if provided but city/country are missing
    let locationCity = data.locationCity || ''
    let locationCountry = data.locationCountry || ''
    let latitude = data.latitude
    let longitude = data.longitude

    // If we have a location string but missing city/country or coordinates, try to geocode
    if (data.location && (!locationCity || !locationCountry || !latitude || !longitude)) {
      console.log('🌍 Attempting to geocode location:', data.location)
      try {
        const geocoded = await geocodeLocationWithFallback(data.location)
        if (geocoded) {
          console.log('✅ Geocoding successful:', geocoded)
          locationCity = geocoded.city || locationCity
          locationCountry = geocoded.country || locationCountry
          latitude = geocoded.latitude || latitude
          longitude = geocoded.longitude || longitude
        } else {
          console.log('⚠️ Geocoding returned no results for:', data.location)
        }
      } catch (error) {
        console.error('❌ Geocoding failed:', error)
        // Continue without geocoding - not a critical failure
      }
    }

    // Prepare message data for database
    const messageData: MessageInsert = {
      name: data.name,
      email: data.email,
      message: data.message,
      location: data.location || '',
      location_city: locationCity,
      location_country: locationCountry,
      latitude: latitude,
      longitude: longitude,
      wants_reminders: data.wantsReminders || false,
      is_approved: true, // Auto-approve for now
      is_visible: true,  // Auto-visible for now
      ip_address: ip,
      user_agent: userAgent,
    }

    // Save message to database
    console.log('💾 Saving message to database...')
    const savedMessage = await messageOperations.create(messageData)

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

    // Send success response with message ID for file uploads
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
