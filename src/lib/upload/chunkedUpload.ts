/**
 * Chunked Upload System
 * Handles large file uploads by breaking them into smaller chunks
 */

import { supabase } from '@/lib/supabase'

export interface ChunkInfo {
  index: number
  start: number
  end: number
  size: number
  blob: Blob
}

export interface ChunkedUploadSession {
  sessionId: string
  fileName: string
  totalChunks: number
  chunkSize: number
  totalSize: number
  uploadedChunks: Set<number>
  chunks: ChunkInfo[]
}

export interface ChunkUploadProgress {
  chunkIndex: number
  chunkProgress: number
  overallProgress: number
  uploadedChunks: number
  totalChunks: number
}

/**
 * Create chunks from a file
 */
export function createChunks(file: File, chunkSize: number = 2 * 1024 * 1024): ChunkInfo[] {
  const chunks: ChunkInfo[] = []
  let start = 0
  let index = 0

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)
    
    chunks.push({
      index,
      start,
      end,
      size: end - start,
      blob
    })

    start = end
    index++
  }

  return chunks
}

/**
 * Create a chunked upload session
 */
export function createChunkedUploadSession(
  file: File, 
  chunkSize: number = 2 * 1024 * 1024
): ChunkedUploadSession {
  const chunks = createChunks(file, chunkSize)
  const sessionId = `upload-${Date.now()}-${Math.random().toString(36).substring(2)}`

  return {
    sessionId,
    fileName: file.name,
    totalChunks: chunks.length,
    chunkSize,
    totalSize: file.size,
    uploadedChunks: new Set(),
    chunks
  }
}

/**
 * Upload a single chunk
 */
export async function uploadChunk(
  session: ChunkedUploadSession,
  chunkIndex: number,
  basePath: string,
  signal?: AbortSignal
): Promise<string> {
  const chunk = session.chunks[chunkIndex]
  if (!chunk) {
    throw new Error(`Chunk ${chunkIndex} not found`)
  }

  const chunkPath = `${basePath}.chunk.${chunkIndex.toString().padStart(4, '0')}`
  
  const { data, error } = await supabase.storage
    .from('birthday-media')
    .upload(chunkPath, chunk.blob, {
      cacheControl: '3600',
      upsert: true // Allow overwrite for retry scenarios
    })

  if (error) {
    throw new Error(`Failed to upload chunk ${chunkIndex}: ${error.message}`)
  }

  session.uploadedChunks.add(chunkIndex)
  return chunkPath
}

/**
 * Upload all chunks with progress tracking
 */
export async function uploadChunks(
  session: ChunkedUploadSession,
  basePath: string,
  onProgress?: (progress: ChunkUploadProgress) => void,
  signal?: AbortSignal,
  maxConcurrentChunks: number = 3
): Promise<string[]> {
  const chunkPaths: string[] = new Array(session.totalChunks)
  const uploadPromises: Promise<void>[] = []
  let activeUploads = 0
  let completedChunks = 0

  return new Promise((resolve, reject) => {
    const uploadNextChunk = async () => {
      // Find next chunk to upload
      const nextChunkIndex = session.chunks.findIndex((_, index) => 
        !session.uploadedChunks.has(index) && !chunkPaths[index]
      )

      if (nextChunkIndex === -1) {
        // No more chunks to upload
        if (activeUploads === 0) {
          resolve(chunkPaths.filter(Boolean))
        }
        return
      }

      if (signal?.aborted) {
        reject(new Error('Upload cancelled'))
        return
      }

      activeUploads++

      try {
        const chunkPath = await uploadChunk(session, nextChunkIndex, basePath, signal)
        chunkPaths[nextChunkIndex] = chunkPath
        completedChunks++

        // Report progress
        if (onProgress) {
          const overallProgress = Math.round((completedChunks / session.totalChunks) * 100)
          onProgress({
            chunkIndex: nextChunkIndex,
            chunkProgress: 100,
            overallProgress,
            uploadedChunks: completedChunks,
            totalChunks: session.totalChunks
          })
        }

        activeUploads--

        // Continue uploading if there are more chunks and we haven't reached the limit
        if (activeUploads < maxConcurrentChunks) {
          uploadNextChunk()
        }

        // Check if all chunks are uploaded
        if (completedChunks === session.totalChunks) {
          resolve(chunkPaths)
        }

      } catch (error) {
        activeUploads--
        reject(error)
      }
    }

    // Start initial uploads
    for (let i = 0; i < Math.min(maxConcurrentChunks, session.totalChunks); i++) {
      uploadNextChunk()
    }
  })
}

