import { supabase } from './supabase'
import { UploadOptions, UploadProgress, StorageUploadResult, MediaFileRecord } from '@/types/upload'

// Upload a file to Supabase Storage
export async function uploadFileToStorage(
  file: File,
  messageId: string,
  options: UploadOptions = {}
): Promise<{ url: string; thumbnailUrl?: string }> {
  const { onProgress, onError } = options
  
  try {
    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${messageId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('birthday-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const uploadProgress: UploadProgress = {
              loaded: progress.loaded || 0,
              total: progress.total || file.size,
              percentage: progress.total ? Math.round((progress.loaded || 0) / progress.total * 100) : 0
            }
            onProgress(uploadProgress)
          }
        }
      })
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('Upload failed: No data returned')
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('birthday-media')
      .getPublicUrl(data.path)
    
    const publicUrl = urlData.publicUrl
    
    // Generate thumbnail for images
    let thumbnailUrl: string | undefined
    if (file.type.startsWith('image/')) {
      thumbnailUrl = await generateImageThumbnail(file, messageId)
    } else if (file.type.startsWith('video/')) {
      thumbnailUrl = await generateVideoThumbnail(file, messageId)
    }
    
    // Save file record to database
    await saveFileRecord({
      message_id: messageId,
      file_name: file.name,
      file_type: file.type.startsWith('image/') ? 'image' : 'video',
      file_size: file.size,
      storage_path: data.path,
      thumbnail_path: thumbnailUrl
    })
    
    return { url: publicUrl, thumbnailUrl }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    if (onError) {
      onError(errorMessage)
    }
    throw new Error(errorMessage)
  }
}

// Generate thumbnail for images
async function generateImageThumbnail(file: File, messageId: string): Promise<string | undefined> {
  try {
    // Create canvas for thumbnail generation
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = async () => {
        // Calculate thumbnail dimensions (max 200x200)
        const maxSize = 200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              // Upload thumbnail
              const thumbFileName = `${messageId}/thumbnails/${Date.now()}_thumb.jpg`
              const { data, error } = await supabase.storage
                .from('birthday-media')
                .upload(thumbFileName, blob, {
                  cacheControl: '3600',
                  upsert: false
                })
              
              if (!error && data) {
                const { data: urlData } = supabase.storage
                  .from('birthday-media')
                  .getPublicUrl(data.path)
                resolve(urlData.publicUrl)
              } else {
                resolve(undefined)
              }
            } catch {
              resolve(undefined)
            }
          } else {
            resolve(undefined)
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.onerror = () => resolve(undefined)
      img.src = URL.createObjectURL(file)
    })
  } catch {
    return undefined
  }
}

// Generate thumbnail for videos (placeholder for now)
async function generateVideoThumbnail(file: File, messageId: string): Promise<string | undefined> {
  // For now, return undefined. In a full implementation, you would:
  // 1. Create a video element
  // 2. Seek to a specific time (e.g., 1 second)
  // 3. Draw the frame to a canvas
  // 4. Convert to blob and upload
  return undefined
}

// Save file record to database
async function saveFileRecord(record: Omit<MediaFileRecord, 'id' | 'created_at'>) {
  const { error } = await supabase
    .from('media_files')
    .insert([record])
  
  if (error) {
    console.error('Failed to save file record:', error)
    throw new Error(`Failed to save file record: ${error.message}`)
  }
}

// Delete file from storage and database
export async function deleteFile(filePath: string, messageId: string) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('birthday-media')
      .remove([filePath])
    
    if (storageError) {
      console.error('Failed to delete from storage:', storageError)
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('storage_path', filePath)
      .eq('message_id', messageId)
    
    if (dbError) {
      console.error('Failed to delete from database:', dbError)
    }
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

// Get files for a message
export async function getMessageFiles(messageId: string): Promise<MediaFileRecord[]> {
  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Failed to fetch message files:', error)
    return []
  }
  
  return data || []
}
