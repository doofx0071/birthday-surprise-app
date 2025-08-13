'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
  isValid: boolean
}

export interface CountdownConfig {
  targetDate: Date | string
  onComplete?: () => void
  onTick?: (timeRemaining: TimeRemaining) => void
  updateInterval?: number
  timezone?: string
}

/**
 * Custom hook for countdown timer functionality
 * Calculates time remaining until target date with real-time updates
 */
export function useCountdown(config: CountdownConfig): TimeRemaining {
  const { targetDate, onComplete, onTick, updateInterval = 1000, timezone } = config

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isComplete: false,
    isValid: false,
  })

  // Use refs to store stable references
  const targetDateRef = useRef<Date | string>(targetDate)
  const onCompleteRef = useRef(onComplete)
  const onTickRef = useRef(onTick)
  const wasCompleteRef = useRef(false)

  // Update refs when props change
  targetDateRef.current = targetDate
  onCompleteRef.current = onComplete
  onTickRef.current = onTick

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      try {
        const target = new Date(targetDateRef.current)
        let now = new Date()

        // If timezone is specified, adjust the current time to that timezone
        if (timezone) {
          // Get current time in the specified timezone
          const nowInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
          // Get current time in local timezone
          const nowLocal = new Date(now.toLocaleString("en-US"))
          // Calculate the offset and apply it
          const offset = nowInTimezone.getTime() - nowLocal.getTime()
          now = new Date(now.getTime() + offset)
        }

        // Validate target date
        if (isNaN(target.getTime())) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: 0,
            isComplete: false,
            isValid: false,
          }
        }

        const total = target.getTime() - now.getTime()

        // If countdown is complete
        if (total <= 0) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: 0,
            isComplete: true,
            isValid: true,
          }
        }

        // Calculate time units
        const days = Math.floor(total / (1000 * 60 * 60 * 24))
        const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((total % (1000 * 60)) / 1000)

        return {
          days,
          hours,
          minutes,
          seconds,
          total,
          isComplete: false,
          isValid: true,
        }
      } catch (error) {
        console.error('Error calculating countdown:', error)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          isComplete: false,
          isValid: false,
        }
      }
    }

    // Initial calculation
    const initialTime = calculateTimeRemaining()
    setTimeRemaining(initialTime)
    wasCompleteRef.current = initialTime.isComplete

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining()

      // Call onComplete callback if countdown finished
      if (newTime.isComplete && !wasCompleteRef.current) {
        onCompleteRef.current?.()
      }

      wasCompleteRef.current = newTime.isComplete
      setTimeRemaining(newTime)

      // Call onTick callback if provided
      onTickRef.current?.(newTime)
    }, updateInterval)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [updateInterval]) // Only depend on updateInterval

  return timeRemaining
}

/**
 * Hook for managing countdown animations and effects
 */
export function useCountdownAnimations() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastValues, setLastValues] = useState<Partial<TimeRemaining>>({})

  const triggerAnimation = useCallback((newValues: TimeRemaining) => {
    // Check if any values changed to trigger animations
    const hasChanged = 
      newValues.days !== lastValues.days ||
      newValues.hours !== lastValues.hours ||
      newValues.minutes !== lastValues.minutes ||
      newValues.seconds !== lastValues.seconds

    if (hasChanged) {
      setIsAnimating(true)
      setLastValues(newValues)
      
      // Reset animation state after animation duration
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [lastValues])

  return {
    isAnimating,
    triggerAnimation,
    lastValues,
  }
}

/**
 * Hook for celebration effects when countdown completes
 */
export function useCelebrationEffects() {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const startCelebration = useCallback(() => {
    setIsCelebrating(true)
    setShowConfetti(true)
    
    // Stop confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000)
    
    // Stop celebration after 10 seconds
    setTimeout(() => setIsCelebrating(false), 10000)
  }, [])

  const stopCelebration = useCallback(() => {
    setIsCelebrating(false)
    setShowConfetti(false)
  }, [])

  return {
    isCelebrating,
    showConfetti,
    startCelebration,
    stopCelebration,
  }
}

/**
 * Utility function to format time units without leading zeros
 * For days, we might want to pad to 3 digits for large values
 * For hours, minutes, seconds, we display without leading zeros
 */
export function formatTimeUnit(value: number, minDigits: number = 2, unit?: string): string {
  // For days, we might want padding for very large numbers (100+ days)
  if (unit === 'days' && value >= 100) {
    return value.toString().padStart(3, '0')
  }

  // For all other cases, no leading zeros
  return value.toString()
}

/**
 * Utility function to get relative time description
 */
export function getTimeDescription(timeRemaining: TimeRemaining): string {
  if (!timeRemaining.isValid) {
    return 'Invalid date'
  }

  if (timeRemaining.isComplete) {
    return 'Birthday time! 🎉'
  }

  const { days, hours, minutes } = timeRemaining

  if (days > 1) {
    return `${days} days to go`
  } else if (days === 1) {
    return 'Tomorrow is the big day!'
  } else if (hours > 1) {
    return `${hours} hours remaining`
  } else if (hours === 1) {
    return 'Less than an hour left!'
  } else if (minutes > 1) {
    return `${minutes} minutes to go`
  } else {
    return 'Almost there!'
  }
}

/**
 * Utility function to format target date in different formats
 */
export function formatTargetDate(
  targetDate: Date | string,
  format: 'default' | 'long' | 'short' = 'default',
  timezone?: string
): string {
  try {
    const date = new Date(targetDate)

    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'UTC',
    }

    switch (format) {
      case 'long':
        return date.toLocaleDateString('en-US', {
          ...options,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

      case 'short':
        return date.toLocaleDateString('en-US', {
          ...options,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

      default:
        return date.toLocaleDateString('en-US', {
          ...options,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Utility function to create a birthday date for the current or next year
 */
export function createBirthdayDate(month: number, day: number, year?: number): Date {
  const now = new Date()
  const currentYear = year || now.getFullYear()
  
  // Create birthday date for the specified year
  let birthdayDate = new Date(currentYear, month - 1, day, 0, 0, 0, 0)
  
  // If the birthday has already passed this year, use next year
  if (!year && birthdayDate.getTime() <= now.getTime()) {
    birthdayDate = new Date(currentYear + 1, month - 1, day, 0, 0, 0, 0)
  }
  
  return birthdayDate
}
