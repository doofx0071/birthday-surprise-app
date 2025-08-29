import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  getAllEmailTemplates,
  renderEmailTemplate,
  generatePreviewData
} from '@/lib/email-template-renderer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePreview = searchParams.get('preview') === 'true'

    // Get React-based templates
    const reactTemplates = getAllEmailTemplates()

    // Get custom templates from database
    const { data: customTemplates, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom templates:', error)
    }

    // Convert React templates to API format
    const formattedReactTemplates = await Promise.all(
      reactTemplates.map(async (template) => {
        let htmlContent = ''
        let previewHtml = ''

        if (includePreview) {
          try {
            const previewData = generatePreviewData(template.id)
            htmlContent = await renderEmailTemplate(template.id, previewData)
            previewHtml = htmlContent
          } catch (error) {
            console.error(`Error rendering template ${template.id}:`, error)
          }
        }

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          subject: `🎉 ${template.name}`,
          senderName: "Cela's Birthday",
          senderEmail: 'birthday@example.com',
          isDefault: true,
          isReactTemplate: true,
          editableProps: template.editableProps,
          defaultProps: template.defaultProps,
          content: htmlContent,
          previewHtml,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
    )

    // Format custom templates
    const formattedCustomTemplates = (customTemplates || []).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: template.content,
      senderName: template.sender_name,
      senderEmail: template.sender_email,
      isDefault: false,
      isReactTemplate: false,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    }))

    const allTemplates = [...formattedReactTemplates, ...formattedCustomTemplates]

    return NextResponse.json({ templates: allTemplates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Insert new template into database
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: body.name,
        subject: body.subject,
        content: body.content,
        sender_name: body.senderName || "Cela's Birthday",
        sender_email: body.senderEmail || 'birthday@example.com',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json(
        { error: 'Failed to create email template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email template created successfully',
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
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    )
  }
}
