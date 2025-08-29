'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase'
import { 
  PhotoIcon, 
  VideoCameraIcon,
  DocumentIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface MediaStatisticsProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
  refreshTrigger: number
}

interface MediaData {
  totalFiles: number
  totalSize: number
  imageFiles: number
  videoFiles: number
  otherFiles: number
  averageFileSize: number
  filesByType: { [key: string]: number }
  uploadTrends: Array<{ date: string; uploads: number }>
}

export function MediaStatistics({ dateRange, customDateRange, refreshTrigger }: MediaStatisticsProps) {
  const [data, setData] = useState<MediaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMediaData()
  }, [dateRange, customDateRange, refreshTrigger])

  const fetchMediaData = async () => {
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

      // Fetch media files data
      const { data: mediaFiles, error } = await supabase
        .from('media_files')
        .select('file_type, file_size, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Process data
      const totalFiles = mediaFiles?.length || 0
      const totalSize = mediaFiles?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
      
      const filesByType: { [key: string]: number } = {}
      let imageFiles = 0
      let videoFiles = 0
      let otherFiles = 0

      mediaFiles?.forEach(file => {
        const type = file.file_type || 'unknown'
        filesByType[type] = (filesByType[type] || 0) + 1
        
        if (type.startsWith('image/')) {
          imageFiles++
        } else if (type.startsWith('video/')) {
          videoFiles++
        } else {
          otherFiles++
        }
      })

      // Calculate upload trends
      const uploadTrends: Array<{ date: string; uploads: number }> = []
      const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      for (let i = 0; i < daysInRange; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        const uploadsOnDate = mediaFiles?.filter(file => 
          file.created_at.startsWith(dateStr)
        ).length || 0
        
        uploadTrends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          uploads: uploadsOnDate
        })
      }

      const mediaData: MediaData = {
        totalFiles,
        totalSize,
        imageFiles,
        videoFiles,
        otherFiles,
        averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
        filesByType,
        uploadTrends,
      }

      setData(mediaData)
    } catch (error) {
      console.error('Failed to fetch media data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadTrendsChartData = {
    labels: data?.uploadTrends.map(d => d.date) || [],
    datasets: [
      {
        label: 'File Uploads',
        data: data?.uploadTrends.map(d => d.uploads) || [],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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

  const stats = [
    {
      title: 'Total Files',
      value: data?.totalFiles.toLocaleString() || '0',
      icon: DocumentIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Size',
      value: formatFileSize(data?.totalSize || 0),
      icon: CloudArrowUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Images',
      value: data?.imageFiles.toLocaleString() || '0',
      icon: PhotoIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Videos',
      value: data?.videoFiles.toLocaleString() || '0',
      icon: VideoCameraIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Media Statistics
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
        Media Statistics
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-white/40"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-charcoal-black/70">{stat.title}</p>
              <p className="text-lg font-bold text-charcoal-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Trends Chart */}
      <div className="h-64">
        <h4 className="text-sm font-medium text-charcoal-black mb-3">Upload Trends</h4>
        <Bar data={uploadTrendsChartData} options={chartOptions} />
      </div>

      {/* File Type Breakdown */}
      {data && Object.keys(data.filesByType).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-charcoal-black mb-3">File Types</h4>
          <div className="space-y-2">
            {Object.entries(data.filesByType)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-black/70">{type}</span>
                  <span className="font-medium text-charcoal-black">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
