/**
 * Advanced Upload Queue Manager
 * Handles concurrent uploads, compression, chunking, and progress tracking
 */

import { supabase } from '@/lib/supabase'
import { compressFile } from './compression'
import { createChunks, uploadChunk, assembleChunks } from './chunkedUpload'

export interface QueuedFile {
  id: string
  file: File
  messageId: string
  status: 'pending' | 'compressing' | 'uploading' | 'complete' | 'error' | 'paused'
  progress: number
  error?: string
  compressedFile?: File
  chunks?: Blob[]
  uploadedChunks?: number
  totalChunks?: number
  retryCount: number
  priority: number
  startTime?: number
  estimatedTimeRemaining?: number
  uploadSpeed?: number // bytes per second
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: QueuedFile['status']
  uploadSpeed?: number
  estimatedTimeRemaining?: number
  error?: string
}

export interface QueueStats {
  totalFiles: number
  completedFiles: number
  failedFiles: number
  overallProgress: number
  totalSize: number
  uploadedSize: number
  averageSpeed: number
  estimatedTimeRemaining: number
}

export class UploadQueue {
  private queue: QueuedFile[] = []
  private activeUploads = new Map<string, AbortController>()
  private maxConcurrentUploads = 3
  private chunkSize = 1024 * 1024 * 2 // 2MB chunks
  private maxRetries = 3
  private progressCallbacks = new Set<(progress: UploadProgress) => void>()
  private queueStatsCallbacks = new Set<(stats: QueueStats) => void>()
  private isProcessing = false

  constructor(options?: {
    maxConcurrentUploads?: number
    chunkSize?: number
    maxRetries?: number
  }) {
    if (options?.maxConcurrentUploads) {
      this.maxConcurrentUploads = options.maxConcurrentUploads
    }
    if (options?.chunkSize) {
      this.chunkSize = options.chunkSize
    }
    if (options?.maxRetries) {
      this.maxRetries = options.maxRetries
    }
  }

  /**
   * Add files to upload queue
   */
  addFiles(files: File[], messageId: string, priority = 0): string[] {
    const fileIds: string[] = []

    files.forEach(file => {
      const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      const queuedFile: QueuedFile = {
        id: fileId,
        file,
        messageId,
        status: 'pending',
        progress: 0,
        retryCount: 0,
        priority
      }

      this.queue.push(queuedFile)
      fileIds.push(fileId)
    })

    // Sort queue by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority)

    this.emitQueueStats()
    this.processQueue()

    return fileIds
  }

