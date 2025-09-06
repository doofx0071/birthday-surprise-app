'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MessageStats {
  total: number
  approved: number
  pending: number
  rejected: number
  withMedia: number
  countries: number
}

interface PreviewStatsProps {
  previewMode: 'current' | 'post-countdown'
}

export const PreviewStats: React.FC<PreviewStatsProps> = ({ previewMode }) => {
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    withMedia: 0,
    countries: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/messages/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching message stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="neuro-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const visibleInPreview = previewMode === 'post-countdown' ? stats.approved : 0

  return (
    <div className="neuro-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-charcoal-black">
          Content Statistics
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${previewMode === 'post-countdown' ? 'bg-green-500' : 'bg-orange-500'}`} />
          <span className="text-sm text-charcoal-black/70">
            {previewMode === 'post-countdown' ? 'Content Revealed' : 'Content Hidden'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-gray-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-charcoal-black mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-charcoal-black/70">Total Messages</div>
        </motion.div>

        {/* Approved Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-green-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.approved}
          </div>
          <div className="text-sm text-charcoal-black/70">Approved</div>
        </motion.div>

        {/* Pending Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 bg-orange-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {stats.pending}
          </div>
          <div className="text-sm text-charcoal-black/70">Pending</div>
        </motion.div>

        {/* Rejected Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-4 bg-red-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-red-600 mb-1">
            {stats.rejected}
          </div>
          <div className="text-sm text-charcoal-black/70">Rejected</div>
        </motion.div>

        {/* Messages with Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 bg-blue-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.withMedia}
          </div>
          <div className="text-sm text-charcoal-black/70">With Media</div>
        </motion.div>

        {/* Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center p-4 bg-purple-50 rounded-lg"
        >
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.countries}
          </div>
          <div className="text-sm text-charcoal-black/70">Countries</div>
        </motion.div>
      </div>

      {/* Visibility Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-charcoal-black mb-1">
              Visible to Public in {previewMode === 'current' ? 'Current' : 'Post-Countdown'} View
            </div>
            <div className="text-sm text-charcoal-black/70">
              {previewMode === 'current' 
                ? 'Gallery and Map are hidden until countdown ends'
                : 'Only approved messages are visible in Gallery and Map'
              }
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-charcoal-black">
              {visibleInPreview}
            </div>
            <div className="text-sm text-charcoal-black/70">
              Visible Messages
            </div>
          </div>
        </div>
      </div>

      {/* Approval Rate */}
      {stats.total > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-charcoal-black">Approval Rate</span>
            <span className="text-sm font-bold text-charcoal-black">
              {Math.round((stats.approved / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.approved / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
