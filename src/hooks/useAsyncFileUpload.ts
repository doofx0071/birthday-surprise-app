/**
 * Enhanced Async File Upload Hook
 * Provides high-performance file upload with compression, progress tracking, and queue management
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadQueue, UploadProgress, QueueStats } from '@/lib/upload/uploadQueue'
import { validateFiles, getAcceptedFileTypes, createFileValidator } from '@/lib/fileValidation'

export interface AsyncUploadFile {
  id: string
  file: File
  preview?: string
  status: 'pending' | 'compressing' | 'uploading' | 'complete' | 'error' | 'paused'
  progress: number
  error?: string
  uploadSpeed?: number
  estimatedTimeRemaining?: number
  compressedSize?: number
  originalSize: number
}

export interface AsyncFileUploadHookReturn {
  // File management
  files: AsyncUploadFile[]
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearCompleted: () => void
  
  // Upload control
  startUploads: (messageId: string) => Promise<void>
  pauseUpload: (fileId: string) => void
  resumeUpload: (fileId: string) => void
  cancelUpload: (fileId: string) => void
  
  // Progress tracking
  overallProgress: number
  queueStats: QueueStats
  isUploading: boolean
  hasActiveUploads: boolean
  
  // Dropzone
  getRootProps: () => any
  getInputProps: () => any
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean
  
  // Utilities
  getTotalSize: () => number
  getCompletedFiles: () => AsyncUploadFile[]
  getFailedFiles: () => AsyncUploadFile[]
  retryFailedUploads: () => void
}

export function useAsyncFileUpload(): AsyncFileUploadHookReturn {
  const [files, setFiles] = useState<AsyncUploadFile[]>([])
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    overallProgress: 0,
    totalSize: 0,
    uploadedSize: 0,
    averageSpeed: 0,
    estimatedTimeRemaining: 0
  })
  const [isUploading, setIsUploading] = useState(false)
  
  const fileIdToQueueId = useRef<Map<string, string>>(new Map())
  const currentMessageId = useRef<string>('')

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Validate files
    const { validFiles, errors } = validateFiles(acceptedFiles)
    
    // Log validation errors
    errors.forEach(error => {
      console.warn('File validation error:', error.message)
    })
    
    addFiles(validFiles)
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

  // Add files to the upload list
  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: AsyncUploadFile[] = newFiles.map(file => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      // Generate preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      return {
        id,
        file,
        preview,
        status: 'pending',
        progress: 0,
        originalSize: file.size
      }
    })
    
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
        const queueId = fileIdToQueueId.current.get(id)
        if (queueId) {
          uploadQueue.cancelFile(queueId)
          fileIdToQueueId.current.delete(id)
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
      
      // Cancel any active uploads
      const queueId = fileIdToQueueId.current.get(file.id)
      if (queueId) {
        uploadQueue.cancelFile(queueId)
      }
    })
    
    fileIdToQueueId.current.clear()
    setFiles([])
  }, [files])

  // Clear completed files
  const clearCompleted = useCallback(() => {
    setFiles(prev => {
      const completedFiles = prev.filter(f => f.status === 'complete' || f.status === 'error')
      
      // Revoke preview URLs for completed files
      completedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      
      return prev.filter(f => f.status !== 'complete' && f.status !== 'error')
    })
    
    uploadQueue.clearCompleted()
  }, [])

  // Start uploads for all pending files
  const startUploads = useCallback(async (messageId: string) => {
    currentMessageId.current = messageId
    setIsUploading(true)
    
    try {
      const pendingFiles = files.filter(f => f.status === 'pending')
      
      if (pendingFiles.length === 0) {
        console.log('No files to upload')
        return
      }

      // Add files to upload queue
      const queueIds = uploadQueue.addFiles(
        pendingFiles.map(f => f.file),
        messageId,
        1 // High priority
      )

      // Map file IDs to queue IDs
      pendingFiles.forEach((file, index) => {
        fileIdToQueueId.current.set(file.id, queueIds[index])
      })

      console.log(`🚀 Started uploading ${pendingFiles.length} files`)
      
      // Wait for all uploads to complete
      await uploadQueue.waitForCompletion()
      
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [files])

  // Pause upload
  const pauseUpload = useCallback((fileId: string) => {
    const queueId = fileIdToQueueId.current.get(fileId)
    if (queueId) {
      uploadQueue.pauseFile(queueId)
    }
  }, [])

  // Resume upload
  const resumeUpload = useCallback((fileId: string) => {
    const queueId = fileIdToQueueId.current.get(fileId)
    if (queueId) {
      uploadQueue.resumeFile(queueId)
    }
  }, [])

  // Cancel upload
  const cancelUpload = useCallback((fileId: string) => {
    const queueId = fileIdToQueueId.current.get(fileId)
    if (queueId) {
      uploadQueue.cancelFile(queueId)
      fileIdToQueueId.current.delete(fileId)
    }
  }, [])

  // Retry failed uploads
  const retryFailedUploads = useCallback(() => {
    const failedFiles = files.filter(f => f.status === 'error')
    
    if (failedFiles.length > 0 && currentMessageId.current) {
      const queueIds = uploadQueue.addFiles(
        failedFiles.map(f => f.file),
        currentMessageId.current,
        2 // Higher priority for retries
      )

      // Update mapping
      failedFiles.forEach((file, index) => {
        fileIdToQueueId.current.set(file.id, queueIds[index])
      })
    }
  }, [files])

  // Subscribe to upload progress
  useEffect(() => {
    const unsubscribeProgress = uploadQueue.onProgress((progress: UploadProgress) => {
      setFiles(prev => prev.map(file => {
        const queueId = fileIdToQueueId.current.get(file.id)
        if (queueId === progress.fileId) {
          return {
            ...file,
            status: progress.status,
            progress: progress.progress,
            error: progress.error,
            uploadSpeed: progress.uploadSpeed,
            estimatedTimeRemaining: progress.estimatedTimeRemaining
          }
        }
        return file
      }))
    })

    const unsubscribeStats = uploadQueue.onQueueStats((stats: QueueStats) => {
      setQueueStats(stats)
    })

    return () => {
      unsubscribeProgress()
      unsubscribeStats()
    }
  }, [])

  // Utility functions
  const getTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + file.originalSize, 0)
  }, [files])

  const getCompletedFiles = useCallback(() => {
    return files.filter(f => f.status === 'complete')
  }, [files])

  const getFailedFiles = useCallback(() => {
    return files.filter(f => f.status === 'error')
  }, [files])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all preview URLs
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return {
    // File management
    files,
    addFiles,
    removeFile,
    clearFiles,
    clearCompleted,
    
    // Upload control
    startUploads,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    
    // Progress tracking
    overallProgress: queueStats.overallProgress,
    queueStats,
    isUploading,
    hasActiveUploads: uploadQueue.hasActiveUploads(),
    
    // Dropzone
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    
    // Utilities
    getTotalSize,
    getCompletedFiles,
    getFailedFiles,
    retryFailedUploads
  }
}
