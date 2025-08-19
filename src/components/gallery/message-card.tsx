'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MessageWithMedia } from '@/types/database'
import { ViewMode } from './memory-gallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'
import { MapPinIcon, CalendarIcon, ImageIcon, VideoIcon, ExpandIcon, ShrinkIcon } from 'lucide-react'
import Image from 'next/image'

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
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get location display
  const getLocationDisplay = () => {
    if (message.location_city && message.location_country) {
      return `${message.location_city}, ${message.location_country}`
    }
    return message.location_country || message.location_city || message.location || 'Unknown Location'
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
    // This should match your Supabase storage configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/birthday-media/${storagePath}`
  }

  // Truncate message for preview
  const truncateMessage = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Card variants for different view modes
  const cardVariants = {
    grid: 'p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300',
    list: 'p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-4',
    slideshow: 'p-8 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl max-w-4xl mx-auto',
    fullscreen: 'p-12 bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl',
  }

  return (
    <motion.div
      className={cn(cardVariants[viewMode], className)}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Card Header */}
      <div className={cn(
        'flex items-start justify-between mb-4',
        viewMode === 'list' && 'md:w-1/3 md:mb-0'
      )}>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <HeartIcon size="sm" color="pink" />
            <h3 className="font-display text-lg font-semibold text-charcoal-black">
              {message.name}
            </h3>
            {cardType !== 'text' && (
              <Badge variant="secondary" className="text-xs">
                {cardType === 'mixed' ? 'Media' : cardType}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col space-y-1 text-xs text-charcoal-black/60">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-3 w-3" />
              <span>{getLocationDisplay()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(message.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {viewMode === 'grid' && message.message.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-auto"
          >
            {isExpanded ? (
              <ShrinkIcon className="h-4 w-4" />
            ) : (
              <ExpandIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Media Preview */}
      {message.media_files && message.media_files.length > 0 && (
        <div className={cn(
          'mb-4',
          viewMode === 'list' && 'md:w-1/3 md:mb-0'
        )}>
          <div className={cn(
            'grid gap-2',
            message.media_files.length === 1 && 'grid-cols-1',
            message.media_files.length === 2 && 'grid-cols-2',
            message.media_files.length >= 3 && 'grid-cols-2 md:grid-cols-3'
          )}>
            {message.media_files.slice(0, viewMode === 'grid' ? 4 : 6).map((file, index) => (
              <div
                key={file.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
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
                
                {/* Media count overlay */}
                {index === 3 && message.media_files!.length > 4 && viewMode === 'grid' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{message.media_files!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Media Stats */}
          {(mediaStats.images > 0 || mediaStats.videos > 0) && (
            <div className="flex items-center space-x-3 mt-2 text-xs text-charcoal-black/60">
              {mediaStats.images > 0 && (
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>{mediaStats.images}</span>
                </div>
              )}
              {mediaStats.videos > 0 && (
                <div className="flex items-center space-x-1">
                  <VideoIcon className="h-3 w-3" />
                  <span>{mediaStats.videos}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'flex-1',
        viewMode === 'list' && 'md:w-1/3'
      )}>
        <div className="relative">
          <p className={cn(
            'font-body text-charcoal-black leading-relaxed',
            viewMode === 'grid' && 'text-sm',
            viewMode === 'list' && 'text-sm',
            viewMode === 'slideshow' && 'text-base',
            viewMode === 'fullscreen' && 'text-lg'
          )}>
            {viewMode === 'grid' && !isExpanded
              ? truncateMessage(message.message)
              : message.message}
          </p>
          
          {/* Sparkle decoration for special messages */}
          {message.message.length > 200 && (
            <SparkleIcon 
              size="sm" 
              color="roseGold" 
              className="absolute -top-2 -right-2 animate-sparkle opacity-60" 
            />
          )}
        </div>

        {/* Read More/Less for long messages in grid view */}
        {viewMode === 'grid' && message.message.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 p-0 h-auto text-xs text-primary hover:text-primary/80"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
