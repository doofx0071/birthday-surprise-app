'use client'

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, Image, Video } from 'lucide-react'

interface DirectFileUploadProps {
  onFilesUploaded?: (files: Array<{ url: string; type: 'image' | 'video'; fileName: string; filePath: string }>) => void
  disabled?: boolean
  className?: string
  tempMessageId?: string
}

export interface DirectFileUploadRef {
  getUploadedFiles: () => Array<{ url: string; type: 'image' | 'video'; fileName: string; filePath: string }>
  clearFiles: () => void
  uploadFiles: (messageId: string) => Promise<Array<{ url: string; type: 'image' | 'video'; fileName: string; filePath: string }>>
  hasFiles: () => boolean
}

export const DirectFileUpload = forwardRef<DirectFileUploadRef, DirectFileUploadProps>(({
  onFilesUploaded,
  disabled = false,
  className,
  tempMessageId
}, ref) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; type: 'image' | 'video'; fileName: string; filePath: string }>>([])
  const [uploading, setUploading] = useState(false)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getUploadedFiles: () => uploadedFiles,
    clearFiles: () => {
      setFiles([])
      setUploadedFiles([])
    },
    uploadFiles,
    hasFiles: () => files.length > 0
  }))

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])

    // Upload files immediately when selected
    if (selectedFiles.length > 0 && tempMessageId) {
      setUploading(true)
      try {
        for (const file of selectedFiles) {
          await uploadSingleFile(file, tempMessageId)
        }

        console.log(`✅ Uploaded ${selectedFiles.length} files immediately to ${tempMessageId}`)
      } catch (error) {
        console.error('❌ Immediate upload failed:', error)
      } finally {
        setUploading(false)
      }
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const uploadSingleFile = useCallback(async (file: File, messageId: string) => {
    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomId}.${fileExt}`
    const filePath = `${messageId}/${fileName}`

    console.log(`📤 Uploading ${file.name} directly to permanent storage...`)

    // Upload directly to permanent storage
    const { data, error } = await supabase.storage
      .from('birthday-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('birthday-media')
      .getPublicUrl(filePath)

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' : 'video'

    const uploadedFile = {
      url: publicUrl,
      type: fileType as 'image' | 'video',
      fileName: file.name,
      filePath: filePath
    }

    setUploadedFiles(prev => [...prev, uploadedFile])
    console.log(`✅ Successfully uploaded ${file.name} to ${filePath}`)

    return uploadedFile
  }, [])

  const uploadFiles = useCallback(async (messageId: string) => {
    if (files.length === 0) return []

    setUploading(true)
    const uploadedResults: Array<{ url: string; type: 'image' | 'video'; fileName: string; filePath: string }> = []

    try {
      for (const file of files) {
        // Generate unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2)
        const fileExt = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomId}.${fileExt}`
        const filePath = `${messageId}/${fileName}`

        console.log(`📤 Uploading ${file.name} directly to permanent storage...`)

        // Upload directly to permanent storage
        const { data, error } = await supabase.storage
          .from('birthday-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error)
          throw error
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('birthday-media')
          .getPublicUrl(filePath)

        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' : 'video'

        const uploadedFile = {
          url: publicUrl,
          type: fileType as 'image' | 'video',
          fileName: file.name,
          filePath: filePath
        }

        uploadedResults.push(uploadedFile)
        console.log(`✅ Successfully uploaded ${file.name} to ${filePath}`)

        // Save to database immediately
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            message_id: messageId,
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
            storage_path: filePath,
            file_url: publicUrl,
            is_processed: true
          })

        if (dbError) {
          console.error(`❌ Failed to save ${file.name} to database:`, dbError)
        } else {
          console.log(`💾 Saved ${file.name} to database`)
        }
      }

      setUploadedFiles(uploadedResults)
      onFilesUploaded?.(uploadedResults)
      setFiles([]) // Clear files after successful upload

      console.log(`🎉 Successfully uploaded ${uploadedResults.length} files directly to permanent storage`)
      return uploadedResults

    } catch (error) {
      console.error('❌ Direct upload failed:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }, [files, onFilesUploaded])

  const getFileIcon = (file: File) => {
    return file.type.startsWith('image/') ? Image : Video
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => document.getElementById('direct-file-input')?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {files.length > 0 ? `${files.length} file(s) selected` : 'Choose Files'}
        </Button>
        
        <input
          id="direct-file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Selected files:</p>
          {files.map((file, index) => {
            const Icon = getFileIcon(file)
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-sm text-blue-600">
          Uploading files directly to storage...
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">✅ Uploaded successfully:</p>
          {uploadedFiles.map((file, index) => {
            const Icon = file.type === 'image' ? Image : Video
            return (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <Icon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">{file.fileName}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

DirectFileUpload.displayName = 'DirectFileUpload'
