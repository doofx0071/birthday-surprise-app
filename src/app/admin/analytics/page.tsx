'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AnalyticsOverview } from '@/components/admin/analytics-overview'
import { MessageTrends } from '@/components/admin/message-trends'
import { GeographicDistribution } from '@/components/admin/geographic-distribution'
import { EngagementMetrics } from '@/components/admin/engagement-metrics'
import { MediaStatistics } from '@/components/admin/media-statistics'
import { AnalyticsFilters } from '@/components/admin/analytics-filters'


export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customDateRange, setCustomDateRange] = useState<{
    start: string
    end: string
  }>({
    start: '',
    end: ''
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Auto-refresh every 30 seconds for real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-black mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-charcoal-black/70">
            Comprehensive insights into message engagement, trends, and geographic distribution.
          </p>
        </div>
      </motion.div>

      {/* Analytics Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      </motion.div>

      {/* Analytics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnalyticsOverview dateRange={dateRange} customDateRange={customDateRange} refreshTrigger={refreshTrigger} />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MessageTrends dateRange={dateRange} customDateRange={customDateRange} refreshTrigger={refreshTrigger} />
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GeographicDistribution dateRange={dateRange} customDateRange={customDateRange} refreshTrigger={refreshTrigger} />
        </motion.div>
      </div>

      {/* Additional Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <EngagementMetrics dateRange={dateRange} customDateRange={customDateRange} refreshTrigger={refreshTrigger} />
        </motion.div>

        {/* Media Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MediaStatistics dateRange={dateRange} customDateRange={customDateRange} refreshTrigger={refreshTrigger} />
        </motion.div>
      </div>
    </div>
  )
}
