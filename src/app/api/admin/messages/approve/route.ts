import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper function to send approval email
async function sendApprovalEmail(message: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/emails/message-approved`, {
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
        approvedAt: new Date().toLocaleDateString(),
      }),
    })

    if (response.ok) {
      console.log(`✅ Approval email sent to ${message.email}`)
    } else {
      const error = await response.text()
      console.error(`❌ Approval email failed for ${message.email}:`, error)
    }
  } catch (error) {
    console.error('Approval email request failed:', error)
  }
}

// Message approval schema
const approvalSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
  approved: z.boolean(),
  moderatorNotes: z.string().optional(),
})

/**
 * POST /api/admin/messages/approve - Approve or reject a message
 */
export async function POST(request: NextRequest) {
  try {
    // Use cookie-based authentication (same pattern as health endpoints)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Admin approval auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
      userMetadata: user?.user_metadata,
      appMetadata: user?.app_metadata
    })

    if (authError || !user) {
      console.log('Admin approval auth failed - no user:', { authError: authError?.message })
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please log in as admin' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      console.log('Admin approval auth failed - not admin:', {
        userMetadata: user.user_metadata,
        appMetadata: user.app_metadata
      })
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin authentication successful for:', user.email)

    // Parse and validate request body
    const body = await request.json()
    const validationResult = approvalSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { messageId, approved, moderatorNotes } = validationResult.data

    // Update message approval status
    const supabaseAdmin = getSupabaseAdmin()
    const { data: updatedMessage, error } = await supabaseAdmin
      .from('messages')
      .update({
        status: approved ? 'approved' : 'rejected',
        is_approved: approved,
        is_visible: approved, // Only show approved messages publicly
        updated_at: new Date().toISOString(),
        // Add moderator notes if provided (you might need to add this column)
        ...(moderatorNotes && { moderator_notes: moderatorNotes }),
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update message: ${error.message}`,
        },
        { status: 500 }
      )
    }

    if (!updatedMessage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Message not found',
        },
        { status: 404 }
      )
    }

    // Log the approval action (optional - for audit trail)
    console.log(`Message ${messageId} ${approved ? 'approved' : 'rejected'} by admin`)

    // Send approval email if message was approved
    if (approved && updatedMessage.email) {
      sendApprovalEmail(updatedMessage).catch(error => {
        console.error('Failed to send approval email:', error)
        // Don't fail the request if email fails
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: `Message ${approved ? 'approved' : 'rejected'} successfully`,
        data: {
          id: updatedMessage.id,
          approved,
          updatedAt: updatedMessage.updated_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Message approval error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
