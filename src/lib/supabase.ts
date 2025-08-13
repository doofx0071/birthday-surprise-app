import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Message {
  id: string
  name: string
  email: string
  location?: string
  message: string
  wants_reminders: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  ip_address?: string
  user_agent?: string
}

export interface MessageInsert {
  name: string
  email: string
  location?: string
  message: string
  wants_reminders?: boolean
  ip_address?: string
  user_agent?: string
}

// Message operations
export const messageOperations = {
  // Insert a new message
  async create(data: MessageInsert): Promise<Message> {
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
      .eq('status', 'approved')
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

  // Update message status (admin only)
  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Message> {
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to update message: ${error.message}`)
    }

    return message
  },

  // Delete message (admin only)
  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  },

  // Get message statistics
  async getStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
  }> {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('status')

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }

    const stats = {
      total: data.length,
      pending: data.filter(m => m.status === 'pending').length,
      approved: data.filter(m => m.status === 'approved').length,
      rejected: data.filter(m => m.status === 'rejected').length
    }

    return stats
  }
}
