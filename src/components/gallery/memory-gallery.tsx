'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MessageCard } from './message-card'
import { GalleryFilters } from './gallery-filters'
import { GallerySearch } from './gallery-search'
import { MediaLightbox } from './media-lightbox'
import { useGalleryData } from '@/hooks/use-gallery-data'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'
import { Button } from '@/components/ui/button'
import { GridIcon, ListIcon, PlayIcon, FullscreenIcon } from 'lucide-react'

export type ViewMode = 'grid' | 'list' | 'slideshow' | 'fullscreen'
export type SortOption = 'newest' | 'oldest' | 'location' | 'length' | 'random'

interface MemoryGalleryProps {
  className?: string
  initialViewMode?: ViewMode
  showFilters?: boolean
  showSearch?: boolean
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  className,
  initialViewMode = 'grid',
  showFilters = true,
  showSearch = true,
}) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    contentType: 'all' as 'all' | 'text' | 'image' | 'video' | 'mixed',
    location: '',
    dateRange: 'all' as 'all' | 'week' | 'month' | 'year',
  })
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string
    type: 'image' | 'video'
    title?: string
  } | null>(null)

  // Data fetching
  const { messages, loading, error, refetch } = useGalleryData()

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    if (!messages) return []

    let filtered = messages.filter(message => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          message.name.toLowerCase().includes(query) ||
          message.message.toLowerCase().includes(query) ||
          message.location_city?.toLowerCase().includes(query) ||
          message.location_country?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Content type filter
      if (selectedFilters.contentType !== 'all') {
        const hasMedia = message.media_files && message.media_files.length > 0
        const hasImages = message.media_files?.some(f => f.file_type === 'image')
        const hasVideos = message.media_files?.some(f => f.file_type === 'video')
        
        switch (selectedFilters.contentType) {
          case 'text':
            if (hasMedia) return false
            break
          case 'image':
            if (!hasImages) return false
            break
          case 'video':
            if (!hasVideos) return false
            break
          case 'mixed':
            if (!hasMedia) return false
            break
        }
      }

      // Location filter
      if (selectedFilters.location) {
        const locationMatch = 
          message.location_country?.toLowerCase().includes(selectedFilters.location.toLowerCase()) ||
          message.location_city?.toLowerCase().includes(selectedFilters.location.toLowerCase())
        
        if (!locationMatch) return false
      }

      // Date range filter
      if (selectedFilters.dateRange !== 'all') {
        const messageDate = new Date(message.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (selectedFilters.dateRange) {
          case 'week':
            if (daysDiff > 7) return false
            break
          case 'month':
            if (daysDiff > 30) return false
            break
          case 'year':
            if (daysDiff > 365) return false
            break
        }
      }

      return true
    })

    // Sort messages
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'location':
        filtered.sort((a, b) => {
          const locationA = a.location_country || a.location_city || ''
          const locationB = b.location_country || b.location_city || ''
          return locationA.localeCompare(locationB)
        })
        break
      case 'length':
        filtered.sort((a, b) => b.message.length - a.message.length)
        break
      case 'random':
        filtered.sort(() => Math.random() - 0.5)
        break
    }

    return filtered
  }, [messages, searchQuery, selectedFilters, sortBy])

  // View mode icons
  const viewModeIcons = {
    grid: GridIcon,
    list: ListIcon,
    slideshow: PlayIcon,
    fullscreen: FullscreenIcon,
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-charcoal-black/70">Loading beautiful memories...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <HeartIcon size="lg" color="pink" />
          </div>
          <p className="text-charcoal-black/70 mb-4">Oops! Something went wrong loading the memories.</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <HeartIcon size="md" color="pink" className="animate-pulse-soft" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black">
            Memory Gallery
          </h2>
          <SparkleIcon size="sm" color="roseGold" className="animate-sparkle" />
        </div>
        
        {/* View Mode Controls */}
        <div className="flex items-center space-x-2">
          {Object.entries(viewModeIcons).map(([mode, Icon]) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode as ViewMode)}
              className="p-2"
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {showSearch && (
          <div className="flex-1">
            <GallerySearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search messages, names, or locations..."
            />
          </div>
        )}
        
        {showFilters && (
          <GalleryFilters
            filters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-charcoal-black/70">
        <span>
          {filteredAndSortedMessages.length} {filteredAndSortedMessages.length === 1 ? 'memory' : 'memories'} found
        </span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="text-xs"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Gallery Content */}
      <AnimatePresence mode="wait">
        {filteredAndSortedMessages.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">💌</div>
            <h3 className="font-display text-xl font-semibold text-charcoal-black mb-2">
              No memories found
            </h3>
            <p className="text-charcoal-black/70">
              {searchQuery || selectedFilters.contentType !== 'all' || selectedFilters.location
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a beautiful memory!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${viewMode}-${filteredAndSortedMessages.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'grid gap-6',
              viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              viewMode === 'list' && 'grid-cols-1',
              (viewMode === 'slideshow' || viewMode === 'fullscreen') && 'grid-cols-1'
            )}
          >
            {filteredAndSortedMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <MessageCard
                  message={message}
                  viewMode={viewMode}
                  onMediaClick={(url, type, title) => setLightboxMedia({ url, type, title })}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Lightbox */}
      <MediaLightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  )
}
