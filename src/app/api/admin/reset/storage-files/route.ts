import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/storage-files - Clear all uploaded files from storage
 */
export async function POST() {
  try {
    console.log('🔄 Starting storage files cleanup...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'warning',
      category: 'admin',
      message: 'Storage files cleanup initiated',
      details: {
        action: 'reset_storage_files',
        timestamp: new Date().toISOString(),
      }
    })

    let deletedCount = 0

    // Get all non-temp files and folders
    const { data: allItems, error: listError } = await supabase.storage
      .from('birthday-media')
      .list('', { limit: 1000 })

    if (listError) {
      throw new Error(`Failed to list storage items: ${listError.message}`)
    }

    if (allItems && allItems.length > 0) {
      for (const item of allItems) {
        // Skip temp folder and placeholder files
        if (item.name === 'temp' || item.name === '.emptyFolderPlaceholder') {
          continue
        }

        console.log(`🗑️ Processing ${item.name}...`)

        // Delete files recursively
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

        const itemDeletedCount = await deleteRecursively(item.name)
        deletedCount += itemDeletedCount

        // Remove the top-level folder/file
        const { error: removeError } = await supabase.storage
          .from('birthday-media')
          .remove([item.name])

        if (removeError) {
          console.error(`Error removing ${item.name}:`, removeError)
        }
      }
    }

    // Update media_files table to mark files as deleted (optional - for data integrity)
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
      message: 'Storage files cleanup completed successfully',
      details: {
        action: 'reset_storage_files_completed',
        deletedCount,
        timestamp: new Date().toISOString(),
      }
    })

    console.log(`✅ Storage files cleanup completed. Deleted ${deletedCount} files.`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} files from storage. Temporary files preserved.`,
      deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Storage files cleanup failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'Storage files cleanup failed',
      details: {
        action: 'reset_storage_files_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to clear storage files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
