'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  EyeIcon,
  PaintBrushIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  senderName: z.string().min(1, 'Sender name is required'),
  senderEmail: z.string().email('Valid email is required'),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface EmailTemplate {
  id: string
  name: string
  subject: string
  description?: string
  content: string
  senderName: string
  senderEmail: string
  isDefault: boolean
  isReactTemplate?: boolean
  editableProps?: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'url' | 'email'
    required?: boolean
  }>
  defaultProps?: Record<string, any>
  previewHtml?: string
  createdAt: string
  updatedAt: string
}

export function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewProps, setPreviewProps] = useState<Record<string, any>>({})
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      senderName: "Cela's Birthday",
      senderEmail: 'birthday@example.com',
    },
  })

  const watchedContent = watch('content')
  const watchedSubject = watch('subject')

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.isReactTemplate) {
        // For React templates, set up editable props
        const formData: any = {
          name: selectedTemplate.name,
          subject: selectedTemplate.subject,
          senderName: selectedTemplate.senderName,
          senderEmail: selectedTemplate.senderEmail,
        }

        // Add default props as form values
        if (selectedTemplate.defaultProps) {
          Object.entries(selectedTemplate.defaultProps).forEach(([key, value]) => {
            formData[key] = value
          })
        }

        reset(formData)

        // Fetch initial preview
        if (selectedTemplate.previewHtml) {
          setPreviewHtml(selectedTemplate.previewHtml)
        } else {
          fetchPreview(selectedTemplate.id)
        }
      } else {
        // For HTML templates
        reset({
          name: selectedTemplate.name,
          subject: selectedTemplate.subject,
          content: selectedTemplate.content,
          senderName: selectedTemplate.senderName,
          senderEmail: selectedTemplate.senderEmail,
        })
      }
    }
  }, [selectedTemplate, reset])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates?preview=true')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchPreview = async (templateId: string, props?: Record<string, any>) => {
    try {
      const url = `/api/admin/email-templates/${templateId}/preview`
      const response = props
        ? await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ props }),
          })
        : await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setPreviewHtml(data.html)
        setPreviewProps(data.props)
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error)
    }
  }

  const onSubmit = async (data: TemplateFormData) => {
    setLoading(true)
    try {
      const url = selectedTemplate
        ? `/api/admin/email-templates/${selectedTemplate.id}`
        : '/api/admin/email-templates'
      
      const method = selectedTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Template ${selectedTemplate ? 'updated' : 'created'} successfully`,
        })
        fetchTemplates()
        if (!selectedTemplate) {
          reset()
        }
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        })
        fetchTemplates()
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null)
          reset()
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    reset({
      name: '',
      subject: '',
      content: '',
      senderName: "Cela's Birthday",
      senderEmail: 'birthday@example.com',
    })
  }

  const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%);">
  <div style="padding: 40px 20px; text-align: center;">
    <h1 style="color: #ec4899; font-size: 28px; margin-bottom: 20px;">🎉 Happy Birthday! 🎉</h1>
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Your special day is here! We hope it's filled with love, laughter, and wonderful memories.
    </p>
    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        This is an automated birthday notification from your birthday surprise application.
      </p>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
      With love,<br>Your Birthday Surprise Team
    </p>
  </div>
</div>
  `.trim()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-charcoal-black">Templates</h3>
          <Button size="sm" onClick={handleNewTemplate} className="flex items-center space-x-1">
            <PlusIcon className="w-4 h-4" />
            <span>New</span>
          </Button>
        </div>

        <div className="space-y-2">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'border-soft-pink bg-soft-pink/10'
                  : 'border-soft-pink/20 hover:border-soft-pink/40'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-charcoal-black">{template.name}</p>
                    {template.isReactTemplate && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        React
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-black/60">{template.subject}</p>
                  {template.description && (
                    <p className="text-xs text-charcoal-black/50 mt-1">{template.description}</p>
                  )}
                  {template.isDefault && (
                    <span className="text-xs bg-soft-pink text-white px-2 py-1 rounded mt-1 inline-block">
                      Default
                    </span>
                  )}
                </div>
                {!template.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTemplate(template.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Template Editor */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-charcoal-black">
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1"
            >
              <EyeIcon className="w-4 h-4" />
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </Button>
          </div>
        </div>

        {selectedTemplate?.isReactTemplate ? (
          // React Template Editor
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">React Email Template</h4>
              <p className="text-sm text-blue-700">
                This is a React-based email template. You can customize the properties below to see how the email will look.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Template Name
                </label>
                <input
                  value={selectedTemplate.name}
                  disabled
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Subject Line
                </label>
                <input
                  {...register('subject')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
              </div>
            </div>

            {/* Editable Props */}
            {selectedTemplate.editableProps && selectedTemplate.editableProps.length > 0 && (
              <div>
                <h4 className="font-medium text-charcoal-black mb-3">Template Properties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.editableProps.map((prop) => (
                    <div key={prop.key}>
                      <label className="block text-sm font-medium text-charcoal-black mb-1">
                        {prop.label} {prop.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        {...register(prop.key as any)}
                        type={prop.type === 'number' ? 'number' : prop.type === 'email' ? 'email' : 'text'}
                        className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                        onChange={(e) => {
                          // Update preview on change
                          const newProps = { ...previewProps, [prop.key]: e.target.value }
                          setPreviewProps(newProps)
                          fetchPreview(selectedTemplate.id, newProps)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={() => fetchPreview(selectedTemplate.id, previewProps)}
              >
                Refresh Preview
              </Button>
            </div>
          </div>
        ) : (
          // HTML Template Editor
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Template Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder="Birthday Notification"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Subject Line
                </label>
                <input
                  {...register('subject')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                  placeholder="🎉 Happy Birthday!"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Sender Name
                </label>
                <input
                  {...register('senderName')}
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
                {errors.senderName && (
                  <p className="text-red-500 text-sm mt-1">{errors.senderName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-1">
                  Sender Email
                </label>
                <input
                  {...register('senderEmail')}
                  type="email"
                  className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none"
                />
                {errors.senderEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.senderEmail.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-1">
                Email Content (HTML)
              </label>
              <textarea
                {...register('content')}
                rows={12}
                className="w-full px-3 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none font-mono text-sm"
                placeholder={defaultTemplate}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : selectedTemplate ? 'Update Template' : 'Create Template'}
              </Button>

              {!selectedTemplate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset({
                      name: 'Birthday Notification',
                      subject: '🎉 Happy Birthday!',
                      content: defaultTemplate,
                      senderName: "Cela's Birthday",
                      senderEmail: 'birthday@example.com',
                    })
                  }}
                >
                  Use Default Template
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="border border-soft-pink/20 rounded-lg p-4">
            <h4 className="font-medium text-charcoal-black mb-3">Email Preview</h4>
            <div className="border rounded p-4 bg-gray-50">
              <div className="mb-2">
                <strong>Subject:</strong> {watchedSubject || selectedTemplate?.subject || 'No subject'}
              </div>
              {selectedTemplate?.isReactTemplate ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: previewHtml || '<p>Loading preview...</p>',
                  }}
                />
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: watchedContent || '<p>No content</p>',
                  }}
                />
              )}
            </div>

            {selectedTemplate?.isReactTemplate && previewProps && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h5 className="font-medium text-blue-800 mb-2">Current Properties:</h5>
                <pre className="text-xs text-blue-700 overflow-x-auto">
                  {JSON.stringify(previewProps, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
