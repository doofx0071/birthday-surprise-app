import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/all-storage - Clear all files from storage bucket
 */
export async function POST() {
  try {
    console.log('🔄 Starting complete storage cleanup...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'warning',
      category: 'admin',
      message: 'Complete storage cleanup initiated',
      details: {
        action: 'reset_all_storage',
        timestamp: new Date().toISOString(),
      }
    })

    let deletedCount = 0

    // Get all items in the storage bucket
    const { data: allItems, error: listError } = await supabase.storage
      .from('birthday-media')
      .list('', { limit: 1000 })

    if (listError) {
      throw new Error(`Failed to list storage items: ${listError.message}`)
    }

    if (allItems && allItems.length > 0) {
      console.log(`🗑️ Found ${allItems.length} top-level items in storage`)

      const deleteRecursively = async (path: string): Promise<number> => {
        let count = 0
        
        const { data: contents, error } = await supabase.storage
          .from('birthday-media')
          .list(path, { limit: 1000 })

        if (error) {
          console.error(`Error listing contents of ${path}:`, error)
          return count
        }

        if (contents && contents.length > 0) {
          const filesToDelete: string[] = []
          
          for (const file of contents) {
            if (file.name === '.emptyFolderPlaceholder') continue
            
            const fullPath = path ? `${path}/${file.name}` : file.name
            
            if (file.metadata && file.metadata.size !== undefined) {
              // It's a file
              filesToDelete.push(fullPath)
              count++
            } else {
              // It's a folder, recurse
              count += await deleteRecursively(fullPath)
            }
          }

          // Delete all files in this directory
          if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
              .from('birthday-media')
              .remove(filesToDelete)

            if (deleteError) {
              console.error(`Error deleting files from ${path}:`, deleteError)
            } else {
              console.log(`✅ Deleted ${filesToDelete.length} files from ${path}`)
            }
          }
        }

        return count
      }

      // Process each top-level item
      for (const item of allItems) {
        if (item.name === '.emptyFolderPlaceholder') continue

        console.log(`🗑️ Processing ${item.name}...`)

        if (item.metadata && item.metadata.size !== undefined) {
          // It's a file at root level
          const { error: deleteError } = await supabase.storage
            .from('birthday-media')
            .remove([item.name])

          if (deleteError) {
            console.error(`Error deleting ${item.name}:`, deleteError)
          } else {
            deletedCount++
          }
        } else {
          // It's a folder, delete recursively
          const folderDeletedCount = await deleteRecursively(item.name)
          deletedCount += folderDeletedCount

          // Remove the folder itself
          const { error: removeFolderError } = await supabase.storage
            .from('birthday-media')
            .remove([item.name])

          if (removeFolderError) {
            console.error(`Error removing folder ${item.name}:`, removeFolderError)
          }
        }
      }
    }

    // Recreate the basic folder structure
    const { error: recreateTempError } = await supabase.storage
      .from('birthday-media')
      .upload('temp/.emptyFolderPlaceholder', new Blob([''], { type: 'text/plain' }), {
        upsert: true
      })

    if (recreateTempError) {
      console.error('Error recreating temp folder structure:', recreateTempError)
      // Don't fail the operation for this
    }

    // Update media_files table to clear all storage references
    const { error: updateError } = await supabase
      .from('media_files')
      .update({ 
        storage_path: null,
        thumbnail_path: null 
      })
      .not('storage_path', 'is', null)

    if (updateError) {
      console.error('Error updating media_files table:', updateError)
      // Don't fail the operation for this
    }

    // Log successful completion
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Complete storage cleanup completed successfully',
      details: {
        action: 'reset_all_storage_completed',
        deletedCount,
        timestamp: new Date().toISOString(),
      }
    })

    console.log(`✅ Complete storage cleanup completed. Deleted ${deletedCount} files.`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all ${deletedCount} files from storage. Basic folder structure recreated.`,
      deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Complete storage cleanup failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'Complete storage cleanup failed',
      details: {
        action: 'reset_all_storage_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to clear all storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
