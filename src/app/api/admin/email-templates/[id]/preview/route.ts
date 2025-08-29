import { NextRequest, NextResponse } from 'next/server'
import { 
  renderEmailTemplate, 
  getEmailTemplate, 
  validateTemplateProps,
  generatePreviewData 
} from '@/lib/email-template-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    // Get template
    const template = getEmailTemplate(id)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Use provided props or generate preview data
    const customProps: Record<string, any> = {}
    template.editableProps.forEach(prop => {
      const value = searchParams.get(prop.key)
      if (value !== null) {
        customProps[prop.key] = prop.type === 'number' ? Number(value) : value
      }
    })

    const previewData = Object.keys(customProps).length > 0 
      ? { ...generatePreviewData(id), ...customProps }
      : generatePreviewData(id)

    // Validate props
    const validation = validateTemplateProps(id, previewData)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid template props', details: validation.errors },
        { status: 400 }
      )
    }

    // Render template
    const html = await renderEmailTemplate(id, previewData)

    return NextResponse.json({
      html,
      props: previewData,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        editableProps: template.editableProps,
      },
    })
  } catch (error) {
    console.error('Error generating template preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get template
    const template = getEmailTemplate(id)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Validate props
    const validation = validateTemplateProps(id, body.props || {})
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid template props', details: validation.errors },
        { status: 400 }
      )
    }

    // Render template with custom props
    const html = await renderEmailTemplate(id, body.props)

    return NextResponse.json({
      html,
      props: body.props,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        editableProps: template.editableProps,
      },
    })
  } catch (error) {
    console.error('Error generating custom template preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    )
  }
}
