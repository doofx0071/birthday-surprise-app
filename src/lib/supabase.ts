import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton client instance for browser/frontend use with SSR support
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createSupabaseClient = () => {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabaseClient
}

// Legacy client for backward compatibility - use singleton pattern
export const supabase = createSupabaseClient()

// Admin client for server-side operations (with service role key)
// Only create this on the server side where the service role key is available
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types matching the updated schema
export interface Message {
  id: string
  name: string
  email: string
  location?: string // Legacy field, kept for backward compatibility
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
  message: string
  wants_reminders: boolean
  status: 'pending' | 'approved' | 'rejected' // Legacy field
  is_approved: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
  ip_address?: string
  user_agent?: string
}

export interface MessageInsert {
  name: string
  email: string
  location?: string // Legacy field
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
  message: string
  wants_reminders?: boolean
  ip_address?: string
  user_agent?: string
}

export interface MediaFile {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  thumbnail_path?: string
  created_at: string
}

export interface MediaFileInsert {
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  thumbnail_path?: string
}

export interface EmailNotification {
  id: string
  email: string
  notification_type: string
  scheduled_for: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

// Message operations
export const messageOperations = {
  // Insert a new message
  async create(data: MessageInsert): Promise<Message> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to save message: ${error.message}`)
    }

    return message
  },

  // Get all approved messages
  async getApproved(): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('is_approved', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return messages || []
  },

  // Get message by ID
  async getById(id: string): Promise<Message | null> {
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Database error:', error)
      throw new Error(`Failed to fetch message: ${error.message}`)
    }

    return message
  },

  // Update message approval status (admin only)
  async updateApproval(id: string, is_approved: boolean, is_visible: boolean = true): Promise<Message> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .update({ is_approved, is_visible })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to update message: ${error.message}`)
    }

    return message
  },

  // Legacy method for backward compatibility
  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Message> {
    const is_approved = status === 'approved'
    const is_visible = status !== 'rejected'
    return this.updateApproval(id, is_approved, is_visible)
  },

  // Delete message (admin only)
  async delete(id: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  },

  // Get message statistics using direct queries (more reliable than RPC)
  async getStats(): Promise<{
    total_messages: number
    total_countries: number
    total_media: number
    latest_message: string | null
    pending_messages: number
    total_with_reminders: number
  }> {
    try {
      // Get total messages
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      if (messagesError) throw messagesError

      // Get total countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('messages')
        .select('location_country')
        .not('location_country', 'is', null)

      if (countriesError) throw countriesError

      const uniqueCountries = new Set(countriesData?.map((m: any) => m.location_country) || [])

      // Get total media files
      const { count: totalMedia, error: mediaError } = await supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true })

      if (mediaError) throw mediaError

      // Get latest message
      const { data: latestData, error: latestError } = await supabase
        .from('messages')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      if (latestError) throw latestError

      // Get pending messages
      const { count: pendingMessages, error: pendingError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (pendingError) throw pendingError

      // Get messages with reminders
      const { count: withReminders, error: remindersError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('wants_reminders', true)

      if (remindersError) throw remindersError

      return {
        total_messages: totalMessages || 0,
        total_countries: uniqueCountries.size,
        total_media: totalMedia || 0,
        latest_message: latestData?.[0]?.created_at || null,
        pending_messages: pendingMessages || 0,
        total_with_reminders: withReminders || 0
      }
    } catch (error) {
      console.error('Database error:', error)

      // Provide more detailed error information
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Failed to fetch stats: ${(error as Error).message}`)
      } else if (error && typeof error === 'object' && 'code' in error) {
        throw new Error(`Failed to fetch stats: Database error code ${(error as any).code}`)
      } else {
        throw new Error(`Failed to fetch stats: ${JSON.stringify(error) || 'Unknown error'}`)
      }
    }
  },

  // Get messages by country
  async getMessagesByCountry(): Promise<Array<{ country: string; message_count: number }>> {
    const { data, error } = await supabase.rpc('get_messages_by_country')

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch messages by country: ${error.message}`)
    }

    return data || []
  },

  // Get recent messages with media information
  async getRecentWithMedia(limit: number = 10): Promise<Array<{
    id: string
    name: string
    message: string
    location_city: string | null
    location_country: string | null
    created_at: string
    media_count: number
    has_media: boolean
  }>> {
    const { data, error } = await supabase.rpc('get_recent_messages_with_media', { limit_count: limit })

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch recent messages: ${error.message}`)
    }

    return data || []
  }
}

// Media file operations
export const mediaOperations = {
  // Create a new media file record
  async create(data: MediaFileInsert): Promise<MediaFile> {
    const { data: mediaFile, error } = await supabase
      .from('media_files')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to save media file: ${error.message}`)
    }

    return mediaFile
  },

  // Get media files for a message
  async getByMessageId(messageId: string): Promise<MediaFile[]> {
    const { data: mediaFiles, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch media files: ${error.message}`)
    }

    return mediaFiles || []
  },

  // Delete a media file
  async delete(id: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('media_files')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to delete media file: ${error.message}`)
    }
  }
}

// Email notification operations
export const emailOperations = {
  // Schedule a birthday reminder
  async scheduleReminder(email: string, reminderDate: string): Promise<string> {
    const { data, error } = await supabase.rpc('schedule_birthday_reminder', {
      user_email: email,
      reminder_date: reminderDate
    })

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to schedule reminder: ${error.message}`)
    }

    return data
  },

  // Get pending notifications
  async getPending(): Promise<EmailNotification[]> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: notifications, error } = await supabaseAdmin
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch pending notifications: ${error.message}`)
    }

    return notifications || []
  },

  // Mark notification as sent
  async markAsSent(id: string): Promise<void> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to mark notification as sent: ${error.message}`)
    }
  }
}
