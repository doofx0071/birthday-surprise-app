'use client'

import { useState, useEffect, useCallback } from 'react'

export interface SystemConfig {
  birthdayDate: string
  birthdayPersonName: string
  timezone: string
  enableCountdown: boolean
  countdownStartDate: string | null
  enableEmailNotifications: boolean
  requireMessageApproval: boolean
  lastUpdated: string | null
  isConfigured: boolean
}

interface UseSystemConfigReturn {
  config: SystemConfig | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch and manage system configuration from the database
 * This replaces the need to use environment variables for dynamic configuration
 */
export function useSystemConfig(): UseSystemConfigReturn {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/system-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch system configuration: ${response.status}`)
      }

      const data = await response.json()
      setConfig(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching system configuration:', err)
      
      // Set fallback configuration if API fails
      setConfig({
        birthdayDate: '',
        birthdayPersonName: 'Your Special Someone',
        timezone: 'Asia/Manila',
        enableCountdown: true,
        countdownStartDate: null,
        enableEmailNotifications: true,
        requireMessageApproval: true,
        lastUpdated: null,
        isConfigured: false,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  // Auto-refresh configuration every 30 seconds to catch database changes
  useEffect(() => {
    const interval = setInterval(fetchConfig, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [fetchConfig])

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
  }
}

/**
 * Helper function to get birthday configuration with fallbacks
 * Ensures the target date is set to exactly midnight in the specified timezone
 */
export function getBirthdayConfigFromSystem(config: SystemConfig | null) {
  if (!config) {
    // If no config is available, return a default that won't trigger countdown
    // This should not happen in normal operation since config should always be loaded
    console.warn('⚠️ No system configuration available, using safe defaults')
    return {
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      timezone: 'Asia/Manila',
      girlfriendName: 'Your Special Someone',
    }
  }

  // Ensure the birthday date is set to exactly midnight in the configured timezone
  const birthdayDate = config.birthdayDate
  const timezone = config.timezone || 'Asia/Manila'

  if (!birthdayDate) {
    console.error('❌ No birthday date found in system configuration')
    // Return a safe default that won't trigger countdown
    return {
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      timezone,
      girlfriendName: config.birthdayPersonName || 'Your Special Someone',
    }
  }

  // If the date doesn't include time, add midnight in the specified timezone
  let targetDate = birthdayDate
  if (!birthdayDate.includes('T')) {
    // Add midnight time with timezone offset
    const timezoneOffset = timezone === 'Asia/Manila' ? '+08:00' : '+00:00'
    targetDate = `${birthdayDate}T00:00:00${timezoneOffset}`
  }

  return {
    targetDate,
    timezone,
    girlfriendName: config.birthdayPersonName || 'Your Special Someone',
  }
}
