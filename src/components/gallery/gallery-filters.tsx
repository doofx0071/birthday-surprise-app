'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SortOption } from './memory-gallery'
import {
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
  ImageIcon,
  VideoIcon,
  MessageSquareIcon,
  CalendarIcon,
  MapPinIcon,
  ShuffleIcon,
  ClockIcon,
  XIcon,
  FileIcon,
} from 'lucide-react'

interface GalleryFiltersProps {
  filters: {
    contentType: 'all' | 'text' | 'image' | 'video' | 'mixed'
    location: string
    dateRange: 'all' | 'week' | 'month' | 'year'
  }
  onFiltersChange: (filters: GalleryFiltersProps['filters']) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export const GalleryFilters: React.FC<GalleryFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Content type options
  const contentTypes = [
    { value: 'all', label: 'All Content', icon: FilterIcon },
    { value: 'text', label: 'Text Only', icon: MessageSquareIcon },
    { value: 'image', label: 'With Photos', icon: ImageIcon },
    { value: 'video', label: 'With Videos', icon: VideoIcon },
    { value: 'mixed', label: 'With Media', icon: FileIcon },
  ] as const

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ] as const

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: SortDescIcon },
    { value: 'oldest', label: 'Oldest First', icon: SortAscIcon },
    { value: 'location', label: 'By Location', icon: MapPinIcon },
    { value: 'length', label: 'By Length', icon: MessageSquareIcon },
    { value: 'random', label: 'Random', icon: ShuffleIcon },
  ] as const

  // Count active filters
  const activeFiltersCount = [
    filters.contentType !== 'all',
    filters.location !== '',
    filters.dateRange !== 'all',
  ].filter(Boolean).length

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      contentType: 'all',
      location: '',
      dateRange: 'all',
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <FilterIcon className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-charcoal-black/70">Sort:</Label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 space-y-6">
              {/* Content Type Filter */}
              <div>
                <Label className="text-sm font-medium text-charcoal-black mb-3 block">
                  Content Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => {
                    const Icon = type.icon
                    const isActive = filters.contentType === type.value
                    
                    return (
                      <Button
                        key={type.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            contentType: type.value,
                          })
                        }
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-3 w-3" />
                        <span>{type.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <Label className="text-sm font-medium text-charcoal-black mb-3 block">
                  Location
                </Label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-black/40" />
                  <Input
                    type="text"
                    placeholder="Filter by city or country..."
                    value={filters.location}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        location: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                  {filters.location && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          location: '',
                        })
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <Label className="text-sm font-medium text-charcoal-black mb-3 block">
                  Date Range
                </Label>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map((range) => {
                    const isActive = filters.dateRange === range.value
                    
                    return (
                      <Button
                        key={range.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            dateRange: range.value,
                          })
                        }
                        className="flex items-center space-x-2"
                      >
                        <CalendarIcon className="h-3 w-3" />
                        <span>{range.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="text-xs text-charcoal-black/60">
                  {activeFiltersCount > 0 ? (
                    `${activeFiltersCount} filter${activeFiltersCount === 1 ? '' : 's'} active`
                  ) : (
                    'No filters applied'
                  )}
                </div>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.contentType !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span className="text-xs">
                {contentTypes.find(t => t.value === filters.contentType)?.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    contentType: 'all',
                  })
                }
                className="p-0 h-auto ml-1"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span className="text-xs">📍 {filters.location}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    location: '',
                  })
                }
                className="p-0 h-auto ml-1"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span className="text-xs">
                📅 {dateRanges.find(r => r.value === filters.dateRange)?.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    dateRange: 'all',
                  })
                }
                className="p-0 h-auto ml-1"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
