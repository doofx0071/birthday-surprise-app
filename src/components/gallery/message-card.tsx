'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MessageWithMedia } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPinIcon, CalendarIcon, ImageIcon, VideoIcon, ExpandIcon, ShrinkIcon } from 'lucide-react'
import Image from 'next/image'

export type ViewMode = 'grid' | 'list' | 'slideshow' | 'fullscreen'

interface MessageCardProps {
  message: MessageWithMedia
  viewMode: ViewMode
  onMediaClick: (url: string, type: 'image' | 'video', title?: string) => void
  className?: string
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  viewMode,
  onMediaClick,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get media stats
  const mediaStats = {
    images: message.media_files?.filter(f => f.file_type === 'image').length || 0,
    videos: message.media_files?.filter(f => f.file_type === 'video').length || 0,
  }

  // Determine card type
  const cardType = (() => {
    if (mediaStats.images > 0 && mediaStats.videos > 0) return 'mixed'
    if (mediaStats.images > 0) return 'image'
    if (mediaStats.videos > 0) return 'video'
    return 'text'
  })()

  // Get storage URL for media files
  const getMediaUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/birthday-media/${storagePath}`
  }

  // Truncate message for preview
  const truncateMessage = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'neuro-card overflow-hidden relative group cursor-pointer',
        'hover:shadow-lg transition-all duration-300',
        'border-l-4',
        cardType === 'text' && 'border-l-blue-400',
        cardType === 'image' && 'border-l-green-400',
        cardType === 'video' && 'border-l-purple-400',
        cardType === 'mixed' && 'border-l-pink-400',
        viewMode === 'list' && 'flex flex-row',
        className
      )}
    >
      {/* Celebratory shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                      transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Card Header */}
      <div className={cn(
        'p-4 relative',
        viewMode === 'list' && 'border-r border-gray-50'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                cardType === 'text' && 'bg-blue-400',
                cardType === 'image' && 'bg-green-400',
                cardType === 'video' && 'bg-purple-400',
                cardType === 'mixed' && 'bg-pink-400'
              )} />
              <h3 className="font-semibold text-charcoal-black text-sm font-body">
                {message.name}
              </h3>
              {cardType !== 'text' && (
                <Badge variant="secondary" className="text-xs neuro-card px-2 py-0.5">
                  {cardType === 'mixed' ? 'Mixed' : cardType === 'image' ? 'Photo' : 'Video'}
                </Badge>
              )}
            </div>
            
            {/* Location */}
            {(message.location_city || message.location_country || message.location) && (
              <div className="flex items-center gap-1 text-xs text-charcoal-black/60 mb-2">
                <div className="neuro-card px-2 py-1 rounded-full flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3 text-pink-500" />
                  <span className="font-body">
                    {message.location_city && message.location_country
                      ? `${message.location_city}, ${message.location_country}`
                      : message.location || 'Unknown Location'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-charcoal-black/60">
              <div className="neuro-card px-2 py-1 rounded-full flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-pink-500" />
                <span className="font-body">{formatDate(message.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Media count indicator */}
          {(mediaStats.images > 0 || mediaStats.videos > 0) && (
            <div className="flex items-center gap-2">
              {mediaStats.images > 0 && (
                <div className="neuro-card px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                  <ImageIcon className="w-3 h-3 text-green-500" />
                  <span className="font-body text-charcoal-black/70">{mediaStats.images}</span>
                </div>
              )}
              {mediaStats.videos > 0 && (
                <div className="neuro-card px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                  <VideoIcon className="w-3 h-3 text-purple-500" />
                  <span className="font-body text-charcoal-black/70">{mediaStats.videos}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Preview */}
      {message.media_files && message.media_files.length > 0 && (
        <div className={cn(
          'mb-4',
          viewMode === 'list' && 'md:w-1/3 md:mb-0'
        )}>
          <div className={cn(
            'grid gap-2 p-4',
            message.media_files.length === 1 && 'grid-cols-1',
            message.media_files.length === 2 && 'grid-cols-2',
            message.media_files.length >= 3 && 'grid-cols-2 md:grid-cols-3'
          )}>
            {message.media_files.slice(0, viewMode === 'grid' ? 4 : 6).map((file, index) => (
              <div
                key={file.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group
                          neuro-card hover:scale-105 transition-all duration-300"
                onClick={() => onMediaClick(
                  getMediaUrl(file.storage_path),
                  file.file_type as 'image' | 'video',
                  `${message.name}'s ${file.file_type}`
                )}
              >
                {file.file_type === 'image' ? (
                  <>
                    {!imageError[file.id] ? (
                      <Image
                        src={file.thumbnail_path ? getMediaUrl(file.thumbnail_path) : getMediaUrl(file.storage_path)}
                        alt={`Media from ${message.name}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={() => setImageError(prev => ({ ...prev, [file.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                    {file.thumbnail_path && !imageError[file.id] ? (
                      <Image
                        src={getMediaUrl(file.thumbnail_path)}
                        alt={`Video thumbnail from ${message.name}`}
                        fill
                        className="object-cover"
                        onError={() => setImageError(prev => ({ ...prev, [file.id]: true }))}
                      />
                    ) : (
                      <VideoIcon className="h-8 w-8 text-white" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show count if more files */}
                {index === 3 && message.media_files && message.media_files.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{message.media_files.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'p-4',
        viewMode === 'list' && 'flex-1'
      )}>
        <div className="space-y-3">
          {/* Message text */}
          <div className="text-charcoal-black/80 text-sm leading-relaxed font-body
                          p-3 neuro-card bg-gradient-to-br from-white to-pink-50/30 rounded-lg">
            {isExpanded || viewMode === 'fullscreen'
              ? message.message
              : truncateMessage(message.message)
            }
          </div>

          {/* Expand/Collapse button */}
          {message.message.length > 150 && viewMode !== 'fullscreen' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              {isExpanded ? (
                <>
                  <ShrinkIcon className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ExpandIcon className="w-3 h-3 mr-1" />
                  Read more
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
