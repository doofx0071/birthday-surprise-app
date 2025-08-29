'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  PhotoIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { messageOperations } from '@/lib/supabase'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { cn } from '@/lib/utils'

interface StatCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  loading?: boolean
}

export function DashboardStats() {
  const { user, isLoading: authLoading } = useAdminAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch stats if user is authenticated and auth is not loading
    if (!user || authLoading) {
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await messageOperations.getStats()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time updates
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [user, authLoading])

  const statCards: StatCard[] = [
    {
      title: 'Total Messages',
      value: loading ? '...' : stats?.total_messages || 0,
      change: '+12%',
      changeType: 'positive',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-soft-pink to-rose-gold',
      loading,
    },
    {
      title: 'Pending Approval',
      value: loading ? '...' : stats?.pending_messages || 0,
      icon: ClockIcon,
      color: 'from-yellow-400 to-orange-500',
      loading,
    },
    {
      title: 'Countries',
      value: loading ? '...' : stats?.total_countries || 0,
      change: '+2',
      changeType: 'positive',
      icon: GlobeAltIcon,
      color: 'from-blue-400 to-blue-600',
      loading,
    },
    {
      title: 'Media Files',
      value: loading ? '...' : stats?.total_media || 0,
      change: '+8',
      changeType: 'positive',
      icon: PhotoIcon,
      color: 'from-green-400 to-green-600',
      loading,
    },
    {
      title: 'With Reminders',
      value: loading ? '...' : stats?.total_with_reminders || 0,
      icon: CheckCircleIcon,
      color: 'from-purple-400 to-purple-600',
      loading,
    },
    {
      title: 'System Health',
      value: error ? 'Error' : 'Healthy',
      icon: error ? ExclamationTriangleIcon : CheckCircleIcon,
      color: error ? 'from-red-400 to-red-600' : 'from-green-400 to-green-600',
      loading: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal-black/70 mb-1">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2">
                {stat.loading ? (
                  <div className="animate-pulse bg-soft-pink/20 rounded w-12 h-8"></div>
                ) : (
                  <p className="text-2xl font-bold text-charcoal-black">
                    {stat.value}
                  </p>
                )}
                {stat.change && (
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      stat.changeType === 'positive' && 'bg-green-100 text-green-800',
                      stat.changeType === 'negative' && 'bg-red-100 text-red-800',
                      stat.changeType === 'neutral' && 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center',
              stat.color
            )}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
