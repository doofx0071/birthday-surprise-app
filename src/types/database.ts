// Database types for the birthday surprise app
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: MessageUpdate
      }
      media_files: {
        Row: MediaFile
        Insert: MediaFileInsert
        Update: MediaFileUpdate
      }
      email_notifications: {
        Row: EmailNotification
        Insert: EmailNotificationInsert
        Update: EmailNotificationUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_message_stats: {
        Args: {}
        Returns: {
          total_messages: number
          total_countries: number
          total_media: number
          latest_message: string | null
          pending_messages: number
          total_with_reminders: number
        }
      }
      get_messages_by_country: {
        Args: {}
        Returns: Array<{
          country: string
          message_count: number
        }>
      }
      get_recent_messages_with_media: {
        Args: { limit_count?: number }
        Returns: Array<{
          id: string
          name: string
          message: string
          location_city: string | null
          location_country: string | null
          created_at: string
          media_count: number
          has_media: boolean
        }>
      }
      schedule_birthday_reminder: {
        Args: {
          user_email: string
          reminder_date: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Message types
export interface Message {
  id: string
  name: string
  email: string
  location?: string // Legacy field
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

export interface MessageUpdate {
  name?: string
  email?: string
  location?: string
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
  message?: string
  wants_reminders?: boolean
  is_approved?: boolean
  is_visible?: boolean
  ip_address?: string
  user_agent?: string
}

// Media file types
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

export interface MediaFileUpdate {
  message_id?: string
  file_name?: string
  file_type?: string
  file_size?: number
  storage_path?: string
  thumbnail_path?: string
}

// Email notification types
export interface EmailNotification {
  id: string
  email: string
  notification_type: string
  scheduled_for: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

export interface EmailNotificationInsert {
  email: string
  notification_type: string
  scheduled_for: string
  status?: 'pending' | 'sent' | 'failed'
}

export interface EmailNotificationUpdate {
  email?: string
  notification_type?: string
  scheduled_for?: string
  sent_at?: string
  status?: 'pending' | 'sent' | 'failed'
}

// Utility types
export type MessageStatus = 'pending' | 'approved' | 'rejected'
export type NotificationStatus = 'pending' | 'sent' | 'failed'
export type NotificationType = 'birthday_reminder' | 'new_message' | 'weekly_digest'

// Form data types for the frontend
export interface MessageFormData {
  name: string
  email: string
  message: string
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
  wants_reminders: boolean
}

export interface MessageWithMedia extends Message {
  media_files?: MediaFile[]
  media_count?: number
  has_media?: boolean
}

// Statistics types
export interface MessageStats {
  total_messages: number
  total_countries: number
  total_media: number
  latest_message: string | null
  pending_messages: number
  total_with_reminders: number
}

export interface CountryStats {
  country: string
  message_count: number
}

// Real-time subscription types
export interface RealtimeMessage {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Message
  old?: Message
}

export interface RealtimeMediaFile {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: MediaFile
  old?: MediaFile
}
