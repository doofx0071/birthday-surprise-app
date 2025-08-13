import { FileValidationConfig, FileValidationError } from '@/types/upload'

// File validation configuration
export const FILE_VALIDATION_CONFIG: FileValidationConfig = {
  images: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10
  },
  videos: {
    types: ['video/mp4', 'video/webm', 'video/mov'],
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 3
  }
}

// Get all accepted file types for react-dropzone
export const getAcceptedFileTypes = () => {
  const acceptedTypes: Record<string, string[]> = {}
  
  // Add image types
  FILE_VALIDATION_CONFIG.images.types.forEach(type => {
    const extension = getFileExtension(type)
    acceptedTypes[type] = extension ? [extension] : []
  })
  
  // Add video types
  FILE_VALIDATION_CONFIG.videos.types.forEach(type => {
    const extension = getFileExtension(type)
    acceptedTypes[type] = extension ? [extension] : []
  })
  
  return acceptedTypes
}

// Get file extension from MIME type
function getFileExtension(mimeType: string): string | null {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/mov': '.mov'
  }
  
  return extensions[mimeType] || null
}

// Validate a single file
export function validateFile(file: File): FileValidationError | null {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  
  if (!isImage && !isVideo) {
    return {
      code: 'file-invalid-type',
      message: 'Only images and videos are allowed',
      file
    }
  }
  
  const config = isImage ? FILE_VALIDATION_CONFIG.images : FILE_VALIDATION_CONFIG.videos
  
  // Check file type
  if (!config.types.includes(file.type)) {
    const allowedTypes = config.types.map(type => getFileExtension(type)).join(', ')
    return {
      code: 'file-invalid-type',
      message: `File type not supported. Allowed types: ${allowedTypes}`,
      file
    }
  }
  
  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024))
    return {
      code: 'file-too-large',
      message: `File is too large. Maximum size: ${maxSizeMB}MB`,
      file
    }
  }
  
  return null
}

// Validate multiple files
export function validateFiles(files: File[]): {
  validFiles: File[]
  errors: FileValidationError[]
} {
  const validFiles: File[] = []
  const errors: FileValidationError[] = []
  
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  const videoFiles = files.filter(f => f.type.startsWith('video/'))
  
  // Check total file limits
  if (imageFiles.length > FILE_VALIDATION_CONFIG.images.maxFiles) {
    errors.push({
      code: 'too-many-images',
      message: `Too many images. Maximum: ${FILE_VALIDATION_CONFIG.images.maxFiles}`,
      file: imageFiles[0] // Use first file as reference
    })
  }
  
  if (videoFiles.length > FILE_VALIDATION_CONFIG.videos.maxFiles) {
    errors.push({
      code: 'too-many-videos',
      message: `Too many videos. Maximum: ${FILE_VALIDATION_CONFIG.videos.maxFiles}`,
      file: videoFiles[0] // Use first file as reference
    })
  }
  
  // Validate each file individually
  files.forEach(file => {
    const error = validateFile(file)
    if (error) {
      errors.push(error)
    } else {
      validFiles.push(file)
    }
  })
  
  return { validFiles, errors }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file type category
export function getFileTypeCategory(file: File): 'image' | 'video' | 'unknown' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'unknown'
}

// Generate file preview URL
export function generatePreviewUrl(file: File): string | null {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file)
  }
  return null
}

// Custom validator for react-dropzone
export function createFileValidator() {
  return (file: File) => {
    const error = validateFile(file)
    return error ? { code: error.code, message: error.message } : null
  }
}
