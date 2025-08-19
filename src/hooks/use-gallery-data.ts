'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageWithMedia } from '@/types/database'

interface UseGalleryDataReturn {
  messages: MessageWithMedia[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalCount: number
  hasMore: boolean
  loadMore: () => Promise<void>
}

interface UseGalleryDataOptions {
  limit?: number
  enableRealtime?: boolean
  autoLoad?: boolean
}

export const useGalleryData = (options: UseGalleryDataOptions = {}): UseGalleryDataReturn => {
  const {
    limit = 50,
    enableRealtime = true,
    autoLoad = true,
  } = options

  const [messages, setMessages] = useState<MessageWithMedia[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  // Fetch messages with media files
  const fetchMessages = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset

      // Query messages with media files using a join
      const { data: messagesData, error: messagesError, count } = await supabase
        .from('messages')
        .select(`
          *,
          media_files (
            id,
            message_id,
            file_name,
            file_type,
            file_size,
            storage_path,
            thumbnail_path,
            created_at
          )
        `, { count: 'exact' })
        .eq('is_approved', true)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1)

      if (messagesError) {
        throw new Error(`Failed to fetch messages: ${messagesError.message}`)
      }

      // Transform the data to match our interface
      const transformedMessages: MessageWithMedia[] = (messagesData || []).map(message => ({
        ...message,
        media_files: message.media_files || [],
        media_count: message.media_files?.length || 0,
        has_media: (message.media_files?.length || 0) > 0,
      }))

      if (reset) {
        setMessages(transformedMessages)
        setOffset(transformedMessages.length)
      } else {
        setMessages(prev => prev ? [...prev, ...transformedMessages] : transformedMessages)
        setOffset(prev => prev + transformedMessages.length)
      }

      setTotalCount(count || 0)
      setHasMore(transformedMessages.length === limit && (currentOffset + limit) < (count || 0))

    } catch (err) {
      console.error('Error fetching gallery data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load gallery data')
    } finally {
      setLoading(false)
    }
  }, [limit, offset])

  // Refetch data (reset)
  const refetch = useCallback(async () => {
    setOffset(0)
    await fetchMessages(true)
  }, [fetchMessages])

  // Load more data
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchMessages(false)
    }
  }, [fetchMessages, loading, hasMore])

  // Initial data load
  useEffect(() => {
    if (autoLoad) {
      fetchMessages(true)
    }
  }, [autoLoad]) // Only run on mount

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return

    // Subscribe to messages changes
    const messagesSubscription = supabase
      .channel('gallery-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: 'is_approved=eq.true,is_visible=eq.true',
        },
        (payload) => {
          console.log('Messages change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Add new message to the beginning of the list
            const newMessage = payload.new as MessageWithMedia
            setMessages(prev => prev ? [{ ...newMessage, media_files: [], media_count: 0, has_media: false }, ...prev] : null)
            setTotalCount(prev => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            // Update existing message
            const updatedMessage = payload.new as MessageWithMedia
            setMessages(prev => 
              prev ? prev.map(msg => 
                msg.id === updatedMessage.id 
                  ? { ...updatedMessage, media_files: msg.media_files, media_count: msg.media_count, has_media: msg.has_media }
                  : msg
              ) : null
            )
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted message
            const deletedMessage = payload.old as MessageWithMedia
            setMessages(prev => prev ? prev.filter(msg => msg.id !== deletedMessage.id) : null)
            setTotalCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    // Subscribe to media files changes
    const mediaSubscription = supabase
      .channel('gallery-media')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_files',
        },
        (payload) => {
          console.log('Media change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Add media file to corresponding message
            const newMedia = payload.new as any
            setMessages(prev => 
              prev ? prev.map(msg => {
                if (msg.id === newMedia.message_id) {
                  const updatedMediaFiles = [...(msg.media_files || []), newMedia]
                  return {
                    ...msg,
                    media_files: updatedMediaFiles,
                    media_count: updatedMediaFiles.length,
                    has_media: true,
                  }
                }
                return msg
              }) : null
            )
          } else if (payload.eventType === 'DELETE') {
            // Remove media file from corresponding message
            const deletedMedia = payload.old as any
            setMessages(prev => 
              prev ? prev.map(msg => {
                if (msg.id === deletedMedia.message_id) {
                  const updatedMediaFiles = (msg.media_files || []).filter(f => f.id !== deletedMedia.id)
                  return {
                    ...msg,
                    media_files: updatedMediaFiles,
                    media_count: updatedMediaFiles.length,
                    has_media: updatedMediaFiles.length > 0,
                  }
                }
                return msg
              }) : null
            )
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      messagesSubscription.unsubscribe()
      mediaSubscription.unsubscribe()
    }
  }, [enableRealtime])

  return {
    messages,
    loading,
    error,
    refetch,
    totalCount,
    hasMore,
    loadMore,
  }
}

// Hook for getting gallery statistics
export const useGalleryStats = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalMedia: 0,
    totalCountries: 0,
    totalContributors: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get message stats using the database function
      const { data: messageStats, error: statsError } = await supabase.rpc('get_message_stats')

      if (statsError) {
        throw new Error(`Failed to fetch stats: ${statsError.message}`)
      }

      // Get unique contributors count
      const { data: contributors, error: contributorsError } = await supabase
        .from('messages')
        .select('email')
        .eq('is_approved', true)
        .eq('is_visible', true)

      if (contributorsError) {
        throw new Error(`Failed to fetch contributors: ${contributorsError.message}`)
      }

      const uniqueContributors = new Set(contributors?.map(c => c.email) || []).size

      setStats({
        totalMessages: messageStats?.total_messages || 0,
        totalMedia: messageStats?.total_media || 0,
        totalCountries: messageStats?.total_countries || 0,
        totalContributors: uniqueContributors,
      })

    } catch (err) {
      console.error('Error fetching gallery stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load gallery stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
