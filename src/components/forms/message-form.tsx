'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Form components and validation
import { messageFormSchema, type MessageFormData, defaultFormValues } from '@/lib/validations/message-schema'
import { BirthdayInput } from '@/design-system/components/forms/birthday-input'
import { BirthdayTextarea } from '@/design-system/components/forms/birthday-textarea'
import { LocationPicker } from './location-picker'
import { DraftIndicator } from './draft-indicator'
import { FileUpload } from '@/components/upload'
import { finalizeUploads } from '@/lib/fileUpload'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Icons and UI
import { 
  AnimatedHeartIcon, 
  AnimatedSparkleIcon, 
  AnimatedGiftIcon,
  AnimatedCelebrationIcon 
} from '@/design-system/icons/animated-birthday-icons'
import { BirthdayCard, BirthdayCardContent, BirthdayCardHeader } from '@/components/birthday-card'
import { useAutoSave } from '@/hooks/use-auto-save'

interface MessageFormProps {
  onSubmit?: (data: MessageFormData) => Promise<void>
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

export const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  className,
  disabled = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<number | undefined>()
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; thumbnailUrl?: string }>>([])
  const [tempFiles, setTempFiles] = useState<Array<{ tempPath: string; fileInfo: any; thumbnailUrl?: string }>>([])
  const [clearFilesTrigger, setClearFilesTrigger] = useState(0)

  // Generate a temporary ID for file uploads (will be replaced with actual message ID after submission)
  const tempUploadId = useMemo(() => `${Date.now()}-${Math.random().toString(36).substring(2)}`, [])

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur', // Validate on blur for better UX
  })

  // Auto-save functionality
  const autoSave = useAutoSave({
    watch: form.watch,
    enabled: !disabled && !isSubmitting,
    onSave: (data) => {
      setIsAutoSaving(true)
      setTimeout(() => {
        setIsAutoSaving(false)
        setLastSaved(Date.now())
      }, 500) // Show saving indicator briefly
    },
    onRestore: (data) => {
      // Restore form data from draft
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof MessageFormData]
        if (value !== undefined) {
          form.setValue(key as keyof MessageFormData, value)
        }
      })
    }
  })

  // Check for draft on component mount
  useEffect(() => {
    if (autoSave.hasDraft()) {
      // Draft will be shown via DraftIndicator component
    }
  }, [autoSave])

  // Handle form submission
  const handleSubmit = async (data: MessageFormData) => {
    if (disabled || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let messageId: string | undefined

      // Call the provided onSubmit handler or default API call
      if (onSubmit) {
        await onSubmit(data)
        // For custom onSubmit, we'll need the message ID to be returned
        // For now, we'll skip file finalization for custom handlers
      } else {
        // Default submission to API route
        const response = await fetch('/api/messages', {
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
        messageId = result.id || result.messageId
      }

      // Finalize file uploads if we have a message ID and temp files
      if (messageId && tempFiles.length > 0) {
        try {
          await finalizeUploads(tempFiles, messageId)
          console.log(`Finalized ${tempFiles.length} file uploads for message ${messageId}`)
        } catch (fileError) {
          console.error('Failed to finalize file uploads:', fileError)
          // Don't fail the entire submission for file errors
        }
      }

      // Success handling
      setSubmitSuccess(true)
      form.reset(defaultFormValues)
      autoSave.clearDraft() // Clear draft after successful submission
      setLastSaved(undefined)
      setUploadedFiles([])
      setTempFiles([])
      setClearFilesTrigger(prev => prev + 1) // Trigger file upload component to clear
      onSuccess?.()

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit message'
      setSubmitError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle location detection
  const handleLocationDetected = (locationData: any) => {
    form.setValue('detectedLocation', locationData)
  }

  // Character count for message field
  const messageValue = form.watch('message') || ''
  const messageLength = messageValue.length
  const maxMessageLength = 500

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <BirthdayCard className="overflow-hidden">
        <BirthdayCardHeader className="text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <AnimatedSparkleIcon size="md" color="pink" intensity="normal" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black">
              Add Your Birthday Wish
            </h2>
            <AnimatedSparkleIcon size="md" color="roseGold" intensity="normal" />
          </div>
          <p className="font-body text-base text-charcoal-black/70">
            Share a heartfelt message to make this birthday extra special
          </p>
        </BirthdayCardHeader>

        <BirthdayCardContent>
          {/* Success Message */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <AnimatedCelebrationIcon size="md" color="current" className="text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Message Submitted Successfully!</h3>
                    <p className="text-sm text-green-700">
                      Thank you for your birthday wish. It will be displayed on the special day!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-800">Submission Failed</h3>
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubmitError(null)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draft Indicator */}
          <DraftIndicator
            hasDraft={autoSave.hasDraft()}
            draftTimestamp={autoSave.getDraftInfo()?.timestamp}
            onRestoreDraft={() => {
              const draftData = autoSave.restoreDraft()
              if (draftData) {
                // Form data is already restored in the onRestore callback
                setLastSaved(undefined) // Clear last saved indicator since we're restoring
              }
            }}
            onClearDraft={() => {
              autoSave.clearDraft()
              setLastSaved(undefined)
            }}
            isAutoSaving={isAutoSaving}
            lastSaved={lastSaved}
            className="mb-6"
          />

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AnimatedHeartIcon size="xs" color="pink" intensity="subtle" />
                      Your Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <BirthdayInput
                        {...field}
                        placeholder="Enter your name"
                        variant="birthday"
                        sparkle
                        disabled={disabled || isSubmitting}
                        error={form.formState.errors.name?.message}
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <AnimatedSparkleIcon size="xs" color="roseGold" intensity="subtle" />
                      Email Address
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <BirthdayInput
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        variant="birthday"
                        sparkle
                        disabled={disabled || isSubmitting}
                        error={form.formState.errors.email?.message}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll use this to send you birthday reminders if you opt in
                    </FormDescription>
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
                    <FormLabel className="flex items-center gap-2">
                      <span>📍</span>
                      Location (Optional)
                    </FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        onLocationDetected={handleLocationDetected}
                        error={form.formState.errors.location?.message}
                        disabled={disabled || isSubmitting}
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <AnimatedGiftIcon size="xs" color="pink" intensity="subtle" />
                      Your Birthday Message
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <BirthdayTextarea
                        {...field}
                        placeholder="Write your heartfelt birthday message here..."
                        variant="birthday"
                        sparkle
                        maxLength={maxMessageLength}
                        showCharCount
                        disabled={disabled || isSubmitting}
                        error={form.formState.errors.message?.message}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormDescription>
                        Share your wishes, memories, or anything that will make this birthday special
                      </FormDescription>
                      <span className={cn(
                        'text-xs',
                        messageLength > maxMessageLength * 0.8 
                          ? 'text-orange-600' 
                          : 'text-muted-foreground'
                      )}>
                        {messageLength}/{maxMessageLength}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <span>📎</span>
                  Photos & Videos (Optional)
                </Label>
                <FileUpload
                  variant="compact"
                  disabled={disabled || isSubmitting}
                  messageId={tempUploadId}
                  clearTrigger={clearFilesTrigger}
                  onFilesUploaded={(files) => {
                    console.log('Files uploaded to temporary storage:', files)
                    setUploadedFiles(files)
                  }}
                  onTempFilesReady={(tempFileData) => {
                    console.log('Temporary files ready for finalization:', tempFileData)
                    setTempFiles(tempFileData)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Add photos or videos to make your birthday message extra special!
                  Supports images (JPG, PNG, WebP, GIF) up to 5MB and videos (MP4, WebM, MOV) up to 50MB.
                </p>
              </div>

              {/* Notifications Checkbox */}
              <FormField
                control={form.control}
                name="wantsReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled || isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2 cursor-pointer">
                        <AnimatedSparkleIcon size="xs" color="pink" intensity="subtle" />
                        Send me birthday reminders
                      </FormLabel>
                      <FormDescription>
                        Get notified about upcoming birthdays so you never miss celebrating with loved ones
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={disabled || isSubmitting || !form.formState.isValid}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <AnimatedSparkleIcon size="sm" color="white" animate={false} />
                      </motion.div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AnimatedHeartIcon size="sm" color="white" intensity="normal" />
                      <span>Submit Birthday Wish</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset(defaultFormValues)
                    autoSave.clearDraft()
                    setUploadedFiles([])
                    setTempFiles([])
                    setClearFilesTrigger(prev => prev + 1)
                    setLastSaved(undefined)
                  }}
                  disabled={disabled || isSubmitting}
                  className="h-12 px-6 border-primary/30 hover:bg-primary/5"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </BirthdayCardContent>
      </BirthdayCard>
    </div>
  )
}
