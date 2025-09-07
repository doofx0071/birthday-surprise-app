'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageWithMedia } from '@/types/database'

interface GalleryDataHook {
  messages: MessageWithMedia[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useGalleryData(limit: number = 20): GalleryDataHook {
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Fetch messages with media files
  const fetchMessages = useCallback(async (reset = false, currentOffset?: number) => {
    try {
      setLoading(true)
      setError(null)

      const useOffset = reset ? 0 : (currentOffset ?? offset)

      // Query messages with media files using Supabase's nested select
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
        .range(useOffset, useOffset + limit - 1)

      if (messagesError) {
        throw new Error(`Failed to fetch messages: ${messagesError.message}`)
      }

      // Transform the data to match our interface
      const transformedMessages: MessageWithMedia[] = (messagesData || []).map((message: any) => ({
        ...message,
        media_files: message.media_files || []
      }))

      if (reset) {
        setMessages(transformedMessages)
        setOffset(limit)
      } else {
        setMessages(prev => [...prev, ...transformedMessages])
        setOffset(prev => prev + limit)
      }

      // Check if there are more messages
      const totalCount = count || 0
      setHasMore(useOffset + limit < totalCount)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages'
      setError(errorMessage)
      console.error('Gallery data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchMessages(false, offset)
  }, [fetchMessages, hasMore, loading, offset])

  // Refetch messages (reset)
  const refetch = useCallback(async () => {
    setOffset(0)
    setHasMore(true)
    setError(null)
    await fetchMessages(true, 0)
  }, [fetchMessages])

  // Initial load
  useEffect(() => {
    fetchMessages(true, 0)
  }, [])

  // Set up real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('gallery-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: 'is_approved=eq.true,is_visible=eq.true'
        },
        () => {
          // Refetch when messages change
          fetchMessages(true, 0)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_files'
        },
        () => {
          // Refetch when media files change
          fetchMessages(true, 0)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    refetch,
    hasMore,
    loadMore
  }
}