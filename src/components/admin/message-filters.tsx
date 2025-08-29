'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageFiltersProps {
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected'
  onFilterChange: (status: 'all' | 'pending' | 'approved' | 'rejected') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
}

const filterOptions = [
  { value: 'all', label: 'All Messages', color: 'text-charcoal-black' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
  { value: 'approved', label: 'Approved', color: 'text-green-600' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
] as const

export function MessageFilters({
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
}: MessageFiltersProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-black/40" />
            <input
              type="text"
              placeholder="Search messages, names, or emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-soft-pink/30 rounded-lg focus:border-soft-pink focus:outline-none transition-colors bg-white/50"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-charcoal-black/60" />
          <div className="flex items-center space-x-1">
            {filterOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  filterStatus === option.value
                    ? 'bg-soft-pink text-white shadow-sm'
                    : 'text-charcoal-black/70 hover:bg-soft-pink/10 hover:text-charcoal-black'
                )}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  )
}
