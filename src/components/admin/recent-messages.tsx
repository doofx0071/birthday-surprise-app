'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  PhotoIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { MessageWithMedia } from '@/types/database'

export function RecentMessages() {
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            media_files (*)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        const transformedMessages: MessageWithMedia[] = (data || []).map(message => ({
          ...message,
          media_files: message.media_files || []
        }))

        setMessages(transformedMessages)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch recent messages:', err)
        setError('Failed to load recent messages')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel('admin-recent-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchRecentMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusBadge = (message: MessageWithMedia) => {
    if (message.is_approved === false) {
      return <Badge variant="destructive">Rejected</Badge>
    } else if (message.is_approved === true) {
      return <Badge variant="default">Approved</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Recent Messages
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-soft-pink/20 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-soft-pink/20 rounded w-3/4"></div>
                  <div className="h-3 bg-soft-pink/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Recent Messages
        </h3>
        <div className="text-center py-8">
          <p className="text-charcoal-black/60">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          Recent Messages
        </h3>
        <Link href="/admin/messages">
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-charcoal-black/30 mx-auto mb-3" />
            <p className="text-charcoal-black/60">No messages yet</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-soft-pink/5 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-soft-pink to-rose-gold rounded-lg flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-charcoal-black truncate">
                    {message.name}
                  </p>
                  {getStatusBadge(message)}
                </div>
                
                <p className="text-sm text-charcoal-black/70 line-clamp-2 mb-2">
                  {message.message}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-charcoal-black/50">
                  <span>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  
                  {message.location && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{message.location}</span>
                    </div>
                  )}
                  
                  {message.media_files && message.media_files.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <PhotoIcon className="w-3 h-3" />
                      <span>{message.media_files.length} file{message.media_files.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
