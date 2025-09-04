import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.subject || !body.content) {
      return NextResponse.json(
        { error: 'Name, subject, and content are required' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (body.senderEmail && !emailRegex.test(body.senderEmail)) {
      return NextResponse.json(
        { error: 'Invalid sender email format' },
        { status: 400 }
      )
    }

    // Check if template is a default template (cannot be updated)
    if (id === 'birthday-notification' || id === 'contributor-notification' ||
        id === 'message-pending-review' || id === 'message-approved' || id === 'password-reset') {
      return NextResponse.json(
        { error: 'Default templates cannot be modified' },
        { status: 400 }
      )
    }

    // Update template in database
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        name: body.name,
        subject: body.subject,
        content: body.content,
        sender_name: body.senderName || "Cela's Birthday",
        sender_email: body.senderEmail || 'birthday@example.com',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return NextResponse.json(
        { error: 'Failed to update email template' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Email template updated successfully',
      template: {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        senderName: data.sender_name,
        senderEmail: data.sender_email,
        isDefault: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if template is a default template (cannot be deleted)
    if (id === 'birthday-notification' || id === 'contributor-notification' ||
        id === 'message-pending-review' || id === 'message-approved' || id === 'password-reset') {
      return NextResponse.json(
        { error: 'Default templates cannot be deleted' },
        { status: 400 }
      )
    }

    // Delete template from database
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting template:', error)
      return NextResponse.json(
        { error: 'Failed to delete email template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    )
  }
}