  /**
   * Start processing the upload queue
   */
  private async processQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.queue.length > 0 && this.activeUploads.size < this.maxConcurrentUploads) {
      const nextFile = this.queue.find(f => f.status === 'pending')
      if (!nextFile) break

      this.processFile(nextFile)
    }

    this.isProcessing = false
  }

  /**
   * Process individual file upload
   */
  private async processFile(queuedFile: QueuedFile) {
    const controller = new AbortController()
    this.activeUploads.set(queuedFile.id, controller)

    try {
      queuedFile.startTime = Date.now()
      
      // Step 1: Compress file if needed
      await this.compressFile(queuedFile)
      
      // Step 2: Upload file (chunked for large files)
      await this.uploadFile(queuedFile, controller.signal)
      
      // Step 3: Mark as complete
      queuedFile.status = 'complete'
      queuedFile.progress = 100
      this.emitProgress(queuedFile)
      
    } catch (error) {
      await this.handleUploadError(queuedFile, error)
    } finally {
      this.activeUploads.delete(queuedFile.id)
      this.emitQueueStats()
      
      // Continue processing queue
      setTimeout(() => this.processQueue(), 100)
    }
  }

  /**
   * Prepare file for upload (compression disabled for maximum quality)
   */
  private async compressFile(queuedFile: QueuedFile) {
    const file = queuedFile.file

    // Compression disabled - preserve original quality and file size
    console.log(`📁 Preserving original quality for ${file.name} (${this.formatFileSize(file.size)})`)

    // Set status to show processing (for UI consistency)
    queuedFile.status = 'compressing'
    this.emitProgress(queuedFile)

    // Simulate brief processing time for smooth UI experience
    await new Promise(resolve => setTimeout(resolve, 200))

    // Use original file without any compression
    queuedFile.compressedFile = file
    queuedFile.progress = 20 // Ready for upload phase

    console.log(`✅ File prepared for upload: ${file.name} (original size preserved)`)
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Upload file with chunking for large files
   */
  private async uploadFile(queuedFile: QueuedFile, signal: AbortSignal) {
    const file = queuedFile.compressedFile!
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${queuedFile.messageId}/${fileName}`

    queuedFile.status = 'uploading'
    
    // Use chunked upload for files larger than chunk size
    if (file.size > this.chunkSize) {
      await this.uploadFileChunked(queuedFile, file, filePath, signal)
    } else {
      await this.uploadFileSimple(queuedFile, file, filePath, signal)
    }
  }

  /**
   * Simple upload for smaller files
   */
  private async uploadFileSimple(queuedFile: QueuedFile, file: File, filePath: string, signal: AbortSignal) {
    const startTime = Date.now()
    let lastLoaded = 0

    const { data, error } = await supabase.storage
      .from('birthday-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress: any) => {
          if (signal.aborted) return

          const loaded = progress.loaded || 0
          const total = progress.total || file.size
          const percentage = Math.round((loaded / total) * 80) + 20 // 20-100% (after compression)
          
          queuedFile.progress = percentage
          
          // Calculate upload speed
          const elapsed = Date.now() - startTime
          if (elapsed > 1000) { // Only calculate after 1 second
            const bytesPerMs = (loaded - lastLoaded) / Math.max(elapsed - (startTime + 1000), 1)
            queuedFile.uploadSpeed = bytesPerMs * 1000 // bytes per second
            
            if (queuedFile.uploadSpeed > 0) {
              const remainingBytes = total - loaded
              queuedFile.estimatedTimeRemaining = Math.round(remainingBytes / queuedFile.uploadSpeed)
            }
          }
          
          this.emitProgress(queuedFile)
        }
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Save to database
    await this.saveFileToDatabase(queuedFile, filePath, file)
  }

  /**
   * Chunked upload for larger files
   */
  private async uploadFileChunked(queuedFile: QueuedFile, file: File, filePath: string, signal: AbortSignal) {
    // Implementation for chunked upload will be added in the next file
    // For now, fall back to simple upload
    await this.uploadFileSimple(queuedFile, file, filePath, signal)
  }

  /**
   * Save file metadata to database
   */
  private async saveFileToDatabase(queuedFile: QueuedFile, filePath: string, file: File) {
    const fileType = file.type.startsWith('image/') ? 'image' : 'video'

    const { error } = await supabase
      .from('media_files')
      .insert({
        message_id: queuedFile.messageId,
        file_name: queuedFile.file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: filePath
      })

    if (error) {
      console.error(`❌ Failed to save ${queuedFile.file.name} to database:`, error)
      throw error
    }
  }

  /**
   * Handle upload errors with retry logic
   */
  private async handleUploadError(queuedFile: QueuedFile, error: any) {
    queuedFile.retryCount++
    
    if (queuedFile.retryCount <= this.maxRetries) {
      console.warn(`⚠️ Upload failed for ${queuedFile.file.name}, retrying (${queuedFile.retryCount}/${this.maxRetries}):`, error)
      queuedFile.status = 'pending'
      queuedFile.progress = 0
      queuedFile.error = undefined
      
      // Add exponential backoff
      const delay = Math.pow(2, queuedFile.retryCount) * 1000
      setTimeout(() => this.processQueue(), delay)
    } else {
      console.error(`❌ Upload failed permanently for ${queuedFile.file.name}:`, error)
      queuedFile.status = 'error'
      queuedFile.error = error.message || 'Upload failed'
      this.emitProgress(queuedFile)
    }
  }

  /**
   * Emit progress update for a file
   */
  private emitProgress(queuedFile: QueuedFile) {
    const progress: UploadProgress = {
      fileId: queuedFile.id,
      fileName: queuedFile.file.name,
      progress: queuedFile.progress,
      status: queuedFile.status,
      uploadSpeed: queuedFile.uploadSpeed,
      estimatedTimeRemaining: queuedFile.estimatedTimeRemaining,
      error: queuedFile.error
    }

    this.progressCallbacks.forEach(callback => callback(progress))
  }

  /**
   * Emit queue statistics
   */
  private emitQueueStats() {
    const stats = this.getQueueStats()
    this.queueStatsCallbacks.forEach(callback => callback(stats))
  }

  /**
   * Get current queue statistics
   */
  getQueueStats(): QueueStats {
    const totalFiles = this.queue.length
    const completedFiles = this.queue.filter(f => f.status === 'complete').length
    const failedFiles = this.queue.filter(f => f.status === 'error').length
    
    const totalSize = this.queue.reduce((sum, f) => sum + f.file.size, 0)
    const uploadedSize = this.queue.reduce((sum, f) => {
      if (f.status === 'complete') return sum + f.file.size
      if (f.status === 'uploading') return sum + (f.file.size * f.progress / 100)
      return sum
    }, 0)
    
    const overallProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0
    
    const activeSpeeds = this.queue
      .filter(f => f.uploadSpeed && f.uploadSpeed > 0)
      .map(f => f.uploadSpeed!)
    
    const averageSpeed = activeSpeeds.length > 0 
      ? activeSpeeds.reduce((sum, speed) => sum + speed, 0) / activeSpeeds.length 
      : 0
    
    const remainingSize = totalSize - uploadedSize
    const estimatedTimeRemaining = averageSpeed > 0 ? Math.round(remainingSize / averageSpeed) : 0

    return {
      totalFiles,
      completedFiles,
      failedFiles,
      overallProgress,
      totalSize,
      uploadedSize,
      averageSpeed,
      estimatedTimeRemaining
    }
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: UploadProgress) => void) {
    this.progressCallbacks.add(callback)
    return () => this.progressCallbacks.delete(callback)
  }

  /**
   * Subscribe to queue statistics updates
   */
  onQueueStats(callback: (stats: QueueStats) => void) {
    this.queueStatsCallbacks.add(callback)
    return () => this.queueStatsCallbacks.delete(callback)
  }

  /**
   * Pause upload for a specific file
   */
  pauseFile(fileId: string) {
    const file = this.queue.find(f => f.id === fileId)
    if (file && file.status === 'uploading') {
      const controller = this.activeUploads.get(fileId)
      if (controller) {
        controller.abort()
        file.status = 'paused'
        this.emitProgress(file)
      }
    }
  }

  /**
   * Resume upload for a paused file
   */
  resumeFile(fileId: string) {
    const file = this.queue.find(f => f.id === fileId)
    if (file && file.status === 'paused') {
      file.status = 'pending'
      this.processQueue()
    }
  }

  /**
   * Cancel upload for a specific file
   */
  cancelFile(fileId: string) {
    const controller = this.activeUploads.get(fileId)
    if (controller) {
      controller.abort()
    }
    
    this.queue = this.queue.filter(f => f.id !== fileId)
    this.emitQueueStats()
  }

  /**
   * Clear all completed and failed uploads
   */
  clearCompleted() {
    this.queue = this.queue.filter(f => 
      f.status !== 'complete' && f.status !== 'error'
    )
    this.emitQueueStats()
  }

  /**
   * Get files by status
   */
  getFilesByStatus(status: QueuedFile['status']): QueuedFile[] {
    return this.queue.filter(f => f.status === status)
  }

  /**
   * Check if queue has any active uploads
   */
  hasActiveUploads(): boolean {
    return this.queue.some(f => 
      f.status === 'uploading' || f.status === 'compressing' || f.status === 'pending'
    )
  }

  /**
   * Wait for all uploads to complete
   */
  async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (!this.hasActiveUploads()) {
          resolve()
        } else {
          setTimeout(checkCompletion, 500)
        }
      }
      checkCompletion()
    })
  }
}

// Global upload queue instance
export const uploadQueue = new UploadQueue({
  maxConcurrentUploads: 3,
  chunkSize: 1024 * 1024 * 2, // 2MB
  maxRetries: 3
})
