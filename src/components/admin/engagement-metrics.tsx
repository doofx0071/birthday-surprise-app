'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  BellIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

ChartJS.register(ArcElement, Tooltip, Legend)

interface EngagementMetricsProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
  refreshTrigger: number
}

interface EngagementData {
  approvalRate: number
  responseRate: number
  reminderRate: number
  mediaAttachmentRate: number
  totalMessages: number
  approvedMessages: number
  pendingMessages: number
  rejectedMessages: number
  messagesWithReminders: number
  messagesWithMedia: number
}

export function EngagementMetrics({ dateRange, customDateRange, refreshTrigger }: EngagementMetricsProps) {
  const [data, setData] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEngagementData()
  }, [dateRange, customDateRange, refreshTrigger])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      let startDate: Date
      let endDate = new Date()
      
      if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start)
        endDate = new Date(customDateRange.end)
      } else {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
        startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
      }

      // Fetch messages data using current schema
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, status, wants_reminders, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (messagesError) throw messagesError

      // Fetch media files data
      const { data: mediaFiles, error: mediaError } = await supabase
        .from('media_files')
        .select('message_id')
        .in('message_id', messages?.map(m => m.id) || [])

      if (mediaError) throw mediaError

      // Calculate metrics using current schema
      const totalMessages = messages?.length || 0
      const approvedMessages = messages?.filter(m => m.status === 'approved').length || 0
      const pendingMessages = messages?.filter(m => m.status === 'pending').length || 0
      const rejectedMessages = messages?.filter(m => m.status === 'rejected').length || 0
      const messagesWithReminders = messages?.filter(m => m.wants_reminders).length || 0
      
      const messageIdsWithMedia = new Set(mediaFiles?.map(mf => mf.message_id) || [])
      const messagesWithMedia = messages?.filter(m => messageIdsWithMedia.has(m.id)).length || 0

      const engagementData: EngagementData = {
        totalMessages,
        approvedMessages,
        pendingMessages,
        rejectedMessages,
        messagesWithReminders,
        messagesWithMedia,
        approvalRate: totalMessages > 0 ? (approvedMessages / totalMessages) * 100 : 0,
        responseRate: totalMessages > 0 ? ((approvedMessages + rejectedMessages) / totalMessages) * 100 : 0,
        reminderRate: totalMessages > 0 ? (messagesWithReminders / totalMessages) * 100 : 0,
        mediaAttachmentRate: totalMessages > 0 ? (messagesWithMedia / totalMessages) * 100 : 0,
      }

      setData(engagementData)
    } catch (error) {
      console.error('Failed to fetch engagement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const approvalChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          data?.approvedMessages || 0,
          data?.pendingMessages || 0,
          data?.rejectedMessages || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const metrics = [
    {
      title: 'Approval Rate',
      value: `${data?.approvalRate.toFixed(1) || 0}%`,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Response Rate',
      value: `${data?.responseRate.toFixed(1) || 0}%`,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Reminder Rate',
      value: `${data?.reminderRate.toFixed(1) || 0}%`,
      icon: BellIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Media Attachment Rate',
      value: `${data?.mediaAttachmentRate.toFixed(1) || 0}%`,
      icon: PhotoIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Engagement Metrics
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-soft-pink/20 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-soft-pink/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <h3 className="font-display text-lg font-semibold text-charcoal-black mb-6">
        Engagement Metrics
      </h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-white/40"
          >
            <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/70">{metric.title}</p>
              <p className="text-lg font-bold text-charcoal-black">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Approval Status Chart */}
      <div className="h-64">
        <h4 className="text-sm font-medium text-charcoal-black mb-3">Message Approval Status</h4>
        <Doughnut data={approvalChartData} options={chartOptions} />
      </div>
    </div>
  )
}
