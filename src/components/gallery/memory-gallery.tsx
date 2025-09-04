'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useGalleryData } from '@/hooks/use-gallery-data'
import { MessageCard, ViewMode } from './message-card'
import { MediaLightbox } from './media-lightbox'
// Removed gallery filters and search for cleaner UI
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SparkleEffect } from '@/components/ui/confetti-animation'
import {
  GridIcon,
  ListIcon,
  PlayIcon,
  ExpandIcon,
  RefreshCwIcon,
  HeartIcon
} from 'lucide-react'

interface MemoryGalleryProps {
  className?: string
  headerOnly?: boolean
  cardsOnly?: boolean
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ className, headerOnly = false, cardsOnly = false }) => {
  // Data fetching
  const { messages, loading, error, refetch, hasMore, loadMore } = useGalleryData(20)

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Lightbox state
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string
    type: 'image' | 'video'
    title?: string
    id: string
  } | null>(null)

  // Media navigation state
  const [currentMediaList, setCurrentMediaList] = useState<Array<{
    url: string
    type: 'image' | 'video'
    title?: string
    id: string
  }>>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)



  // Celebration state
  const [showSparkles, setShowSparkles] = useState(false)

  // Use all messages without filtering for cleaner gallery experience
  const filteredMessages = messages

  // Masonry layout state
  const [columns, setColumns] = useState(4)
  const [masonryColumns, setMasonryColumns] = useState<any[][]>([])

  // Update columns based on screen size - responsive breakpoints
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)        // Mobile: 1 column
      else if (width < 768) setColumns(2)   // Small tablet: 2 columns
      else if (width < 1024) setColumns(3)  // Tablet: 3 columns
      else setColumns(4)                    // Desktop: 4 columns
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Create masonry layout
  useEffect(() => {
    if (filteredMessages.length === 0) {
      setMasonryColumns([])
      return
    }

    const newColumns: any[][] = Array.from({ length: columns }, () => [])
    const columnHeights = new Array(columns).fill(0)

    filteredMessages.forEach((message) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

      // Add message to shortest column
      newColumns[shortestColumnIndex].push(message)

      // Estimate height based on content
      const estimatedHeight = 300 + (message.message?.length || 0) * 0.8 + (message.media_files?.length || 0) * 200
      columnHeights[shortestColumnIndex] += estimatedHeight
    })

    setMasonryColumns(newColumns)
  }, [filteredMessages, columns])



  // Handle media click for lightbox with navigation support
  const handleMediaClick = useCallback((
    url: string,
    type: 'image' | 'video',
    title?: string,
    mediaFiles?: Array<any>,
    clickedIndex?: number
  ) => {
    // If mediaFiles are provided, set up navigation
    if (mediaFiles && mediaFiles.length > 0) {
      const mediaList = mediaFiles.map((file) => ({
        url: getMediaUrl(file.storage_path),
        type: file.file_type as 'image' | 'video',
        title: `${title?.split("'s")[0]}'s ${file.file_type}`,
        id: file.id
      }))

      setCurrentMediaList(mediaList)
      setCurrentMediaIndex(clickedIndex || 0)
      setLightboxMedia(mediaList[clickedIndex || 0])
    } else {
      // Fallback for single media
      setLightboxMedia({
        url,
        type,
        title,
        id: 'single-media'
      })
      setCurrentMediaList([])
      setCurrentMediaIndex(0)
    }

    // Trigger subtle sparkle effects for interaction feedback
    setShowSparkles(true)
    setTimeout(() => setShowSparkles(false), 2000)
  }, [])

  // Get storage URL for media files
  const getMediaUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/birthday-media/${storagePath}`
  }

  // Handle navigation between media items
  const handleMediaNavigation = useCallback((direction: 'prev' | 'next') => {
    if (currentMediaList.length === 0) return

    let newIndex = currentMediaIndex
    if (direction === 'prev' && currentMediaIndex > 0) {
      newIndex = currentMediaIndex - 1
    } else if (direction === 'next' && currentMediaIndex < currentMediaList.length - 1) {
      newIndex = currentMediaIndex + 1
    }

    setCurrentMediaIndex(newIndex)
    setLightboxMedia(currentMediaList[newIndex])
  }, [currentMediaList, currentMediaIndex])

  // Removed filter functionality for cleaner experience

  // View mode options
  const viewModeOptions = [
    { mode: 'grid' as ViewMode, icon: GridIcon, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: ListIcon, label: 'List' },
    { mode: 'slideshow' as ViewMode, icon: PlayIcon, label: 'Slideshow' },
    { mode: 'fullscreen' as ViewMode, icon: ExpandIcon, label: 'Fullscreen' },
  ]

  // Header only render
  if (headerOnly) {
    return (
      <div className={cn('', className)}>
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal-black font-heading">
                  Memory Gallery
                </h1>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {filteredMessages.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-gray-100 text-charcoal-black border border-gray-200">
                  {filteredMessages.length} {filteredMessages.length === 1 ? 'memory' : 'memories'}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-start sm:justify-end">
            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-xs sm:text-sm"
            >
              <RefreshCwIcon className={cn("w-3 h-3 sm:w-4 sm:h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">↻</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Cards only render
  if (cardsOnly) {
    return (
      <div className={cn('', className)}>
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && messages.length === 0 && (
          <div className={cn(
            'grid gap-4 sm:gap-6',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
            <p className="text-gray-500">
              Be the first to share a memory! Messages will appear here once they're approved.
            </p>
          </div>
        )}

        {/* Messages Masonry - True Pinterest Style */}
        {filteredMessages.length > 0 && (
          <div className="w-full">
            <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
              {masonryColumns.map((columnMessages, columnIndex) => (
                <div key={columnIndex} className="flex-1 space-y-6">
                  <AnimatePresence mode="popLayout">
                    {columnMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <MessageCard
                          message={message}
                          viewMode="grid"
                          onMediaClick={handleMediaClick}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              className="border-gray-200 hover:bg-gray-50"
            >
              Load More Memories
            </Button>
          </div>
        )}



        {/* Media Lightbox */}
        <MediaLightbox
          media={lightboxMedia}
          mediaList={currentMediaList}
          currentIndex={currentMediaIndex}
          onClose={() => {
            setLightboxMedia(null)
            setCurrentMediaList([])
            setCurrentMediaIndex(0)
          }}
          onNavigate={handleMediaNavigation}
        />

        {/* Interaction Effects */}
        <SparkleEffect
          trigger={showSparkles}
          duration={2000}
          className="relative"
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal-black font-heading">
                Memory Gallery
              </h1>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {filteredMessages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-charcoal-black border border-gray-200">
                {filteredMessages.length} {filteredMessages.length === 1 ? 'memory' : 'memories'}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCwIcon className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Removed search and filters for cleaner gallery experience */}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && messages.length === 0 && (
        <div className={cn(
          'grid gap-4 sm:gap-6',
          viewMode === 'grid' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          viewMode === 'list' && 'grid-cols-1'
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Removed filtered empty state since we removed filters */}

      {/* No Data State */}
      {!loading && messages.length === 0 && (
        <div className="text-center py-12">
          <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
          <p className="text-gray-500">
            Be the first to share a memory! Messages will appear here once they're approved.
          </p>
        </div>
      )}

      {/* Messages Masonry - True Pinterest Style */}
      {filteredMessages.length > 0 && (
        <div className="w-full">
          <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
            {masonryColumns.map((columnMessages, columnIndex) => (
              <div key={columnIndex} className="flex-1 space-y-6">
                <AnimatePresence mode="popLayout">
                  {columnMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <MessageCard
                        message={message}
                        viewMode="grid"
                        onMediaClick={handleMediaClick}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            className="px-8"
          >
            Load More Memories
          </Button>
        </div>
      )}



      {/* Media Lightbox */}
      <MediaLightbox
        media={lightboxMedia}
        mediaList={currentMediaList}
        currentIndex={currentMediaIndex}
        onClose={() => {
          setLightboxMedia(null)
          setCurrentMediaList([])
          setCurrentMediaIndex(0)
        }}
        onNavigate={handleMediaNavigation}
      />

      {/* Interaction Effects */}
      <SparkleEffect
        trigger={showSparkles}
        duration={2000}
        className="relative"
      />
    </div>
  )
}
