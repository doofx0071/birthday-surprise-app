// File upload types for the Birthday Surprise App

export interface UploadFile {
  id: string
  file: File
  preview?: string
  status: UploadStatus
  progress: number
  error?: string
  uploadedUrl?: string
  thumbnailUrl?: string
}

export type UploadStatus = 
  | 'pending'     // File selected, waiting to upload
  | 'uploading'   // Currently uploading
  | 'complete'    // Successfully uploaded
  | 'error'       // Upload failed
  | 'cancelled'   // User cancelled upload

export interface FileValidationConfig {
  images: {
    types: string[]
    maxSize: number
    maxFiles: number
  }
  videos: {
    types: string[]
    maxSize: number
    maxFiles: number
  }
}

export interface FileValidationError {
  code: string
  message: string
  file: File
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed?: number // bytes per second
  timeRemaining?: number // seconds
}

export interface UploadOptions {
  messageId?: string
  onProgress?: (progress: UploadProgress) => void
  onComplete?: (url: string, thumbnailUrl?: string) => void
  onError?: (error: string) => void
}

export interface FileUploadHookReturn {
  files: UploadFile[]
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean
  getRootProps: () => any
  getInputProps: () => any
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  uploadFiles: (messageId: string) => Promise<void>
  isUploading: boolean
  uploadProgress: number
}

// Supabase Storage types
export interface StorageUploadResult {
  data: {
    path: string
    id: string
    fullPath: string
  } | null
  error: Error | null
}

export interface MediaFileRecord {
  id: string
  message_id: string
  file_name: string
  file_type: 'image' | 'video'
  file_size: number
  storage_path: string
  thumbnail_path?: string
  created_at: string
}
