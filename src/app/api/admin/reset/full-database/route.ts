import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/full-database - Reset all data except admin authentication and system configuration
 */
export async function POST() {
  try {
    console.log('🔄 Starting full database reset...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'warning',
      category: 'admin',
      message: 'Full database reset initiated',
      details: {
        action: 'reset_full_database',
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

    // Delete all files from storage
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

    // Delete all data except admin_users and system_configurations
    // Order matters due to foreign key constraints
    const tablesToReset = [
      'media_files',
      'messages', 
      'email_tracking',
      'email_batches',
      'email_events',
      'email_templates',
      'notification_read_states',
      'email_notifications',
      'system_logs' // Reset logs last, but preserve the current operation log
    ]

    for (const table of tablesToReset) {
      console.log(`🗑️ Deleting data from ${table}...`)
      
      if (table === 'system_logs') {
        // For system logs, keep only the current reset operation log
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('message', 'Full database reset initiated')
          .neq('message', 'Full database reset completed successfully')

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
          throw new Error(`Failed to delete from ${table}: ${error.message}`)
        }
      } else {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
          throw new Error(`Failed to delete from ${table}: ${error.message}`)
        }
      }
    }

    // Clean up all storage except temp folder structure
    try {
      console.log('🧹 Performing complete storage cleanup...')
      
      const { data: allItems, error: listError } = await supabase.storage
        .from('birthday-media')
        .list('', { limit: 1000 })

      if (!listError && allItems) {
        for (const item of allItems) {
          if (item.name !== '.emptyFolderPlaceholder') {
            // Delete everything recursively
            const deleteRecursively = async (path: string) => {
              const { data: contents } = await supabase.storage
                .from('birthday-media')
                .list(path, { limit: 1000 })

              if (contents && contents.length > 0) {
                const filesToDelete = contents
                  .filter(file => file.name !== '.emptyFolderPlaceholder')
                  .map(file => path ? `${path}/${file.name}` : file.name)

                if (filesToDelete.length > 0) {
                  await supabase.storage
                    .from('birthday-media')
                    .remove(filesToDelete)
                }
              }
            }

            await deleteRecursively(item.name)
            
            // Remove the top-level item
            await supabase.storage
              .from('birthday-media')
              .remove([item.name])
          }
        }
      }

      // Recreate the temp folder structure
      const { error: tempFolderError } = await supabase.storage
        .from('birthday-media')
        .upload('temp/.emptyFolderPlaceholder', new Blob([''], { type: 'text/plain' }), {
          upsert: true
        })

      if (tempFolderError) {
        console.error('Error recreating temp folder:', tempFolderError)
      }
    } catch (cleanupError) {
      console.error('Error during complete storage cleanup:', cleanupError)
      // Don't fail the operation for cleanup errors
    }

    // Log successful completion
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Full database reset completed successfully',
      details: {
        action: 'reset_full_database_completed',
        timestamp: new Date().toISOString(),
        preserved: ['admin_users', 'system_configurations']
      }
    })

    console.log('✅ Full database reset completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Full database reset completed. Admin accounts and system configuration preserved.',
      timestamp: new Date().toISOString(),
      preserved: ['Admin accounts', 'System configuration'],
    })
  } catch (error) {
    console.error('Full database reset failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'Full database reset failed',
      details: {
        action: 'reset_full_database_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to perform full database reset',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