/**
 * Assemble chunks into final file
 */
export async function assembleChunks(
  chunkPaths: string[],
  finalPath: string,
  session: ChunkedUploadSession
): Promise<string> {
  try {
    // Download all chunks
    const chunkBlobs: Blob[] = []
    
    for (let i = 0; i < chunkPaths.length; i++) {
      const chunkPath = chunkPaths[i]
      if (!chunkPath) {
        throw new Error(`Missing chunk ${i}`)
      }

      const { data, error } = await supabase.storage
        .from('birthday-media')
        .download(chunkPath)

      if (error) {
        throw new Error(`Failed to download chunk ${i}: ${error.message}`)
      }

      chunkBlobs.push(data)
    }

    // Combine chunks into final blob
    const finalBlob = new Blob(chunkBlobs)
    
    // Verify file size
    if (finalBlob.size !== session.totalSize) {
      throw new Error(`File size mismatch: expected ${session.totalSize}, got ${finalBlob.size}`)
    }

    // Upload final file
    const { data, error } = await supabase.storage
      .from('birthday-media')
      .upload(finalPath, finalBlob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload final file: ${error.message}`)
    }

    // Clean up chunk files
    await cleanupChunks(chunkPaths)

    return finalPath

  } catch (error) {
    // Clean up chunks on failure
    await cleanupChunks(chunkPaths)
    throw error
  }
}

/**
 * Clean up temporary chunk files
 */
export async function cleanupChunks(chunkPaths: string[]): Promise<void> {
  try {
    const validPaths = chunkPaths.filter(Boolean)
    if (validPaths.length === 0) return

    const { error } = await supabase.storage
      .from('birthday-media')
      .remove(validPaths)

    if (error) {
      console.warn('Failed to clean up chunks:', error)
    }
  } catch (error) {
    console.warn('Error during chunk cleanup:', error)
  }
}

/**
 * Resume a chunked upload session
 */
export async function resumeChunkedUpload(
  session: ChunkedUploadSession,
  basePath: string
): Promise<void> {
  // Check which chunks already exist
  const existingChunks = new Set<number>()

  for (let i = 0; i < session.totalChunks; i++) {
    const chunkPath = `${basePath}.chunk.${i.toString().padStart(4, '0')}`
    
    try {
      const { data, error } = await supabase.storage
        .from('birthday-media')
        .list('', { 
          search: chunkPath.split('/').pop() 
        })

      if (!error && data && data.length > 0) {
        existingChunks.add(i)
        session.uploadedChunks.add(i)
      }
    } catch (error) {
      // Chunk doesn't exist, will be uploaded
    }
  }

  console.log(`Resuming upload: ${existingChunks.size}/${session.totalChunks} chunks already uploaded`)
}

/**
 * Get upload progress for a session
 */
export function getSessionProgress(session: ChunkedUploadSession): ChunkUploadProgress {
  const uploadedChunks = session.uploadedChunks.size
  const overallProgress = Math.round((uploadedChunks / session.totalChunks) * 100)

  return {
    chunkIndex: -1, // Not applicable for overall progress
    chunkProgress: 100,
    overallProgress,
    uploadedChunks,
    totalChunks: session.totalChunks
  }
}

/**
 * Estimate optimal chunk size based on file size and connection
 */
export function getOptimalChunkSize(fileSize: number, connectionSpeed?: number): number {
  // Base chunk sizes
  const MIN_CHUNK_SIZE = 512 * 1024 // 512KB
  const MAX_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
  const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

  // For small files, don't chunk
  if (fileSize < MIN_CHUNK_SIZE * 2) {
    return fileSize
  }

  // Adjust based on file size
  let chunkSize = DEFAULT_CHUNK_SIZE

  if (fileSize > 100 * 1024 * 1024) { // > 100MB
    chunkSize = 5 * 1024 * 1024 // 5MB chunks
  } else if (fileSize > 500 * 1024 * 1024) { // > 500MB
    chunkSize = MAX_CHUNK_SIZE // 10MB chunks
  }

  // Adjust based on connection speed if available
  if (connectionSpeed) {
    // Aim for chunks that take 5-10 seconds to upload
    const targetUploadTime = 7 // seconds
    const estimatedChunkSize = connectionSpeed * targetUploadTime

    chunkSize = Math.max(
      MIN_CHUNK_SIZE,
      Math.min(MAX_CHUNK_SIZE, estimatedChunkSize)
    )
  }

  return Math.floor(chunkSize)
}
