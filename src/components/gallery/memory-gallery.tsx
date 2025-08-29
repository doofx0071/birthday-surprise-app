'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useGalleryData } from '@/hooks/use-gallery-data'
import { MessageCard, ViewMode } from './message-card'
import { MediaLightbox } from './media-lightbox'
import { GalleryFilters, ContentType, DateRange } from './gallery-filters'
import { GallerySearch } from './gallery-search'
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
  FilterIcon,
  RefreshCwIcon
} from 'lucide-react'

interface MemoryGalleryProps {
  className?: string
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ className }) => {
  // Data fetching
  const { messages, loading, error, refetch, hasMore, loadMore } = useGalleryData(20)

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<ContentType>('all')
  const [location, setLocation] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')

  // Lightbox state
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string
    type: 'image' | 'video'
    title?: string
  } | null>(null)

  // Celebration state
  const [showSparkles, setShowSparkles] = useState(false)

  // Filter messages based on current filters
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          message.name.toLowerCase().includes(query) ||
          message.message.toLowerCase().includes(query) ||
          (message.location && message.location.toLowerCase().includes(query)) ||
          (message.location_city && message.location_city.toLowerCase().includes(query)) ||
          (message.location_country && message.location_country.toLowerCase().includes(query))
        
        if (!matchesSearch) return false
      }

      // Content type filter
      if (contentType !== 'all') {
        const hasImages = message.media_files?.some(f => f.file_type === 'image') || false
        const hasVideos = message.media_files?.some(f => f.file_type === 'video') || false
        const hasMedia = hasImages || hasVideos

        switch (contentType) {
          case 'text':
            if (hasMedia) return false
            break
          case 'image':
            if (!hasImages || hasVideos) return false
            break
          case 'video':
            if (!hasVideos || hasImages) return false
            break
          case 'mixed':
            if (!hasImages || !hasVideos) return false
            break
        }
      }

      // Location filter
      if (location && location !== 'all') {
        const messageLocation = message.location_country || message.location || ''
        if (!messageLocation.toLowerCase().includes(location.toLowerCase())) {
          return false
        }
      }

      // Date range filter
      if (dateRange !== 'all') {
        const messageDate = new Date(message.created_at)
        const now = new Date()
        
        switch (dateRange) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (messageDate < weekAgo) return false
            break
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            if (messageDate < monthAgo) return false
            break
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            if (messageDate < yearAgo) return false
            break
        }
      }

      return true
    })
  }, [messages, searchQuery, contentType, location, dateRange])



  // Handle media click for lightbox
  const handleMediaClick = useCallback((url: string, type: 'image' | 'video', title?: string) => {
    setLightboxMedia({ url, type, title })

    // Trigger subtle sparkle effects for interaction feedback
    setShowSparkles(true)
    setTimeout(() => setShowSparkles(false), 2000)
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setContentType('all')
    setLocation('all')
    setDateRange('all')
  }, [])

  // View mode options
  const viewModeOptions = [
    { mode: 'grid' as ViewMode, icon: GridIcon, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: ListIcon, label: 'List' },
    { mode: 'slideshow' as ViewMode, icon: PlayIcon, label: 'Slideshow' },
    { mode: 'fullscreen' as ViewMode, icon: ExpandIcon, label: 'Fullscreen' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-2xl md:text-3xl font-bold text-primary font-body">
                Memory Gallery
              </h1>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {filteredMessages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm neuro-card px-3 py-1">
                {filteredMessages.length} {filteredMessages.length === 1 ? 'memory' : 'memories'}
              </Badge>
              <div className="hidden sm:block text-sm text-charcoal-black/60 font-body">
                Celebrating together
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center neuro-card p-1">
            {viewModeOptions.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 text-xs",
                  viewMode === mode && "neuro-button"
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2",
              showFilters && "neuro-button"
            )}
          >
            <FilterIcon className="w-4 h-4" />
            Filters
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>


        </div>
      </div>

      {/* Search */}
      <GallerySearch
        value={searchQuery}
        onChange={setSearchQuery}
        className="max-w-md"
      />

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GalleryFilters
              contentType={contentType}
              location={location}
              dateRange={dateRange}
              onContentTypeChange={setContentType}
              onLocationChange={setLocation}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
          'grid gap-6',
          viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
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

      {/* Empty State */}
      {!loading && filteredMessages.length === 0 && messages.length > 0 && (
        <div className="text-center py-12">
          <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters to find more memories.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
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

      {/* Messages Grid */}
      {filteredMessages.length > 0 && (
        <motion.div
          layout
          className={cn(
            'grid gap-6',
            viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            viewMode === 'list' && 'grid-cols-1',
            viewMode === 'slideshow' && 'grid-cols-1 md:grid-cols-2',
            viewMode === 'fullscreen' && 'grid-cols-1'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                viewMode={viewMode}
                onMediaClick={handleMediaClick}
              />
            ))}
          </AnimatePresence>
        </motion.div>
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
        onClose={() => setLightboxMedia(null)}
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
