'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnalyticsFiltersProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  onDateRangeChange: (range: '7d' | '30d' | '90d' | 'custom') => void
  customDateRange: { start: string; end: string }
  onCustomDateRangeChange: (range: { start: string; end: string }) => void
}

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
] as const

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  customDateRange,
  onCustomDateRangeChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Date Range Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-soft-pink" />
            <span className="font-medium text-charcoal-black">Time Period:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {dateRangeOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDateRangeChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  dateRange === option.value
                    ? 'bg-soft-pink text-white shadow-sm'
                    : 'text-charcoal-black/70 hover:bg-soft-pink/10 hover:text-charcoal-black'
                )}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-3"
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-charcoal-black/60" />
              <span className="text-sm font-medium text-charcoal-black">From:</span>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  onCustomDateRangeChange({
                    ...customDateRange,
                    start: e.target.value,
                  })
                }
                className="px-3 py-1.5 border border-soft-pink/30 rounded-lg text-sm focus:border-soft-pink focus:outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-charcoal-black">To:</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  onCustomDateRangeChange({
                    ...customDateRange,
                    end: e.target.value,
                  })
                }
                className="px-3 py-1.5 border border-soft-pink/30 rounded-lg text-sm focus:border-soft-pink focus:outline-none"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
