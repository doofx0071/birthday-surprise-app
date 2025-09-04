import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/admin/reset/temp-files - Clear all temporary files from storage
 */
export async function POST() {
  try {
    console.log('🔄 Starting temporary files cleanup...')

    // Log the reset operation
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Temporary files cleanup initiated',
      details: {
        action: 'reset_temp_files',
        timestamp: new Date().toISOString(),
      }
    })

    let deletedCount = 0

    // Clean up temp folder
    const { data: tempContents, error: tempError } = await supabase.storage
      .from('birthday-media')
      .list('temp', { limit: 1000 })

    if (tempError) {
      console.error('Error listing temp folder:', tempError)
      throw new Error(`Failed to list temp folder: ${tempError.message}`)
    }

    if (tempContents && tempContents.length > 0) {
      console.log(`🗑️ Found ${tempContents.length} items in temp folder`)

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
            
            const fullPath = `${path}/${file.name}`
            
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

      // Process each item in temp folder
      for (const item of tempContents) {
        if (item.name === '.emptyFolderPlaceholder') continue

        const itemPath = `temp/${item.name}`
        
        if (item.metadata && item.metadata.size !== undefined) {
          // It's a file directly in temp folder
          const { error: deleteError } = await supabase.storage
            .from('birthday-media')
            .remove([itemPath])

          if (deleteError) {
            console.error(`Error deleting ${itemPath}:`, deleteError)
          } else {
            deletedCount++
          }
        } else {
          // It's a folder, delete recursively
          const folderDeletedCount = await deleteRecursively(itemPath)
          deletedCount += folderDeletedCount

          // Remove the folder itself
          const { error: removeFolderError } = await supabase.storage
            .from('birthday-media')
            .remove([itemPath])

          if (removeFolderError) {
            console.error(`Error removing folder ${itemPath}:`, removeFolderError)
          }
        }
      }
    }

    // Recreate the temp folder structure with placeholder
    const { error: recreateError } = await supabase.storage
      .from('birthday-media')
      .upload('temp/.emptyFolderPlaceholder', new Blob([''], { type: 'text/plain' }), {
        upsert: true
      })

    if (recreateError) {
      console.error('Error recreating temp folder structure:', recreateError)
      // Don't fail the operation for this
    }

    // Log successful completion
    await supabase.from('system_logs').insert({
      level: 'info',
      category: 'admin',
      message: 'Temporary files cleanup completed successfully',
      details: {
        action: 'reset_temp_files_completed',
        deletedCount,
        timestamp: new Date().toISOString(),
      }
    })

    console.log(`✅ Temporary files cleanup completed. Deleted ${deletedCount} files.`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} temporary files. Temp folder structure preserved.`,
      deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Temporary files cleanup failed:', error)

    // Log the error
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'admin',
      message: 'Temporary files cleanup failed',
      details: {
        action: 'reset_temp_files_failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json(
      { 
        error: 'Failed to clear temporary files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
