import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/link-files
 * Link uploaded files to a message by updating storage paths and database records
 */
export async function POST(request: NextRequest) {
  try {
    const { messageId, tempMessageId } = await request.json()

    if (!messageId || !tempMessageId) {
      return NextResponse.json(
        { success: false, message: 'Missing messageId or tempMessageId' },
        { status: 400 }
      )
    }

    console.log(`🔗 Linking files from ${tempMessageId} to ${messageId}`)

    // 1. List files in the temp message directory
    const { data: files, error: listError } = await supabase.storage
      .from('birthday-media')
      .list(tempMessageId, { limit: 10 })

    if (listError) {
      console.error('Failed to list temp files:', listError)
      return NextResponse.json(
        { success: false, message: 'Failed to list temp files' },
        { status: 500 }
      )
    }

    if (!files || files.length === 0) {
      console.log('No files found to link')
      return NextResponse.json({
        success: true,
        message: 'No files to link',
        filesLinked: 0
      })
    }

    console.log(`📁 Found ${files.length} files to link`)

    let linkedCount = 0

    // 2. Move each file and create database records
    for (const file of files) {
      if (!file.name.includes('.')) continue // Skip directories

      const oldPath = `${tempMessageId}/${file.name}`
      const newPath = `${messageId}/${file.name}`

      try {
        // Move file in storage
        const { error: moveError } = await supabase.storage
          .from('birthday-media')
          .move(oldPath, newPath)

        if (moveError) {
          console.error(`Failed to move ${file.name}:`, moveError)
          continue
        }

        // Get public URL for new path
        const { data: { publicUrl } } = supabase.storage
          .from('birthday-media')
          .getPublicUrl(newPath)

        // Determine file type from name
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileType = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '') ? 'image' : 'video'

        // Create database record
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            message_id: messageId,
            file_name: file.name,
            file_type: fileType,
            file_size: 12345, // Placeholder - we don't have actual size
            storage_path: newPath,
            file_url: publicUrl,
            is_processed: true
          })

        if (dbError) {
          console.error(`Failed to save ${file.name} to database:`, dbError)
        } else {
          console.log(`✅ Linked ${file.name} to message ${messageId}`)
          linkedCount++
        }

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
      }
    }

    // 3. Clean up temp directory
    try {
      const { error: deleteError } = await supabase.storage
        .from('birthday-media')
        .remove([tempMessageId])
      
      if (deleteError) {
        console.log('Note: Could not clean up temp directory:', deleteError.message)
      }
    } catch (error) {
      console.log('Note: Could not clean up temp directory')
    }

    console.log(`🎉 Successfully linked ${linkedCount} files to message ${messageId}`)

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${linkedCount} files`,
      filesLinked: linkedCount
    })

  } catch (error) {
    console.error('Error linking files:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
