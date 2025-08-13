'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadFile, FileUploadHookReturn } from '@/types/upload'
import {
  validateFiles,
  getAcceptedFileTypes,
  createFileValidator,
  generatePreviewUrl
} from '@/lib/fileValidation'
import { uploadFileToStorage, finalizeUploads, cancelTempUploads } from '@/lib/fileUpload'

export function useFileUpload(): FileUploadHookReturn {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map())

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Validate files
    const { validFiles, errors } = validateFiles(acceptedFiles)
    
    // Log validation errors
    errors.forEach(error => {
      console.warn('File validation error:', error.message)
    })
    
    // Add valid files to state
    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: generatePreviewUrl(file) || undefined,
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    validator: createFileValidator(),
    multiple: true,
    disabled: isUploading
  })

  // Add files programmatically
  const addFiles = useCallback((newFiles: File[]) => {
    const { validFiles } = validateFiles(newFiles)
    
    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: generatePreviewUrl(file) || undefined,
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...uploadFiles])
  }, [])

  // Remove a file
  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        // Revoke preview URL to prevent memory leaks
        if (fileToRemove.preview) {
          URL.revokeObjectURL(fileToRemove.preview)
        }
        
        // Cancel upload if in progress
        const controller = uploadAbortControllers.current.get(id)
        if (controller) {
          controller.abort()
          uploadAbortControllers.current.delete(id)
        }
      }
      
      return prev.filter(f => f.id !== id)
    })
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    // Revoke all preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    // Cancel all uploads
    uploadAbortControllers.current.forEach(controller => {
      controller.abort()
    })
    uploadAbortControllers.current.clear()
    
    setFiles([])
    setUploadProgress(0)
  }, [files])

  // Upload all pending files
  const uploadFiles = useCallback(async (messageId: string) => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    let completedUploads = 0
    const totalUploads = pendingFiles.length

    // Upload files concurrently (but limit concurrency)
    const uploadPromises = pendingFiles.map(async (uploadFile) => {
      const controller = new AbortController()
      uploadAbortControllers.current.set(uploadFile.id, controller)

      try {
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading' as const }
            : f
        ))

        // Upload file to temporary storage
        const result = await uploadFileToStorage(uploadFile.file, messageId, {
          onProgress: (progress) => {
            setFiles(prev => prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress: progress.percentage }
                : f
            ))
          },
          onError: (error) => {
            setFiles(prev => prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'error' as const, error }
                : f
            ))
          }
        })

        // Update file status to complete with temporary info
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'complete' as const,
                progress: 100,
                uploadedUrl: result.url,
                thumbnailUrl: result.thumbnailUrl,
                tempPath: result.tempPath,
                fileInfo: result.fileInfo
              }
            : f
        ))

        completedUploads++
        setUploadProgress(Math.round((completedUploads / totalUploads) * 100))

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        ))
      } finally {
        uploadAbortControllers.current.delete(uploadFile.id)
      }
    })

    try {
      await Promise.all(uploadPromises)
    } finally {
      setIsUploading(false)
    }
  }, [files])

  // Finalize uploads when message is submitted
  const finalizeFileUploads = useCallback(async (realMessageId: string) => {
    const completedFiles = files.filter(f => f.status === 'complete' && f.tempPath && f.fileInfo)

    if (completedFiles.length === 0) return

    try {
      const tempFiles = completedFiles.map(f => ({
        tempPath: f.tempPath!,
        fileInfo: f.fileInfo!,
        thumbnailUrl: f.thumbnailUrl
      }))

      await finalizeUploads(tempFiles, realMessageId)
      console.log(`Finalized ${completedFiles.length} file uploads for message ${realMessageId}`)
    } catch (error) {
      console.error('Failed to finalize uploads:', error)
      throw error
    }
  }, [files])

  // Cancel uploads (cleanup temp files)
  const cancelUploads = useCallback(async (tempId: string) => {
    try {
      await cancelTempUploads(tempId)
      clearFiles()
    } catch (error) {
      console.error('Failed to cancel uploads:', error)
    }
  }, [clearFiles])

  return {
    files,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    finalizeFileUploads,
    cancelUploads,
    isUploading,
    uploadProgress
  }
}
