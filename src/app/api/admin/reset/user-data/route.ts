import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/user-data - Reset all user-generated data
 */
export async function POST() {
  try {
    console.log('🔄 Starting user data reset...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'warning',
      category: 'admin',
      message: 'User data reset initiated',
      details: {
        action: 'reset_user_data',
        timestamp: new Date().toISOString(),
      }
    })

    // Get all media files for storage cleanup
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
        } else {
          console.log(`✅ Deleted ${filesToDelete.length} files from storage`)
        }
      }
    }

    // Delete user-generated data in the correct order (respecting foreign key constraints)
    const deletionOrder = [
      'media_files',
      'messages',
      'email_tracking',
      'email_batches', 
      'email_events',
      'notification_read_states',
      'email_notifications'
    ]

    for (const table of deletionOrder) {
      console.log(`🗑️ Deleting data from ${table}...`)
      
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        console.error(`Error deleting from ${table}:`, error)
        throw new Error(`Failed to delete from ${table}: ${error.message}`)
      }
    }

    // Clean up user-uploaded files and folders from storage
    try {
      console.log('🧹 Cleaning up storage folders...')
      
      const { data: folders, error: listError } = await supabase.storage
        .from('birthday-media')
        .list('', { limit: 1000 })

      if (!listError && folders) {
        for (const folder of folders) {
          if (folder.name !== 'temp' && folder.name !== '.emptyFolderPlaceholder') {
            // Delete message folders (these contain user uploads)
            const { data: folderContents } = await supabase.storage
              .from('birthday-media')
              .list(folder.name, { limit: 1000 })

            if (folderContents && folderContents.length > 0) {
              const filesToDelete = folderContents
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => `${folder.name}/${file.name}`)

              if (filesToDelete.length > 0) {
                await supabase.storage
                  .from('birthday-media')
                  .remove(filesToDelete)
              }
            }

            // Remove the folder itself
            await supabase.storage
              .from('birthday-media')
              .remove([folder.name])
          }
        }
      }
    } catch (cleanupError) {
      console.error('Error during storage cleanup:', cleanupError)
      // Don't fail the operation for cleanup errors
    }

    // Log successful completion
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'User data reset completed successfully',
      details: {
        action: 'reset_user_data_completed',
        timestamp: new Date().toISOString(),
      }
    })

    console.log('✅ User data reset completed successfully')

    return NextResponse.json({
      success: true,
      message: 'All user data has been successfully deleted. Admin accounts and system configuration preserved.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('User data reset failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'User data reset failed',
      details: {
        action: 'reset_user_data_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to reset user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
