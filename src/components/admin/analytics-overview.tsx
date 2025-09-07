'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { createSupabaseClient } from '@/lib/supabase'

interface AnalyticsOverviewProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
  refreshTrigger: number
}

interface StatsData {
  total_messages: number
  approved_messages: number
  pending_messages: number
  rejected_messages: number
  total_countries: number
  total_with_reminders: number
  total_media_files: number
}

export function AnalyticsOverview({ dateRange, customDateRange, refreshTrigger }: AnalyticsOverviewProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchStats()
  }, [dateRange, customDateRange, refreshTrigger])

  const getDateFilter = () => {
    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start)
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return startDate.toISOString()
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const startDate = getDateFilter()

      // Get all counts directly using the current schema with date filtering
      const [
        { count: totalCount },
        { count: approvedCount },
        { count: pendingCount },
        { count: rejectedCount },
        { count: remindersCount },
        { count: mediaCount },
        { data: locationData }
      ] = await Promise.all([
        // Total messages in date range
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate),

        // Approved messages in date range
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .gte('created_at', startDate),

        // Pending messages in date range
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .gte('created_at', startDate),

        // Rejected messages in date range
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')
          .gte('created_at', startDate),

        // Messages with reminders in date range
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('wants_reminders', true)
          .gte('created_at', startDate),

        // Media files count in date range
        supabase
          .from('media_files')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate),

        // Unique locations for country count
        supabase
          .from('messages')
          .select('location')
          .not('location', 'is', null)
          .gte('created_at', startDate)
      ])

      // Count unique countries from location data
      const uniqueCountries = new Set()
      locationData?.forEach((message: any) => {
        if (message.location) {
          // Extract country from location string (assuming format like "City, Country")
          const parts = message.location.split(',')
          if (parts.length > 1) {
            const country = parts[parts.length - 1].trim()
            uniqueCountries.add(country)
          }
        }
      })

      const statsData: StatsData = {
        total_messages: totalCount || 0,
        approved_messages: approvedCount || 0,
        pending_messages: pendingCount || 0,
        rejected_messages: rejectedCount || 0,
        total_countries: uniqueCountries.size,
        total_with_reminders: remindersCount || 0,
        total_media_files: mediaCount || 0,
      }

      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch analytics stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyticsCards = [
    {
      title: 'Total Messages',
      value: loading ? '...' : `${stats?.total_messages || 0}`,
      subtitle: loading ? '...' : `${stats?.approved_messages || 0} approved`,
      icon: ChartBarIcon,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Active Contributors',
      value: loading ? '...' : `${stats?.total_messages || 0}`,
      subtitle: loading ? '...' : `${stats?.pending_messages || 0} pending review`,
      icon: UsersIcon,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Global Reach',
      value: loading ? '...' : `${stats?.total_countries || 0}`,
      subtitle: loading ? '...' : `${stats?.total_countries || 0} countries`,
      icon: GlobeAltIcon,
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Media Files',
      value: loading ? '...' : `${stats?.total_media_files || 0}`,
      subtitle: loading ? '...' : `${Math.round(((stats?.total_with_reminders || 0) / (stats?.total_messages || 1)) * 100)}% want reminders`,
      icon: HeartIcon,
      color: 'from-soft-pink to-rose-gold',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {analyticsCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal-black/70 mb-1">
                {card.title}
              </p>
              <div className="space-y-1">
                {loading ? (
                  <div className="animate-pulse bg-soft-pink/20 rounded w-16 h-6"></div>
                ) : (
                  <p className="text-2xl font-bold text-charcoal-black">
                    {card.value}
                  </p>
                )}
                {!loading && card.subtitle && (
                  <p className="text-xs text-charcoal-black/60">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
