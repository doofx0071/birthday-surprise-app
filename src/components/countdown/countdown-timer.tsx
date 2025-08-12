'use client'

import React from 'react'
import { CountdownDisplay } from './countdown-display'
import { createBirthdayDate, type TimeRemaining } from './countdown-hooks'

interface CountdownTimerProps {
  // Date configuration
  targetDate?: Date | string
  birthdayMonth?: number
  birthdayDay?: number
  birthdayYear?: number
  
  // Display configuration
  girlfriendName?: string
  variant?: 'default' | 'large' | 'compact'
  
  // Feature toggles
  showSparkles?: boolean
  enableFlipAnimation?: boolean
  enableCelebration?: boolean
  
  // Styling
  className?: string
  
  // Callbacks
  onComplete?: () => void
  onTick?: (timeRemaining: TimeRemaining) => void
  
  // Performance
  updateInterval?: number
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  birthdayMonth,
  birthdayDay,
  birthdayYear,
  girlfriendName = "Your Special Someone",
  variant = 'default',
  showSparkles = true,
  enableFlipAnimation = true,
  enableCelebration = true,
  className,
  onComplete,
  onTick,
  updateInterval = 1000,
}) => {
  // Determine the target date
  const getTargetDate = (): Date | string => {
    if (targetDate) {
      return targetDate
    }
    
    if (birthdayMonth && birthdayDay) {
      return createBirthdayDate(birthdayMonth, birthdayDay, birthdayYear)
    }
    
    // Default to a sample birthday (you can customize this)
    return createBirthdayDate(12, 25) // Christmas as default
  }

  const finalTargetDate = getTargetDate()

  return (
    <CountdownDisplay
      targetDate={finalTargetDate}
      girlfriendName={girlfriendName}
      variant={variant}
      showSparkles={showSparkles}
      enableFlipAnimation={enableFlipAnimation}
      enableCelebration={enableCelebration}
      className={className}
      onComplete={onComplete}
      onTick={onTick}
      updateInterval={updateInterval}
    />
  )
}

// Export all countdown components for easy importing
export { CountdownDisplay } from './countdown-display'
export { TimeUnit, FlipTimeUnit } from './time-unit'
export { CelebrationAnimation, PulseCelebration } from './celebration-animation'
export { 
  useCountdown, 
  useCountdownAnimations, 
  useCelebrationEffects,
  formatTimeUnit,
  getTimeDescription,
  createBirthdayDate,
  type TimeRemaining,
  type CountdownConfig 
} from './countdown-hooks'

// Default export
export default CountdownTimer
