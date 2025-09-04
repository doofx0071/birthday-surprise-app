import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/reset/data-counts - Get counts of all data that can be reset
 */
export async function GET() {
  try {
    // Get counts from all relevant tables
    const [
      messagesResult,
      mediaFilesResult,
      emailTrackingResult,
      emailBatchesResult,
      emailTemplatesResult,
      systemLogsResult,
      notificationReadStatesResult,
      emailEventsResult,
    ] = await Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }),
      supabase.from('email_tracking').select('id', { count: 'exact', head: true }),
      supabase.from('email_batches').select('id', { count: 'exact', head: true }),
      supabase.from('email_templates').select('id', { count: 'exact', head: true }),
      supabase.from('system_logs').select('id', { count: 'exact', head: true }),
      supabase.from('notification_read_states').select('id', { count: 'exact', head: true }),
      supabase.from('email_events').select('id', { count: 'exact', head: true }),
    ])

    // Get storage file counts
    let storageFiles = 0
    let tempFiles = 0

    try {
      // List all files in the storage bucket
      const { data: allFiles, error: storageError } = await supabase.storage
        .from('birthday-media')
        .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

      if (!storageError && allFiles) {
        // Count files recursively
        const countFilesRecursively = async (path: string = ''): Promise<{ total: number; temp: number }> => {
          const { data: files, error } = await supabase.storage
            .from('birthday-media')
            .list(path, { limit: 1000 })

          if (error || !files) return { total: 0, temp: 0 }

          let total = 0
          let temp = 0

          for (const file of files) {
            if (file.name === '.emptyFolderPlaceholder') continue

            const fullPath = path ? `${path}/${file.name}` : file.name

            if (file.metadata && file.metadata.size !== undefined) {
              // It's a file
              total++
              if (fullPath.startsWith('temp/')) {
                temp++
              }
            } else {
              // It's a folder, recurse
              const subCounts = await countFilesRecursively(fullPath)
              total += subCounts.total
              temp += subCounts.temp
            }
          }

          return { total, temp }
        }

        const fileCounts = await countFilesRecursively()
        storageFiles = fileCounts.total - fileCounts.temp
        tempFiles = fileCounts.temp
      }
    } catch (storageError) {
      console.error('Error counting storage files:', storageError)
      // Continue with 0 counts if storage check fails
    }

    const dataCounts = {
      messages: messagesResult.count || 0,
      mediaFiles: mediaFilesResult.count || 0,
      emailTracking: emailTrackingResult.count || 0,
      emailBatches: emailBatchesResult.count || 0,
      emailTemplates: emailTemplatesResult.count || 0,
      systemLogs: systemLogsResult.count || 0,
      notificationReadStates: notificationReadStatesResult.count || 0,
      emailEvents: emailEventsResult.count || 0,
      storageFiles,
      tempFiles,
    }

    return NextResponse.json(dataCounts)
  } catch (error) {
    console.error('Error fetching data counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data counts' },
      { status: 500 }
    )
  }
}
