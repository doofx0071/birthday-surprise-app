'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhotoIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { MessageWithMedia } from '@/types/database'
import { getMediaUrl } from '@/lib/gallery-utils'
import { MediaPopup } from '@/components/admin/media-popup'
import { cn } from '@/lib/utils'

interface MessageApprovalProps {
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected'
  searchQuery: string
  refreshTrigger: number
  onMessageUpdate: () => void
}

export function MessageApproval({
  filterStatus,
  searchQuery,
  refreshTrigger,
  onMessageUpdate,
}: MessageApprovalProps) {
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string
    type: 'image' | 'video'
    title?: string
  } | null>(null)
  const { toast } = useToast()
  const { user } = useAdminAuth()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchMessages()
  }, [filterStatus, searchQuery, refreshTrigger])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('messages')
        .select(`
          *,
          media_files (*)
        `)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending') {
          query = query.eq('status', 'pending')
        } else if (filterStatus === 'approved') {
          query = query.eq('status', 'approved')
        } else if (filterStatus === 'rejected') {
          query = query.eq('status', 'rejected')
        }
      }

      const { data, error } = await query

      if (error) throw error

      let filteredMessages: MessageWithMedia[] = (data || []).map((message: any) => ({
        ...message,
        media_files: message.media_files || []
      }))

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredMessages = filteredMessages.filter((message: any) =>
          message.name.toLowerCase().includes(query) ||
          message.email.toLowerCase().includes(query) ||
          message.message.toLowerCase().includes(query) ||
          (message.location && message.location.toLowerCase().includes(query))
        )
      }

      setMessages(filteredMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (messageId: string, approved: boolean) => {
    setProcessingIds(prev => new Set(prev).add(messageId))

    try {
      console.log('Admin approval - context user check:', {
        contextUser: user?.email,
        contextUserRole: (user as any)?.user_metadata?.role || (user as any)?.app_metadata?.role,
        hasContextUser: !!user
      })

      const response = await fetch('/api/admin/messages/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          messageId,
          approved,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update message status')
      }

      toast({
        title: 'Success',
        description: `Message ${approved ? 'approved' : 'rejected'} successfully`,
      })

      onMessageUpdate()
      fetchMessages()
    } catch (error) {
      console.error('Failed to update message:', error)
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  // Handle media click for lightbox
  const handleMediaClick = (url: string, type: 'image' | 'video', title?: string) => {
    setLightboxMedia({ url, type, title })
  }

  const getStatusBadge = (message: MessageWithMedia) => {
    if (message.status === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    } else if (message.status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-soft-pink/5">
                <div className="w-12 h-12 bg-soft-pink/20 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-soft-pink/20 rounded w-1/4"></div>
                  <div className="h-3 bg-soft-pink/20 rounded w-3/4"></div>
                  <div className="h-3 bg-soft-pink/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20">
      <div className="p-6 border-b border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          Messages ({messages.length})
        </h3>
      </div>

      <div className="divide-y divide-soft-pink/20">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-12 h-12 text-charcoal-black/30 mx-auto mb-3" />
              <p className="text-charcoal-black/60">No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 hover:bg-soft-pink/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-charcoal-black">
                          {message.name}
                        </h4>
                        {getStatusBadge(message)}
                      </div>
                      <span className="text-sm text-charcoal-black/50">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Message Content */}
                    <p className="text-charcoal-black/80 mb-3 leading-relaxed">
                      {message.message}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-sm text-charcoal-black/60 mb-4">
                      <span>{message.email}</span>
                      
                      {message.location && (
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{message.location}</span>
                        </div>
                      )}
                      
                      {message.media_files && message.media_files.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <PhotoIcon className="w-4 h-4" />
                          <span>{message.media_files.length} file{message.media_files.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Media Files Display */}
                    {message.media_files && message.media_files.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-charcoal-black mb-2">
                          Attached Media ({message.media_files.length})
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {message.media_files.map((file, index) => (
                            <div
                              key={index}
                              className="relative group bg-soft-pink/5 rounded-lg overflow-hidden border border-soft-pink/20 hover:border-soft-pink/40 transition-colors"
                            >
                              {file.file_type === 'image' ? (
                                <div
                                  className="aspect-square relative cursor-pointer"
                                  onClick={() => handleMediaClick(
                                    getMediaUrl(file.storage_path),
                                    'image',
                                    `${file.file_name} - ${message.name}`
                                  )}
                                >
                                  <img
                                    src={getMediaUrl(file.storage_path)}
                                    alt={file.file_name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                      <svg className="w-4 h-4 text-charcoal-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : file.file_type === 'video' ? (
                                <div
                                  className="aspect-square relative bg-charcoal-black/10 cursor-pointer"
                                  onClick={() => handleMediaClick(
                                    getMediaUrl(file.storage_path),
                                    'video',
                                    `${file.file_name} - ${message.name}`
                                  )}
                                >
                                  <video
                                    src={getMediaUrl(file.storage_path)}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors group-hover:scale-110 transform duration-200">
                                      <svg className="w-6 h-6 text-charcoal-black" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="aspect-square flex items-center justify-center bg-soft-pink/10 cursor-pointer"
                                  onClick={() => handleMediaClick(
                                    getMediaUrl(file.storage_path),
                                    file.file_type === 'image' ? 'image' : 'video',
                                    `${file.file_name} - ${message.name}`
                                  )}
                                >
                                  <div className="text-center">
                                    <svg className="w-8 h-8 text-charcoal-black/40 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="text-xs text-charcoal-black/60 hover:text-soft-pink transition-colors">
                                      View File
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* File Info Overlay */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <p className="text-white text-xs truncate font-medium">
                                  {file.file_name}
                                </p>
                                <p className="text-white/80 text-xs">
                                  {file.file_type?.toUpperCase() || 'FILE'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {message.status === 'pending' && (
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(message.id, true)}
                          disabled={processingIds.has(message.id)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Approve</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(message.id, false)}
                          disabled={processingIds.has(message.id)}
                          className="flex items-center space-x-1"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Media Popup */}
      <MediaPopup
        media={lightboxMedia || { url: '', type: 'image' }}
        isOpen={!!lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  )
}
