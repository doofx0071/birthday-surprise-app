import { UploadOptions, UploadProgress, MediaFileRecord } from '@/types/upload'

// Upload a file to Supabase Storage (Demo Mode)
export async function uploadFileToStorage(
  file: File,
  messageId: string,
  options: UploadOptions = {}
): Promise<{ url: string; thumbnailUrl?: string }> {
  const { onProgress, onError } = options

  try {
    // For now, simulate upload for demo purposes
    // TODO: Enable actual Supabase upload when storage bucket is set up
    console.log('Simulating file upload for demo purposes...')

    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        onProgress({
          loaded: (file.size * i) / 100,
          total: file.size,
          percentage: i
        })
      }
    }

    // Return mock URLs for demo
    const mockUrl = URL.createObjectURL(file)
    return {
      url: mockUrl,
      thumbnailUrl: file.type.startsWith('image/') ? mockUrl : undefined
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    if (onError) {
      onError(errorMessage)
    }
    throw new Error(errorMessage)
  }
}

// Temporary mock functions for demo purposes
export async function deleteFile(filePath: string, messageId: string) {
  console.log('Mock: File deletion simulated for demo')
}

export async function getMessageFiles(messageId: string): Promise<MediaFileRecord[]> {
  console.log('Mock: Returning empty file list for demo')
  return []
}
