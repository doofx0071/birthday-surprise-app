'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  type: 'message' | 'upload' | 'system' | 'email'
  title: string
  description: string
  time: string
  unread: boolean
  data: any
  createdAt: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  currentPage: number
  totalPages: number
  itemsPerPage: number
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readStates, setReadStates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Calculate pagination
  const totalPages = Math.ceil(notifications.length / itemsPerPage)
  const unreadCount = notifications.filter(n => n.unread).length

  // Fetch notification read states from database
  const fetchReadStates = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('notification_read_states')
        .select('notification_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching read states:', error)
        return
      }

      const readIds = new Set(data?.map((item: any) => item.notification_id) || [])
      setReadStates(readIds)
    } catch (error) {
      console.error('Error fetching read states:', error)
    }
  }, [user])

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      
      // Get recent messages (last 30 days)
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, name, email, location, created_at, status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      // Get recent media uploads (last 30 days)
      const { data: recentMedia } = await supabase
        .from('media_files')
        .select('id, file_name, file_type, created_at, message_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      // Get recent system logs (last 7 days)
      const { data: recentLogs } = await supabase
        .from('system_logs')
        .select('id, level, category, message, created_at, details')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      // Get recent email activity (last 30 days)
      const { data: recentEmails } = await supabase
        .from('email_tracking')
        .select('id, email_type, recipient_email, sent_at, delivered, opened, clicked')
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('sent_at', { ascending: false })

      // Transform data into notification format
      const allNotifications: Notification[] = []

      // Add message notifications
      recentMessages?.forEach((message: any) => {
        const notificationId = `message-${message.id}`
        allNotifications.push({
          id: notificationId,
          type: 'message',
          title: 'New Message Received',
          description: `${message.name} (${message.email}) from ${message.location || 'Unknown location'}`,
          time: formatTimeAgo(message.created_at),
          unread: !readStates.has(notificationId),
          data: message,
          createdAt: new Date(message.created_at)
        })
      })

      // Add media upload notifications
      recentMedia?.forEach((media: any) => {
        const notificationId = `media-${media.id}`
        allNotifications.push({
          id: notificationId,
          type: 'upload',
          title: 'Media File Uploaded',
          description: `${media.file_name} (${media.file_type})`,
          time: formatTimeAgo(media.created_at),
          unread: !readStates.has(notificationId),
          data: media,
          createdAt: new Date(media.created_at)
        })
      })

      // Add system log notifications
      recentLogs?.forEach((log: any) => {
        const notificationId = `log-${log.id}`
        allNotifications.push({
          id: notificationId,
          type: 'system',
          title: `System ${log.level.toUpperCase()}`,
          description: log.message,
          time: formatTimeAgo(log.created_at),
          unread: !readStates.has(notificationId),
          data: log,
          createdAt: new Date(log.created_at)
        })
      })

      // Add email notifications
      recentEmails?.forEach((email: any) => {
        const notificationId = `email-${email.id}`
        const status = email.clicked ? 'clicked' : email.opened ? 'opened' : email.delivered ? 'delivered' : 'sent'
        allNotifications.push({
          id: notificationId,
          type: 'email',
          title: `Email ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          description: `${email.email_type} to ${email.recipient_email}`,
          time: formatTimeAgo(email.sent_at),
          unread: !readStates.has(notificationId),
          data: email,
          createdAt: new Date(email.sent_at)
        })
      })

      // Sort by creation time
      allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setNotifications(allNotifications)
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, readStates, toast])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return

    try {
      const supabase = createSupabaseClient()
      
      // Get notification type from ID
      const notification = notifications.find(n => n.id === notificationId)
      if (!notification) return

      // Insert read state into database
      const { error } = await supabase
        .from('notification_read_states')
        .upsert({
          user_id: user.id,
          notification_id: notificationId,
          notification_type: notification.type,
          read_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // Update local state
      setReadStates(prev => new Set([...prev, notificationId]))
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, unread: false } : n
        )
      )

    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user, notifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const supabase = createSupabaseClient()
      
      // Get all unread notification IDs
      const unreadNotifications = notifications.filter(n => n.unread)
      
      if (unreadNotifications.length === 0) return

      // Insert read states for all unread notifications
      const readStatesData = unreadNotifications.map(notification => ({
        user_id: user.id,
        notification_id: notification.id,
        notification_type: notification.type,
        read_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('notification_read_states')
        .upsert(readStatesData)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      // Update local state
      const newReadIds = unreadNotifications.map(n => n.id)
      setReadStates(prev => new Set([...prev, ...newReadIds]))
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      })

    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive'
      })
    }
  }, [user, notifications, toast])

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  // Fetch read states and notifications when user changes
  useEffect(() => {
    if (user) {
      fetchReadStates()
    }
  }, [user, fetchReadStates])

  useEffect(() => {
    if (user && readStates.size >= 0) {
      fetchNotifications()
    }
  }, [user, readStates, fetchNotifications])

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user, fetchNotifications])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    itemsPerPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    setCurrentPage,
    setItemsPerPage,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
