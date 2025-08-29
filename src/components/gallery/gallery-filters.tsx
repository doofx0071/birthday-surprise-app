'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FilterIcon, ImageIcon, VideoIcon, FileTextIcon, LayersIcon } from 'lucide-react'

export type ContentType = 'all' | 'text' | 'image' | 'video' | 'mixed'
export type DateRange = 'all' | 'week' | 'month' | 'year'

interface GalleryFiltersProps {
  contentType: ContentType
  location: string
  dateRange: DateRange
  onContentTypeChange: (type: ContentType) => void
  onLocationChange: (location: string) => void
  onDateRangeChange: (range: DateRange) => void
  onClearFilters: () => void
  className?: string
}

export const GalleryFilters: React.FC<GalleryFiltersProps> = ({
  contentType,
  location,
  dateRange,
  onContentTypeChange,
  onLocationChange,
  onDateRangeChange,
  onClearFilters,
  className
}) => {
  const hasActiveFilters = contentType !== 'all' || location !== '' || dateRange !== 'all'

  const contentTypeOptions = [
    { value: 'all', label: 'All Content', icon: FilterIcon, color: 'bg-gray-400' },
    { value: 'text', label: 'Text Only', icon: FileTextIcon, color: 'bg-blue-400' },
    { value: 'image', label: 'Photos', icon: ImageIcon, color: 'bg-green-400' },
    { value: 'video', label: 'Videos', icon: VideoIcon, color: 'bg-purple-400' },
    { value: 'mixed', label: 'Mixed Media', icon: LayersIcon, color: 'bg-pink-400' },
  ] as const

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'neuro-card p-4 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-pink-500" />
          <h3 className="font-medium text-charcoal-black font-body">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs neuro-card px-2 py-1">
              Active
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-charcoal-black/60 hover:text-primary font-body neuro-button-hover"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Content Type Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal-black font-body">
          Content Type
        </label>
        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map((option) => {
            const Icon = option.icon
            const isActive = contentType === option.value

            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onContentTypeChange(option.value)}
                className={cn(
                  "flex items-center gap-2 text-xs font-body transition-all duration-300",
                  "neuro-button hover:neuro-button-hover",
                  isActive && "bg-primary hover:bg-primary/90 text-white border-primary"
                )}
              >
                <div className={cn('w-2 h-2 rounded-full', option.color)} />
                <Icon className="w-3 h-3" />
                {option.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Location
        </label>
        <Select value={location} onValueChange={onLocationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Philippines">Philippines</SelectItem>
            <SelectItem value="USA">United States</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Date Range
        </label>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  )
}
