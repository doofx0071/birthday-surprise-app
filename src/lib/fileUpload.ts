import { supabase, getSupabaseAdmin } from './supabase'
import { UploadOptions, UploadProgress, MediaFileRecord } from '@/types/upload'

// Upload a file to Supabase Storage (Temporary - Phase 1)
export async function uploadFileToStorage(
  file: File,
  tempId: string,
  options: UploadOptions = {}
): Promise<{ url: string; thumbnailUrl?: string; tempPath: string; fileInfo: any }> {
  const { onProgress, onError } = options

  try {
    // Generate unique file name in temporary folder
    const fileExt = file.name.split('.').pop()
    const fileName = `temp/${tempId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

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

    // Generate thumbnail for images (also in temp folder)
    let thumbnailPath: string | undefined
    let thumbnailUrl: string | undefined
    if (file.type.startsWith('image/')) {
      thumbnailPath = await generateImageThumbnail(file, tempId, true) // true = temporary
      if (thumbnailPath) {
        const { data: urlData } = supabase.storage
          .from('birthday-media')
          .getPublicUrl(thumbnailPath)
        thumbnailUrl = urlData.publicUrl
      }
    }

    // Return file info without saving to database yet
    const fileInfo = {
      file_name: file.name,
      file_type: file.type.startsWith('image/') ? 'image' : 'video',
      file_size: file.size,
      storage_path: data.path,
      thumbnail_path: thumbnailPath  // Store path, not URL
    }

    return {
      url: publicUrl,
      thumbnailUrl,
      tempPath: data.path,
      fileInfo
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    if (onError) {
      onError(errorMessage)
    }
    throw new Error(errorMessage)
  }
}

// Finalize uploads when message is submitted (Phase 2)
export async function finalizeUploads(
  tempFiles: Array<{ tempPath: string; fileInfo: any; thumbnailUrl?: string }>,
  realMessageId: string
): Promise<void> {
  console.log(`🔄 Starting finalization of ${tempFiles.length} files for message ${realMessageId}`)

  try {
    // Use admin client for file operations
    const supabaseAdmin = getSupabaseAdmin()

    for (let i = 0; i < tempFiles.length; i++) {
      const tempFile = tempFiles[i]
      console.log(`📁 Processing file ${i + 1}/${tempFiles.length}:`, tempFile.fileInfo.file_name)

      // Move file from temp to permanent location
      const fileExt = tempFile.fileInfo.file_name.split('.').pop()
      const newPath = `${realMessageId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      console.log(`🚚 Moving file from ${tempFile.tempPath} to ${newPath}`)

      // Move the file using admin client
      const { error: moveError } = await supabaseAdmin.storage
        .from('birthday-media')
        .move(tempFile.tempPath, newPath)

      if (moveError) {
        console.error('❌ Failed to move file:', moveError)
        continue // Skip this file but continue with others
      }

      console.log('✅ File moved successfully')

      // Move thumbnail if exists
      let newThumbnailPath: string | undefined
      if (tempFile.fileInfo.thumbnail_path) {
        const thumbExt = 'jpg'
        newThumbnailPath = `${realMessageId}/thumbnails/${Date.now()}_thumb.${thumbExt}`

        console.log(`🖼️ Moving thumbnail from ${tempFile.fileInfo.thumbnail_path} to ${newThumbnailPath}`)

        const { error: thumbMoveError } = await supabaseAdmin.storage
          .from('birthday-media')
          .move(tempFile.fileInfo.thumbnail_path, newThumbnailPath)

        if (thumbMoveError) {
          console.error('❌ Failed to move thumbnail:', thumbMoveError)
        } else {
          console.log('✅ Thumbnail moved successfully')
        }
      }

      // Save to database with real message ID
      console.log('💾 Saving file record to database...')

      try {
        await saveFileRecord({
          message_id: realMessageId,
          file_name: tempFile.fileInfo.file_name,
          file_type: tempFile.fileInfo.file_type,
          file_size: tempFile.fileInfo.file_size,
          storage_path: newPath,
          thumbnail_path: newThumbnailPath
        })
        console.log('✅ File record saved to database')
      } catch (dbError) {
        console.error('❌ Failed to save file record to database:', dbError)
        throw dbError
      }
    }

    console.log(`🎉 Successfully finalized ${tempFiles.length} files!`)
  } catch (error) {
    console.error('Failed to finalize uploads:', error)
    throw error
  }
}

// Generate thumbnail for images - returns storage path, not URL
async function generateImageThumbnail(file: File, messageId: string, isTemporary: boolean = false): Promise<string | undefined> {
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
              // Upload thumbnail (to temp or permanent location)
              const thumbFileName = isTemporary
                ? `temp/${messageId}/thumbnails/${Date.now()}_thumb.jpg`
                : `${messageId}/thumbnails/${Date.now()}_thumb.jpg`
              const { data, error } = await supabase.storage
                .from('birthday-media')
                .upload(thumbFileName, blob, {
                  cacheControl: '3600',
                  upsert: false
                })

              if (!error && data) {
                // Return the storage path, not the URL
                // The URL can be generated later when needed
                resolve(data.path)
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
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
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

// Clean up temporary files older than 24 hours
export async function cleanupTempFiles(): Promise<void> {
  try {
    const { data: files, error } = await supabase.storage
      .from('birthday-media')
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (error || !files) {
      console.error('Failed to list temp files:', error)
      return
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const filesToDelete: string[] = []

    files.forEach(file => {
      if (file.created_at && new Date(file.created_at) < oneDayAgo) {
        filesToDelete.push(`temp/${file.name}`)
      }
    })

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('birthday-media')
        .remove(filesToDelete)

      if (deleteError) {
        console.error('Failed to delete temp files:', deleteError)
      } else {
        console.log(`Cleaned up ${filesToDelete.length} temporary files`)
      }
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

// Cancel temporary uploads (when user navigates away without submitting)
export async function cancelTempUploads(tempId: string): Promise<void> {
  try {
    const { data: files, error } = await supabase.storage
      .from('birthday-media')
      .list(`temp/${tempId}`, {
        limit: 100
      })

    if (error || !files) {
      return
    }

    const filesToDelete = files.map(file => `temp/${tempId}/${file.name}`)

    if (filesToDelete.length > 0) {
      await supabase.storage
        .from('birthday-media')
        .remove(filesToDelete)
    }
  } catch (error) {
    console.error('Failed to cancel temp uploads:', error)
  }
}
