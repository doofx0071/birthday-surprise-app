'use client'

import React from 'react'
import CountdownTimer from './countdown-timer'

interface CountdownWrapperProps {
  targetDate?: string
  timezone?: string
  girlfriendName?: string
  variant?: 'default' | 'large' | 'compact'
  showSparkles?: boolean
  enableFlipAnimation?: boolean
  enableCelebration?: boolean
  showTargetDate?: boolean
  dateFormat?: 'default' | 'long' | 'short'
  className?: string
}

export const CountdownWrapper: React.FC<CountdownWrapperProps> = (props) => {
  // Handle countdown completion with email trigger
  const handleCountdownComplete = async () => {
    try {
      console.log('🎂 Countdown complete! Triggering birthday emails...')
      const response = await fetch('/api/countdown/trigger?action=start')
      const result = await response.json()
      if (result.success) {
        console.log('✅ Birthday email trigger started successfully')
      } else {
        console.error('❌ Failed to trigger birthday emails:', result.error)
      }
    } catch (error) {
      console.error('❌ Error triggering birthday emails:', error)
    }
  }

  return (
    <CountdownTimer
      {...props}
      onComplete={handleCountdownComplete}
    />
  )
}
