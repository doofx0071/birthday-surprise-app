'use client'

import { useState, useEffect } from 'react'
// Note: Removed legacy imports - now using system configuration directly
import { useSystemConfig, getBirthdayConfigFromSystem } from '@/hooks/use-system-config'

export interface CountdownStatus {
  isComplete: boolean
  isBirthdayTime: boolean
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }
  isLoading: boolean
}

export interface UseCountdownStatusOptions {
  /**
   * Update interval in milliseconds
   * @default 1000
   */
  updateInterval?: number
  
  /**
   * Simulate countdown completion for preview purposes
   * @default false
   */
  simulateComplete?: boolean
}

/**
 * Hook to get the current countdown status
 * Provides real-time updates on whether the birthday countdown is complete
 */
export function useCountdownStatus(options: UseCountdownStatusOptions = {}): CountdownStatus {
  const { updateInterval = 1000, simulateComplete = false } = options
  const { config: systemConfig } = useSystemConfig()

  const [status, setStatus] = useState<CountdownStatus>({
    isComplete: false,
    isBirthdayTime: false,
    timeRemaining: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    },
    isLoading: true,
  })

  useEffect(() => {
    const updateStatus = () => {
      try {
        // Get birthday config from system configuration
        const birthdayConfig = getBirthdayConfigFromSystem(systemConfig)
        const targetDate = new Date(birthdayConfig.targetDate)
        const now = new Date()

        // Calculate time remaining
        const total = targetDate.getTime() - now.getTime()
        const isComplete = total <= 0

        let timeRemaining = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        }

        if (!isComplete) {
          timeRemaining = {
            days: Math.floor(total / (1000 * 60 * 60 * 24)),
            hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((total % (1000 * 60)) / 1000),
            total,
          }
        }

        // Check if it's birthday time (current time >= target time)
        const isBirthdayTime = now.getTime() >= targetDate.getTime()

        setStatus({
          isComplete: simulateComplete || isComplete,
          isBirthdayTime: simulateComplete || isBirthdayTime,
          timeRemaining,
          isLoading: false,
        })
      } catch (error) {
        console.error('Error updating countdown status:', error)
        setStatus(prev => ({ ...prev, isLoading: false }))
      }
    }

    // Initial update
    updateStatus()

    // Set up interval for real-time updates
    const interval = setInterval(updateStatus, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval, simulateComplete, systemConfig])

  return status
}

/**
 * Hook specifically for checking if content should be revealed
 * This is the main hook components should use to determine visibility
 */
export function useContentReveal(simulateComplete = false): {
  shouldRevealContent: boolean
  isLoading: boolean
  countdownStatus: CountdownStatus
} {
  const countdownStatus = useCountdownStatus({ simulateComplete })
  
  return {
    shouldRevealContent: countdownStatus.isComplete || countdownStatus.isBirthdayTime,
    isLoading: countdownStatus.isLoading,
    countdownStatus,
  }
}

/**
 * Hook for admin preview functionality
 * Provides both current and simulated states
 */
export function useAdminPreview() {
  const currentStatus = useCountdownStatus()
  const simulatedStatus = useCountdownStatus({ simulateComplete: true })
  
  return {
    current: {
      status: currentStatus,
      shouldRevealContent: currentStatus.isComplete || currentStatus.isBirthdayTime,
    },
    simulated: {
      status: simulatedStatus,
      shouldRevealContent: true, // Always true in simulation
    },
    isLoading: currentStatus.isLoading,
  }
}
