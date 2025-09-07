'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { messageFormSchema, type MessageFormData, defaultFormValues } from '@/lib/validations/message-schema'
import { supabase } from '@/lib/supabase'
import { BirthdayInput } from '@/design-system/components/forms/birthday-input'
import { BirthdayTextarea } from '@/design-system/components/forms/birthday-textarea'
import { LocationPicker } from './location-picker'
import { Button } from '@/components/ui/button'

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
import {
  AnimatedHeartIcon,
  AnimatedGiftIcon
} from '@/design-system/icons/animated-birthday-icons'
import { User, Mail, MessageSquare, MapPin, Camera } from 'lucide-react'
import { BirthdayCard, BirthdayCardContent, BirthdayCardHeader } from '@/components/birthday-card'
import { FileSelectionModal } from './FileSelectionModal'

interface WorkingMessageFormProps {
  className?: string
}

export const WorkingMessageForm: React.FC<WorkingMessageFormProps> = ({ className }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileModal, setShowFileModal] = useState(false)
  const { toast } = useToast()

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: defaultFormValues,
  })

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    console.log(`📁 Selected ${files.length} files:`, files.map(f => f.name))
  }

  const handleSubmit = async (data: MessageFormData) => {
    console.log('🚀 WORKING form submission started')
    
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // 1. Submit message first
      console.log('📝 Submitting message...')
      const response = await fetch('/api/messages-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit message')
      }

      const result = await response.json()
      const messageId = result.data?.id

      console.log('✅ Message submitted successfully:', messageId)

      // 2. Upload files directly to message folder if any
      if (selectedFiles.length > 0 && messageId) {
        console.log(`📤 Uploading ${selectedFiles.length} files directly to message folder...`)
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const timestamp = Date.now()
          const randomId = Math.random().toString(36).substring(2)
          const fileExt = file.name.split('.').pop()
          const fileName = `${timestamp}-${randomId}.${fileExt}`
          const filePath = `${messageId}/${fileName}`

          console.log(`📤 Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`)

          // Upload directly to permanent storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('birthday-media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error(`❌ Failed to upload ${file.name}:`, uploadError)
            continue
          }

          console.log(`✅ Uploaded ${file.name} to ${filePath}`)

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('birthday-media')
            .getPublicUrl(filePath)

          // Determine file type
          const fileType = file.type.startsWith('image/') ? 'image' : 'video'

          // Save to database
          const { error: dbError } = await supabase
            .from('media_files')
            .insert({
              message_id: messageId,
              file_name: file.name,
              file_type: fileType,
              file_size: file.size,
              storage_path: filePath
            })

          if (dbError) {
            console.error(`❌ Failed to save ${file.name} to database:`, dbError)
          } else {
            console.log(`💾 Saved ${file.name} to database`)
          }
        }

        console.log(`🎉 Successfully uploaded and saved ${selectedFiles.length} files!`)
      }

      // 3. Success handling
      form.reset(defaultFormValues)
      setSelectedFiles([])
      
      // Clear file input
      const fileInput = document.getElementById('working-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      toast({
        title: "Message Submitted Successfully!",
        description: selectedFiles.length > 0 
          ? `Your message and ${selectedFiles.length} file(s) have been submitted!`
          : "Your birthday message has been submitted!",
        variant: "default",
      })

      console.log('🎉 WORKING form submission completed successfully!')

    } catch (error) {
      console.error('❌ WORKING form submission failed:', error)
      
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
    <div className={cn("w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      <BirthdayCard className="w-full">
        <BirthdayCardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-black">
              Share Your Birthday Message
            </h2>
          </div>
          <p className="font-body text-muted-foreground text-lg">
            Send your heartfelt wishes and memories to make this birthday extra special!
          </p>
        </BirthdayCardHeader>

        <BirthdayCardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 md:space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Name and Email Fields - Side by side on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-heading text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-bright-pink" />
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <BirthdayInput
                          placeholder="Enter your beautiful name..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-heading text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5 text-bright-pink" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <BirthdayInput
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-body">
                        We'll send you a thank you note and birthday reminders if you'd like!
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Message Field */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-heading text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-bright-pink" />
                      Your Birthday Message
                    </FormLabel>
                    <FormControl>
                      <BirthdayTextarea
                        placeholder="Write your heartfelt birthday message here... Share a memory, a wish, or just let them know how much they mean to you!"
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="font-body">
                      Share your thoughts, memories, or wishes - make it personal and from the heart!
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
                    <FormLabel className="font-heading text-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-bright-pink" />
                      Your Location
                    </FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value || ''}
                        onChange={field.onChange}
                        onLocationDetected={(location: any) => {
                          form.setValue('locationCity', location.city || '')
                          form.setValue('locationCountry', location.country || '')
                          form.setValue('latitude', location.latitude)
                          form.setValue('longitude', location.longitude)
                        }}
                        placeholder="Where are you sending this message from?"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="font-body">
                      Let them know where your birthday wishes are coming from around the world!
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload - Dropzone Design */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-bright-pink" />
                  Photos & Videos
                </Label>

                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => setShowFileModal(true)}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full h-40 border-2 border-dashed rounded-xl",
                      "bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10",
                      "hover:from-primary/10 hover:via-secondary/10 hover:to-primary/15",
                      "border-primary/30 hover:border-primary/50",
                      "transition-all duration-300 cursor-pointer hover:cursor-pointer",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-bright-pink/10 to-soft-pink/20 rounded-2xl flex items-center justify-center border-2 border-dashed border-bright-pink/30">
                        <Camera className="w-10 h-10 text-bright-pink" />
                      </div>
                      <div className="text-center">
                        <p className="font-heading text-sm font-semibold text-charcoal-black">
                          {selectedFiles.length > 0
                            ? `${selectedFiles.length} file(s) selected - Click to change`
                            : 'Click to select photos & videos'
                          }
                        </p>
                        <p className="font-body text-xs text-charcoal-black/60">
                          Up to 10 files • Images & Videos
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>

                {selectedFiles.length > 0 && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-primary">
                        Selected Files ({selectedFiles.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-xs text-charcoal-black/50 hover:text-red-500 transition-colors duration-200 cursor-pointer hover:cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedFiles.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-primary/20 shadow-sm"
                        >
                          <div className="flex-shrink-0">
                            {file.type.startsWith('image/') ? (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">IMG</span>
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">VID</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal-black truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-charcoal-black/50">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <FormDescription className="font-body">
                  Share photos or videos to make your message even more special! Drag & drop or click to upload.
                </FormDescription>
              </motion.div>



              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending your message...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        Send Birthday Message
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.form>
          </Form>
        </BirthdayCardContent>
      </BirthdayCard>

      {/* File Selection Modal */}
      <FileSelectionModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onFilesSelected={handleFilesSelected}
        maxFiles={10}
        acceptedTypes="image/*,video/*"
        currentFiles={selectedFiles}
      />
    </div>
  )
}
