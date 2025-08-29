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
  ArrowPathIcon,
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

interface MessageTabsProps {
  refreshTrigger: number
  onMessageUpdate: () => void
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected'

const tabs = [
  { id: 'all' as TabType, label: 'All Messages', icon: '📋' },
  { id: 'pending' as TabType, label: 'Pending', icon: '⏳' },
  { id: 'approved' as TabType, label: 'Approved', icon: '✅' },
  { id: 'rejected' as TabType, label: 'Rejected', icon: '❌' },
]

export function MessageTabs({
  refreshTrigger,
  onMessageUpdate,
}: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string
    type: 'image' | 'video'
    title?: string
  } | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { toast } = useToast()
  const { user } = useAdminAuth()
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchMessages()
  }, [activeTab, refreshTrigger])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when tab changes
  }, [activeTab])

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
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query

      if (error) throw error

      const filteredMessages: MessageWithMedia[] = (data || []).map(message => ({
        ...message,
        media_files: message.media_files || []
      }))

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
      const response = await fetch('/api/admin/messages/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
  const handleMediaClick = (url: string, fileType: string, title?: string) => {
    // Convert file type to simple image/video format
    const type = fileType.startsWith('image/') || fileType === 'image' ? 'image' : 'video'
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

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMessages = messages.slice(startIndex, endIndex)
  const totalPages = Math.ceil(messages.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20">
        <div className="flex border-b border-soft-pink/20">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-soft-pink border-b-2 border-soft-pink bg-soft-pink/5'
                  : 'text-charcoal-black/70 hover:text-charcoal-black hover:bg-soft-pink/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="p-4 border-b border-soft-pink/20">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg font-semibold text-charcoal-black">
              {tabs.find(t => t.id === activeTab)?.label} ({messages.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages()}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-soft-pink/20">
        {loading ? (
          <div className="p-6">
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
        ) : paginatedMessages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">
              No messages found
            </h3>
            <p className="text-charcoal-black/60">
              {activeTab === 'all' 
                ? 'No messages have been submitted yet.'
                : `No ${activeTab} messages found.`
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {paginatedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20 hover:border-soft-pink/40 transition-all duration-200"
                    style={{
                      boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-soft-pink to-soft-pink/60 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {message.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-charcoal-black">
                              {message.name}
                            </h4>
                            <p className="text-sm text-charcoal-black/60">
                              {message.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(message)}
                            <span className="text-xs text-charcoal-black/50">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        {message.location && (
                          <div className="flex items-center space-x-1 mb-2">
                            <MapPinIcon className="w-4 h-4 text-charcoal-black/40" />
                            <span className="text-sm text-charcoal-black/60">
                              {message.location}
                            </span>
                          </div>
                        )}

                        {/* Message Text */}
                        <p className="text-charcoal-black mb-4 leading-relaxed">
                          {message.message}
                        </p>

                        {/* Media Files */}
                        {message.media_files && message.media_files.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <PhotoIcon className="w-4 h-4 text-charcoal-black/40" />
                              <span className="text-sm text-charcoal-black/60">
                                {message.media_files.length} file(s) attached
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.media_files.slice(0, 3).map((file) => {
                                const mediaUrl = getMediaUrl(file.storage_path)
                                return (
                                  <motion.button
                                    key={file.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMediaClick(mediaUrl, file.file_type, file.file_name)}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-soft-pink/20 hover:border-soft-pink/40 transition-colors"
                                  >
                                    {file.file_type.startsWith('image/') || file.file_type === 'image' ? (
                                      <img
                                        src={mediaUrl}
                                        alt={file.file_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-soft-pink/10 flex items-center justify-center">
                                        <PhotoIcon className="w-6 h-6 text-soft-pink" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                      <EyeIcon className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                    </div>
                                  </motion.button>
                                )
                              })}
                              {message.media_files.length > 3 && (
                                <div className="w-16 h-16 rounded-lg border border-soft-pink/20 bg-soft-pink/5 flex items-center justify-center">
                                  <span className="text-xs text-charcoal-black/60">
                                    +{message.media_files.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {message.status === 'pending' && (
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              onClick={() => handleApproval(message.id, true)}
                              disabled={processingIds.has(message.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(message.id, false)}
                              disabled={processingIds.has(message.id)}
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {messages.length > itemsPerPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-soft-pink/20"
          style={{
            boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-charcoal-black/60">
                Showing {startIndex + 1} to {Math.min(endIndex, messages.length)} of {messages.length} messages
              </p>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="appearance-none bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-charcoal-black focus:border-soft-pink focus:outline-none transition-all duration-200"
                  style={{
                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-charcoal-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl hover:text-soft-pink hover:border-soft-pink/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                }}
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-soft-pink text-white border-2 border-soft-pink shadow-lg'
                          : 'text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 hover:text-soft-pink hover:border-soft-pink/40'
                      }`}
                      style={{
                        boxShadow: currentPage === pageNumber
                          ? '2px 2px 8px rgba(0, 0, 0, 0.2)'
                          : '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-charcoal-black bg-white/60 backdrop-blur-sm border-2 border-soft-pink/20 rounded-xl hover:text-soft-pink hover:border-soft-pink/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Media Lightbox */}
      {lightboxMedia && (
        <MediaPopup
          media={lightboxMedia}
          isOpen={!!lightboxMedia}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  )
}
