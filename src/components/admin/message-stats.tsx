'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { createSupabaseClient } from '@/lib/supabase'

interface MessageStatsProps {
  refreshTrigger: number
}

interface StatsData {
  total_messages: number
  pending_messages: number
  approved_messages: number
  rejected_messages: number
}

export function MessageStats({ refreshTrigger }: MessageStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Get all counts directly using the current schema
      const [
        { count: totalCount },
        { count: pendingCount },
        { count: approvedCount },
        { count: rejectedCount }
      ] = await Promise.all([
        // Total messages
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true }),

        // Pending messages
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Approved messages
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),

        // Rejected messages
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')
      ])

      const statsData: StatsData = {
        total_messages: totalCount || 0,
        pending_messages: pendingCount || 0,
        approved_messages: approvedCount || 0,
        rejected_messages: rejectedCount || 0,
      }

      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch message stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Messages',
      value: stats?.total_messages || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Pending Review',
      value: stats?.pending_messages || 0,
      icon: ClockIcon,
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      title: 'Approved',
      value: stats?.approved_messages || 0,
      icon: CheckCircleIcon,
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'Rejected',
      value: stats?.rejected_messages || 0,
      icon: XCircleIcon,
      color: 'from-red-400 to-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-soft-pink/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-black/70 mb-1">
                {stat.title}
              </p>
              {loading ? (
                <div className="animate-pulse bg-soft-pink/20 rounded w-8 h-8"></div>
              ) : (
                <p className="text-2xl font-bold text-charcoal-black">
                  {stat.value}
                </p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
