import React from 'react'
import { render } from '@react-email/render'
import { BirthdayNotificationEmail } from '@/components/emails/BirthdayNotification'
import { ContributorNotificationEmail } from '@/components/emails/ContributorNotification'
import { MessagePendingReview } from '@/components/emails/message-pending-review'
import { MessageApproved } from '@/components/emails/message-approved'

export interface EmailTemplateData {
  id: string
  name: string
  description: string
  component: React.ComponentType<any>
  defaultProps: Record<string, any>
  editableProps: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'url' | 'email'
    required?: boolean
  }>
}

// Define your React email templates
export const emailTemplates: EmailTemplateData[] = [
  {
    id: 'birthday-notification',
    name: 'Birthday Notification',
    description: 'Main birthday notification email sent to the birthday person',
    component: BirthdayNotificationEmail,
    defaultProps: {
      recipientName: 'Gracela Elmera C. Betarmos',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      messageCount: 25,
      contributorCount: 15,
      locationCount: 8,
      websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
      previewText: 'Your special day has arrived! See all the love waiting for you...',
    },
    editableProps: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
      { key: 'girlfriendName', label: 'Birthday Person Name', type: 'text', required: true },
      { key: 'messageCount', label: 'Message Count', type: 'number' },
      { key: 'contributorCount', label: 'Contributor Count', type: 'number' },
      { key: 'locationCount', label: 'Location Count', type: 'number' },
      { key: 'websiteUrl', label: 'Website URL', type: 'url', required: true },
      { key: 'previewText', label: 'Preview Text', type: 'text' },
    ],
  },
  {
    id: 'contributor-notification',
    name: 'Contributor Notification',
    description: 'Thank you email sent to people who contributed messages',
    component: ContributorNotificationEmail,
    defaultProps: {
      recipientName: 'Friend',
      contributorName: 'Friend',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      messageCount: 25,
      contributorCount: 15,
      locationCount: 8,
      websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
      previewText: "Today is Gracela's birthday! See all the love you helped create...",
    },
    editableProps: [
      { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
      { key: 'contributorName', label: 'Contributor Name', type: 'text', required: true },
      { key: 'girlfriendName', label: 'Birthday Person Name', type: 'text', required: true },
      { key: 'messageCount', label: 'Message Count', type: 'number' },
      { key: 'contributorCount', label: 'Contributor Count', type: 'number' },
      { key: 'locationCount', label: 'Location Count', type: 'number' },
      { key: 'websiteUrl', label: 'Website URL', type: 'url', required: true },
      { key: 'previewText', label: 'Preview Text', type: 'text' },
    ],
  },
  {
    id: 'message-pending-review',
    name: 'Message Pending Review',
    description: 'Email sent when user submits a message for review',
    component: MessagePendingReview,
    defaultProps: {
      contributorName: 'Friend',
      contributorEmail: 'friend@example.com',
      messagePreview: 'Thank you for your heartfelt birthday message!',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
    },
    editableProps: [
      { key: 'contributorName', label: 'Contributor Name', type: 'text', required: true },
      { key: 'contributorEmail', label: 'Contributor Email', type: 'email', required: true },
      { key: 'messagePreview', label: 'Message Preview', type: 'text', required: true },
      { key: 'girlfriendName', label: 'Birthday Person Name', type: 'text', required: true },
      { key: 'websiteUrl', label: 'Website URL', type: 'url', required: true },
    ],
  },
  {
    id: 'message-approved',
    name: 'Message Approved',
    description: 'Email sent when admin approves a pending message',
    component: MessageApproved,
    defaultProps: {
      contributorName: 'Friend',
      contributorEmail: 'friend@example.com',
      messagePreview: 'Thank you for your heartfelt birthday message!',
      girlfriendName: 'Gracela Elmera C. Betarmos',
      websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
      approvedAt: new Date().toLocaleDateString(),
    },
    editableProps: [
      { key: 'contributorName', label: 'Contributor Name', type: 'text', required: true },
      { key: 'contributorEmail', label: 'Contributor Email', type: 'email', required: true },
      { key: 'messagePreview', label: 'Message Preview', type: 'text', required: true },
      { key: 'girlfriendName', label: 'Birthday Person Name', type: 'text', required: true },
      { key: 'websiteUrl', label: 'Website URL', type: 'url', required: true },
      { key: 'approvedAt', label: 'Approval Date', type: 'text' },
    ],
  },
]

/**
 * Render a React email template to HTML string
 */
export async function renderEmailTemplate(
  templateId: string,
  props: Record<string, any> = {}
): Promise<string> {
  const template = emailTemplates.find(t => t.id === templateId)
  
  if (!template) {
    throw new Error(`Email template not found: ${templateId}`)
  }

  const Component = template.component
  const mergedProps = { ...template.defaultProps, ...props }

  try {
    const html = await render(React.createElement(Component, mergedProps))
    return html
  } catch (error) {
    console.error('Error rendering email template:', error)
    throw new Error(`Failed to render email template: ${templateId}`)
  }
}

/**
 * Get template data by ID
 */
export function getEmailTemplate(templateId: string): EmailTemplateData | undefined {
  return emailTemplates.find(t => t.id === templateId)
}

/**
 * Get all available email templates
 */
export function getAllEmailTemplates(): EmailTemplateData[] {
  return emailTemplates
}

/**
 * Validate template props
 */
export function validateTemplateProps(
  templateId: string,
  props: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const template = getEmailTemplate(templateId)
  
  if (!template) {
    return { isValid: false, errors: ['Template not found'] }
  }

  const errors: string[] = []
  
  // Check required props
  template.editableProps.forEach(prop => {
    if (prop.required && (!props[prop.key] || props[prop.key].toString().trim() === '')) {
      errors.push(`${prop.label} is required`)
    }
    
    // Type validation
    if (props[prop.key] !== undefined) {
      switch (prop.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(props[prop.key])) {
            errors.push(`${prop.label} must be a valid email address`)
          }
          break
        case 'url':
          try {
            new URL(props[prop.key])
          } catch {
            errors.push(`${prop.label} must be a valid URL`)
          }
          break
        case 'number':
          if (isNaN(Number(props[prop.key]))) {
            errors.push(`${prop.label} must be a number`)
          }
          break
      }
    }
  })

  return { isValid: errors.length === 0, errors }
}

/**
 * Generate preview data for a template
 */
export function generatePreviewData(templateId: string): Record<string, any> {
  const template = getEmailTemplate(templateId)
  
  if (!template) {
    return {}
  }

  // Use default props with some sample data
  return {
    ...template.defaultProps,
    messageCount: Math.floor(Math.random() * 50) + 10,
    contributorCount: Math.floor(Math.random() * 30) + 5,
    locationCount: Math.floor(Math.random() * 15) + 3,
  }
}
