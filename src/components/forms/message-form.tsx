'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { FileUpload, FileUploadRef } from '@/components/upload'
import { finalizeUploads } from '@/lib/fileUpload'
import { useAsyncFileUpload } from '@/hooks/useAsyncFileUpload'
import { UploadProgressIndicator } from '@/components/upload/UploadProgressIndicator'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
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

import { BirthdayCard, BirthdayCardContent, BirthdayCardHeader } from '@/components/birthday-card'
import { useAutoSave } from '@/hooks/use-auto-save'

interface MessageFormProps {
  onSubmit?: (data: MessageFormData) => Promise<void>
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

// Constants
const maxMessageLength = 2000

export const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  className,
  disabled = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const { toast } = useToast()
  const [lastSaved, setLastSaved] = useState<number | undefined>()
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; thumbnailUrl?: string }>>([])
  const [tempFiles, setTempFiles] = useState<Array<{ tempPath: string; fileInfo: any; thumbnailUrl?: string }>>([])
  const [clearFilesTrigger, setClearFilesTrigger] = useState(0)
  const fileUploadRef = useRef<FileUploadRef>(null)

  // Async file upload hook for performance optimization
  const asyncUpload = useAsyncFileUpload()
  const [useAsyncUpload, setUseAsyncUpload] = useState(true) // Toggle for async upload

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
    console.log('🚀 Form submission started:', { disabled, isSubmitting, data: { ...data, message: data.message.substring(0, 50) + '...' } })

    if (disabled || isSubmitting) {
      console.log('⚠️ Form submission blocked:', { disabled, isSubmitting })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let messageId: string | undefined

      // Process detected location data into individual fields
      if (data.detectedLocation) {
        data.locationCity = data.detectedLocation.city || ''
        data.locationCountry = data.detectedLocation.country || ''
        data.latitude = data.detectedLocation.latitude
        data.longitude = data.detectedLocation.longitude

        // Also update the legacy location field for backward compatibility
        if (data.detectedLocation.city && data.detectedLocation.country) {
          data.location = `${data.detectedLocation.city}, ${data.detectedLocation.country}`
        }
      }

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
        messageId = result.data?.id || result.id || result.messageId
      }

      // Handle async file uploads if enabled
      if (useAsyncUpload && asyncUpload.files.length > 0 && messageId) {
        try {
          console.log('🚀 Starting async file uploads...')
          await asyncUpload.startUploads(messageId)
          console.log(`✅ Completed async upload of ${asyncUpload.files.length} files`)
        } catch (uploadError) {
          console.error('❌ Async file upload failed:', uploadError)
          // Don't fail the entire submission for file errors in async mode
        }
      }

      // Check for pending files and upload them if needed (legacy mode)
      let finalTempFiles = tempFiles
      if (!useAsyncUpload && fileUploadRef.current?.hasPendingFiles()) {
        try {
          console.log('Uploading pending files before form submission...')
          const uploadedTempFiles = await fileUploadRef.current.uploadPendingFiles()
          finalTempFiles = [...tempFiles, ...uploadedTempFiles]
          console.log(`✅ Uploaded ${uploadedTempFiles.length} pending files`)
        } catch (uploadError) {
          console.error('❌ Failed to upload pending files:', uploadError)
          throw new Error('Failed to upload files. Please try again.')
        }
      }

      // Debug logging
      console.log('Form submission debug:', {
        messageId,
        originalTempFilesLength: tempFiles.length,
        finalTempFilesLength: finalTempFiles.length,
        finalTempFiles: finalTempFiles
      })

      // Finalize file uploads if we have a message ID and temp files (legacy mode only)
      if (!useAsyncUpload && messageId && finalTempFiles.length > 0) {
        try {
          console.log('Starting file finalization...')
          await finalizeUploads(finalTempFiles, messageId)
          console.log(`✅ Finalized ${finalTempFiles.length} file uploads for message ${messageId}`)
        } catch (fileError) {
          console.error('❌ Failed to finalize file uploads:', fileError)
          // Don't fail the entire submission for file errors
        }
      } else if (!useAsyncUpload) {
        console.log('⚠️ Skipping file finalization:', {
          hasMessageId: !!messageId,
          tempFilesCount: finalTempFiles.length
        })
      } else {
        console.log('📤 Using async upload mode - files handled separately')
      }

      // Clear temp files after finalization (or after skipping)
      setTempFiles([])

      // Success handling
      form.reset(defaultFormValues)
      autoSave.clearDraft() // Clear draft after successful submission
      setLastSaved(undefined)
      setUploadedFiles([])
      // Note: setTempFiles([]) is called after file finalization
      setClearFilesTrigger(prev => prev + 1) // Trigger file upload component to clear

      // Clear async uploads if using async mode
      if (useAsyncUpload) {
        asyncUpload.clearFiles()
      }

      onSuccess?.()

      // Show success toast
      toast({
        title: "Message Submitted Successfully!",
        description: "Thank you for your birthday wish. It will be displayed on the special day!",
        variant: "default",
        duration: 5000,
      })

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

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <BirthdayCard className="overflow-hidden">
        <BirthdayCardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <h2 className="font-body text-2xl md:text-3xl font-bold text-charcoal-black">
              Add Your Birthday Wish
            </h2>
          </div>
          <p className="font-body text-base text-charcoal-black/70">
            Share a heartfelt message to make this birthday extra special
          </p>
        </BirthdayCardHeader>

        <BirthdayCardContent>
          {/* Success messages now handled by toast notifications */}

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
                      Your Birthday Message
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <BirthdayTextarea
                        {...field}
                        placeholder="Write your heartfelt birthday message here..."
                        variant="birthday"
                        sparkle

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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-3 font-heading font-bold text-charcoal-black">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-soft-pink to-rose-gold flex items-center justify-center">
                        <span className="text-white text-sm">📸</span>
                      </div>
                      <span>Photos & Videos</span>
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                  </Label>

                  {/* Upload Mode Toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={useAsyncUpload ? 'text-muted-foreground' : 'text-blue-600 font-medium'}>
                      Legacy
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseAsyncUpload(!useAsyncUpload)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        useAsyncUpload ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      disabled={disabled || isSubmitting}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          useAsyncUpload ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={useAsyncUpload ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                      ⚡ Fast
                    </span>
                  </div>
                </div>

                {useAsyncUpload ? (
                  /* Async Upload Mode */
                  <div className="space-y-4">
                    {/* Async Upload Dropzone */}
                    <div
                      {...asyncUpload.getRootProps()}
                      className={`relative p-6 text-center cursor-pointer neuro-card transition-all ${
                        asyncUpload.isDragActive
                          ? asyncUpload.isDragAccept
                            ? 'border-green-500 bg-green-50 scale-105'
                            : 'border-red-500 bg-red-50'
                          : ''
                      } ${(disabled || isSubmitting) && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <input {...asyncUpload.getInputProps()} disabled={disabled || isSubmitting} />
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xl">⚡</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {asyncUpload.isDragActive ? 'Drop files here' : 'Fast Upload Mode'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Original quality preserved • Background upload with progress tracking
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {asyncUpload.files.length > 0 && (
                      <UploadProgressIndicator
                        files={asyncUpload.files}
                        queueStats={asyncUpload.queueStats}
                        onPauseFile={asyncUpload.pauseUpload}
                        onResumeFile={asyncUpload.resumeUpload}
                        onCancelFile={asyncUpload.cancelUpload}
                        onRetryFailed={asyncUpload.retryFailedUploads}
                        onClearCompleted={asyncUpload.clearCompleted}
                      />
                    )}
                  </div>
                ) : (
                  /* Legacy Upload Mode */
                  <FileUpload
                    ref={fileUploadRef}
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
                )}

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium">✨ Make your message extra special!</span><br />
                  📷 Images: JPG, PNG, WebP, GIF (up to 5MB)<br />
                  🎥 Videos: MP4, WebM, MOV (up to 50MB)<br />
                  {useAsyncUpload && (
                    <span className="text-blue-600">⚡ Fast mode: Original quality preserved • Background upload with progress tracking</span>
                  )}
                </p>
              </div>

              {/* Auto-enable reminders - no checkbox needed */}
              <input type="hidden" {...form.register('wantsReminders')} value="true" />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={disabled || isSubmitting || !form.formState.isValid}
                  className="flex-1 h-14 text-lg font-heading font-black cursor-pointer
                    bg-gradient-to-br from-white to-gray-50 text-soft-pink
                    border-2 border-soft-pink/30 rounded-2xl
                    shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]
                    hover:shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]
                    active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]
                    transition-all duration-300 ease-in-out transform
                    hover:scale-[0.98] active:scale-[0.96]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-soft-pink border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span>Send Birthday Message</span>
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
