'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { messageFormSchema, type MessageFormData, defaultFormValues } from '@/lib/validations/message-schema'
import { DirectFileUpload, DirectFileUploadRef } from '@/components/upload/DirectFileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface SimpleMessageFormProps {
  className?: string
}

export const SimpleMessageForm: React.FC<SimpleMessageFormProps> = ({ className }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tempMessageId] = useState(`temp-${Date.now()}-${Math.random().toString(36).substring(2)}`)
  const fileUploadRef = useRef<DirectFileUploadRef>(null)
  const { toast } = useToast()

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: defaultFormValues,
  })

  const handleSubmit = async (data: MessageFormData) => {
    console.log('🚀 Simple form submission started')
    
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // 1. Submit message first
      console.log('📝 Submitting message...')
      const response = await fetch('/api/messages-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit message')
      }

      const result = await response.json()
      const messageId = result.data?.id

      console.log('✅ Message submitted successfully:', messageId)

      // 2. Link any uploaded files to this message
      const uploadedFiles = fileUploadRef.current?.getUploadedFiles() || []
      if (uploadedFiles.length > 0) {
        console.log(`🔗 Linking ${uploadedFiles.length} uploaded files to message...`)

        const linkResponse = await fetch('/api/link-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, tempMessageId })
        })

        if (linkResponse.ok) {
          const linkResult = await linkResponse.json()
          console.log(`✅ Successfully linked ${linkResult.filesLinked} files`)
        } else {
          console.error('Failed to link files to message')
        }
      }

      // 3. Success handling
      form.reset(defaultFormValues)
      fileUploadRef.current?.clearFiles()

      toast({
        title: "Message Submitted Successfully! 🎉",
        description: "Your birthday message has been submitted and will appear in the gallery.",
        variant: "default",
      })

      console.log('🎉 Simple form submission completed successfully!')

    } catch (error) {
      console.error('❌ Simple form submission failed:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birthday Message *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your heartfelt birthday message..."
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location Field */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Photos & Videos (Optional)</Label>
            <DirectFileUpload
              ref={fileUploadRef}
              disabled={isSubmitting}
              tempMessageId={tempMessageId}
            />
          </div>

          {/* Reminders Checkbox */}
          <FormField
            control={form.control}
            name="wantsReminders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Send me birthday reminders
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Error Display */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-lg font-semibold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Birthday Message 🎉'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
