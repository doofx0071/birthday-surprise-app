import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/messages - Reset all messages and their media files
 */
export async function POST() {
  try {
    console.log('🔄 Starting messages reset...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'warning',
      category: 'admin',
      message: 'Messages reset initiated',
      details: {
        action: 'reset_messages',
        timestamp: new Date().toISOString(),
      }
    })

    // Get all media files associated with messages for storage cleanup
    const { data: mediaFiles, error: mediaError } = await supabase
      .from('media_files')
      .select('storage_path, thumbnail_path')

    if (mediaError) {
      console.error('Error fetching media files:', mediaError)
    }

    // Delete media files from storage
    if (mediaFiles && mediaFiles.length > 0) {
      console.log(`🗑️ Deleting ${mediaFiles.length} media files from storage...`)
      
      const filesToDelete: string[] = []
      mediaFiles.forEach(file => {
        if (file.storage_path) filesToDelete.push(file.storage_path)
        if (file.thumbnail_path) filesToDelete.push(file.thumbnail_path)
      })

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('birthday-media')
          .remove(filesToDelete)

        if (storageError) {
          console.error('Error deleting files from storage:', storageError)
          // Continue with database cleanup even if storage cleanup fails
        } else {
          console.log(`✅ Deleted ${filesToDelete.length} files from storage`)
        }
      }
    }

    // Delete media files from database (this will cascade due to foreign key constraints)
    const { error: mediaDbError } = await supabase
      .from('media_files')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (mediaDbError) {
      console.error('Error deleting media files from database:', mediaDbError)
      throw new Error(`Failed to delete media files: ${mediaDbError.message}`)
    }

    // Delete all messages (this should cascade to related data)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
      throw new Error(`Failed to delete messages: ${messagesError.message}`)
    }

    // Clean up any orphaned message folders in storage
    try {
      const { data: folders, error: listError } = await supabase.storage
        .from('birthday-media')
        .list('', { limit: 1000 })

      if (!listError && folders) {
        for (const folder of folders) {
          if (folder.name !== 'temp' && folder.name !== '.emptyFolderPlaceholder') {
            // Try to delete the folder (this will only work if it's empty or contains files)
            await supabase.storage
              .from('birthday-media')
              .remove([folder.name])
          }
        }
      }
    } catch (cleanupError) {
      console.error('Error during folder cleanup:', cleanupError)
      // Don't fail the operation for cleanup errors
    }

    // Log successful completion
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Messages reset completed successfully',
      details: {
        action: 'reset_messages_completed',
        timestamp: new Date().toISOString(),
      }
    })

    console.log('✅ Messages reset completed successfully')

    return NextResponse.json({
      success: true,
      message: 'All messages and media files have been successfully deleted',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Messages reset failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'Messages reset failed',
      details: {
        action: 'reset_messages_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to reset messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
