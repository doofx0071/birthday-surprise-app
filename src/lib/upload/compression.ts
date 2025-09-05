/**
 * File Compression Utilities
 * Handles image and video compression to optimize upload performance
 */

export interface CompressionOptions {
  quality?: number // 0-1 for images, affects video quality
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png' | 'original'
  onProgress?: (progress: number) => void
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
    onProgress
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          
          if (width > height) {
            width = Math.min(width, maxWidth)
            height = width / aspectRatio
          } else {
            height = Math.min(height, maxHeight)
            width = height * aspectRatio
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)

        // Determine output format
        let mimeType = 'image/webp'
        let fileExtension = 'webp'
        
        if (format === 'jpeg' || (format === 'original' && file.type === 'image/jpeg')) {
          mimeType = 'image/jpeg'
          fileExtension = 'jpg'
        } else if (format === 'png' || (format === 'original' && file.type === 'image/png')) {
          mimeType = 'image/png'
          fileExtension = 'png'
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Create new file with compressed data
            const originalName = file.name.split('.').slice(0, -1).join('.')
            const compressedFile = new File(
              [blob], 
              `${originalName}.${fileExtension}`, 
              { type: mimeType }
            )

            if (onProgress) onProgress(100)
            resolve(compressedFile)
          },
          mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'))
    }

    // Start loading image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compress a video file (basic implementation)
 * Note: Full video compression requires more complex processing
 */
export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { onProgress } = options

  // For now, we'll implement a basic video optimization
  // In a production environment, you might want to use FFmpeg.wasm or similar
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    video.onloadedmetadata = () => {
      try {
        // For basic compression, we'll extract a frame and create a poster
        // This is a simplified approach - real video compression is more complex
        
        const { videoWidth, videoHeight } = video
        let { maxWidth = 1280, maxHeight = 720 } = options
        
        // Calculate dimensions maintaining aspect ratio
        let width = videoWidth
        let height = videoHeight
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          
          if (width > height) {
            width = Math.min(width, maxWidth)
            height = width / aspectRatio
          } else {
            height = Math.min(height, maxHeight)
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        // For now, just return the original file
        // Real video compression would require more sophisticated processing
        if (onProgress) onProgress(100)
        resolve(file)
        
      } catch (error) {
        reject(error)
      }
    }

    video.onerror = () => {
      reject(new Error('Failed to load video for compression'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Main compression function that handles both images and videos
 * COMPRESSION DISABLED: Returns original files to preserve maximum quality
 */
export async function compressFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { onProgress } = options

  // Compression disabled - return original file for maximum quality
  console.log(`📁 Preserving original quality for ${file.name} (${formatFileSize(file.size)})`)

  // Simulate processing time for UI consistency
  setTimeout(() => {
    if (onProgress) onProgress(100)
  }, 100)

  return Promise.resolve(file)
}

/**
 * Get optimal compression settings based on file size and type
 */
export function getOptimalCompressionSettings(file: File): CompressionOptions {
  const sizeInMB = file.size / (1024 * 1024)
  
  if (file.type.startsWith('image/')) {
    if (sizeInMB > 10) {
      // Large images - aggressive compression
      return {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'webp'
      }
    } else if (sizeInMB > 5) {
      // Medium images - moderate compression
      return {
        quality: 0.7,
        maxWidth: 2560,
        maxHeight: 1440,
        format: 'webp'
      }
    } else {
      // Small images - light compression
      return {
        quality: 0.8,
        maxWidth: 3840,
        maxHeight: 2160,
        format: 'webp'
      }
    }
  } else if (file.type.startsWith('video/')) {
    if (sizeInMB > 50) {
      // Large videos - more aggressive settings
      return {
        quality: 0.6,
        maxWidth: 1280,
        maxHeight: 720
      }
    } else if (sizeInMB > 20) {
      // Medium videos
      return {
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1080
      }
    } else {
      // Small videos - minimal compression
      return {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080
      }
    }
  }

  // Default settings
  return {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  }
}

/**
 * Estimate compression ratio for a file
 * COMPRESSION DISABLED: Always returns 1.0 (no compression)
 */
export function estimateCompressionRatio(file: File): number {
  // Compression disabled - files maintain original size
  return 1.0 // No compression for any file types
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Calculate compression savings
 */
export function calculateCompressionSavings(originalSize: number, compressedSize: number) {
  const savings = originalSize - compressedSize
  const percentage = Math.round((savings / originalSize) * 100)
  
  return {
    savedBytes: savings,
    savedPercentage: percentage,
    savedFormatted: formatFileSize(savings)
  }
}
