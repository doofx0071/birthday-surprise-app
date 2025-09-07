'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

interface CountryData {
  country: string
  count: number
  percentage: number
}

interface GeographicDistributionProps {
  dateRange: '7d' | '30d' | '90d' | 'custom'
  customDateRange: { start: string; end: string }
  refreshTrigger: number
}

export function GeographicDistribution({ dateRange, customDateRange, refreshTrigger }: GeographicDistributionProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGeographicData()
  }, [dateRange, customDateRange, refreshTrigger])

  const fetchGeographicData = async () => {
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

      // Get messages with location data in date range
      const { data, error } = await supabase
        .from('messages')
        .select('location')
        .not('location', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Process location data
      const countryMap = new Map<string, number>()
      let totalMessages = 0

      data?.forEach((message: any) => {
        totalMessages++
        const location = message.location || ''

        // Extract country from location string (assuming format like "City, Country")
        const parts = location.split(',').map(p => p.trim())
        const country = parts.length > 1 ? parts[parts.length - 1] : 'Unknown'

        countryMap.set(country, (countryMap.get(country) || 0) + 1)
      })

      // Convert to array and calculate percentages
      const countries: CountryData[] = Array.from(countryMap.entries())
        .map(([country, count]) => ({
          country,
          count,
          percentage: totalMessages > 0 ? (count / totalMessages) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 countries

      setCountryData(countries)
    } catch (error) {
      console.error('Failed to fetch geographic data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
        <h3 className="font-display text-lg font-semibold text-charcoal-black mb-4">
          Geographic Distribution
        </h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-soft-pink/20 rounded"></div>
              <div className="flex-1 h-4 bg-soft-pink/20 rounded"></div>
              <div className="w-8 h-4 bg-soft-pink/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-soft-pink/20">
      <div className="flex items-center space-x-2 mb-4">
        <MapPinIcon className="w-5 h-5 text-soft-pink" />
        <h3 className="font-display text-lg font-semibold text-charcoal-black">
          Geographic Distribution
        </h3>
      </div>
      
      <div className="space-y-3">
        {countryData.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 text-charcoal-black/30 mx-auto mb-3" />
            <p className="text-charcoal-black/60">No location data available</p>
          </div>
        ) : (
          countryData.map((item, index) => (
            <motion.div
              key={item.country}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-soft-pink/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-soft-pink to-rose-gold rounded-full"></div>
                <span className="font-medium text-charcoal-black">
                  {item.country}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-soft-pink/10 rounded-full h-2 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-soft-pink to-rose-gold rounded-full"
                  />
                </div>
                <div className="text-sm font-medium text-charcoal-black w-8 text-right">
                  {item.count}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {countryData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-soft-pink/20">
          <p className="text-xs text-charcoal-black/50 text-center">
            Showing top {countryData.length} countries by message count
          </p>
        </div>
      )}
    </div>
  )
}
