'use client'

import { useState, useEffect, useCallback } from 'react'

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
}

/**
 * Custom hook for countdown timer functionality
 * Calculates time remaining until target date with real-time updates
 */
export function useCountdown(config: CountdownConfig): TimeRemaining {
  const { targetDate, onComplete, onTick, updateInterval = 1000 } = config
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isComplete: false,
    isValid: false,
  })

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    try {
      const target = new Date(targetDate)
      const now = new Date()
      
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
  }, [targetDate])

  useEffect(() => {
    // Initial calculation
    const initialTime = calculateTimeRemaining()
    setTimeRemaining(initialTime)

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining()
      setTimeRemaining(newTime)
      
      // Call onTick callback if provided
      onTick?.(newTime)
      
      // Call onComplete callback if countdown finished
      if (newTime.isComplete && !timeRemaining.isComplete) {
        onComplete?.()
      }
    }, updateInterval)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [calculateTimeRemaining, onComplete, onTick, updateInterval, timeRemaining.isComplete])

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
 * Utility function to format time units with leading zeros
 */
export function formatTimeUnit(value: number, minDigits: number = 2): string {
  return value.toString().padStart(minDigits, '0')
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
