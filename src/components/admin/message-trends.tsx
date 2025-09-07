'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MessageTrendsProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
  refreshTrigger: number
}

export function MessageTrends({ dateRange, customDateRange, refreshTrigger }: MessageTrendsProps) {
  const [trendData, setTrendData] = useState<Array<{ date: string; messages: number; approved: number; pending: number }>>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  useEffect(() => {
    fetchTrendData()
  }, [dateRange, customDateRange, refreshTrigger])

  const fetchTrendData = async () => {
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
        startDate = subDays(endDate, days - 1)
      }

      const { data, error } = await supabase
        .from('messages')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Create array of days in range
      const days = eachDayOfInterval({ start: startDate, end: endDate })

      // Count messages per day with approval status
      const trendsMap = new Map()
      days.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        trendsMap.set(dateKey, { total: 0, approved: 0, pending: 0 })
      })

      data?.forEach((message: any) => {
        const dateKey = format(new Date(message.created_at), 'yyyy-MM-dd')
        const current = trendsMap.get(dateKey) || { total: 0, approved: 0, pending: 0 }

        current.total += 1
        if (message.status === 'approved') {
          current.approved += 1
        } else if (message.status === 'pending') {
          current.pending += 1
        }

        trendsMap.set(dateKey, current)
      })

      const trends = Array.from(trendsMap.entries()).map(([date, counts]) => ({
        date: format(new Date(date), 'MMM dd'),
        messages: counts.total,
        approved: counts.approved,
        pending: counts.pending,
      }))

      setTrendData(trends)
    } catch (error) {
      console.error('Failed to fetch trend data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Chart.js configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
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

  const chartData = {
    labels: trendData.map(d => d.date),
    datasets: [
      {
        label: 'Total Messages',
        data: trendData.map(d => d.messages),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Approved',
        data: trendData.map(d => d.approved),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pending',
        data: trendData.map(d => d.pending),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.4,
      },
    ],
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Message Trends
        </h3>
        <div className="animate-pulse">
          <div className="h-80 bg-soft-pink/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          Message Trends
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            className="flex items-center space-x-1"
          >
            <ArrowTrendingUpIcon className="w-4 h-4" />
            <span>Line</span>
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="flex items-center space-x-1"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Bar</span>
          </Button>
        </div>
      </div>

      <div className="h-80">
        {chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {trendData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-charcoal-black/60">No message data available for the selected period</p>
        </div>
      )}
    </div>
  )
}
