'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DeliveryStats {
  totalSent: number
  delivered: number
  bounced: number
  failed: number
  pending: number
  deliveryRate: number
  bounceRate: number
  dailyStats: Array<{
    date: string
    sent: number
    delivered: number
    bounced: number
  }>
  campaignStats: Array<{
    name: string
    sent: number
    delivered: number
    bounceRate: number
  }>
}

export function EmailDeliveryStats() {
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchDeliveryStats()
  }, [timeRange])

  const fetchDeliveryStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/email-stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // If API fails, show empty stats
        setStats({
          totalSent: 0,
          delivered: 0,
          bounced: 0,
          failed: 0,
          pending: 0,
          deliveryRate: 0,
          bounceRate: 0,
          dailyStats: [],
          campaignStats: [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch delivery stats:', error)
      // Show empty stats on error
      setStats({
        totalSent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0,
        pending: 0,
        deliveryRate: 0,
        bounceRate: 0,
        dailyStats: [],
        campaignStats: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const deliveryChartData = {
    labels: ['Delivered', 'Bounced', 'Failed', 'Pending'],
    datasets: [
      {
        data: [
          stats?.delivered || 0,
          stats?.bounced || 0,
          stats?.failed || 0,
          stats?.pending || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const dailyTrendsData = {
    labels: stats?.dailyStats.map(d => d.date) || [],
    datasets: [
      {
        label: 'Sent',
        data: stats?.dailyStats.map(d => d.sent) || [],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Delivered',
        data: stats?.dailyStats.map(d => d.delivered) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Bounced',
        data: stats?.dailyStats.map(d => d.bounced) || [],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const statCards = [
    {
      title: 'Total Sent',
      value: stats?.totalSent.toLocaleString() || '0',
      icon: PaperAirplaneIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Delivered',
      value: stats?.delivered.toLocaleString() || '0',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Bounced',
      value: stats?.bounced.toLocaleString() || '0',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Failed',
      value: stats?.failed.toLocaleString() || '0',
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-soft-pink/20 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-soft-pink/20 rounded-lg"></div>
            <div className="h-80 bg-soft-pink/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-charcoal-black">Email Delivery Statistics</h3>
        <div className="flex items-center space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-soft-pink text-white'
                  : 'text-charcoal-black/70 hover:bg-soft-pink/10'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/40 rounded-lg p-4 border border-soft-pink/20"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-charcoal-black/70">{card.title}</p>
                <p className="text-lg font-bold text-charcoal-black">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delivery Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-charcoal-black">Delivery Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats?.deliveryRate.toFixed(1) || 0}%
          </p>
        </div>

        <div className="bg-white/40 rounded-lg p-4 border border-soft-pink/20">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-charcoal-black">Bounce Rate</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {stats?.bounceRate.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4">Daily Email Trends</h4>
          <div className="h-80">
            <Line data={dailyTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Delivery Status Distribution */}
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4">Delivery Status Distribution</h4>
          <div className="h-80">
            <Doughnut data={deliveryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      {stats?.campaignStats && stats.campaignStats.length > 0 && (
        <div className="bg-white/40 rounded-lg p-6 border border-soft-pink/20">
          <h4 className="font-medium text-charcoal-black mb-4">Campaign Performance</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-pink/20">
                  <th className="text-left py-2 text-charcoal-black/70">Campaign</th>
                  <th className="text-right py-2 text-charcoal-black/70">Sent</th>
                  <th className="text-right py-2 text-charcoal-black/70">Delivered</th>
                  <th className="text-right py-2 text-charcoal-black/70">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.campaignStats.map((campaign, index) => (
                  <tr key={index} className="border-b border-soft-pink/10">
                    <td className="py-2 text-charcoal-black">{campaign.name}</td>
                    <td className="py-2 text-right text-charcoal-black">{campaign.sent}</td>
                    <td className="py-2 text-right text-charcoal-black">{campaign.delivered}</td>
                    <td className="py-2 text-right text-charcoal-black">
                      {campaign.bounceRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
