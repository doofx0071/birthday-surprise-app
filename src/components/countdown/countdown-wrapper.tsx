'use client'

import React, { useRef } from 'react'
import { CountdownTimer } from './countdown-timer'
import { useSystemConfig, getBirthdayConfigFromSystem } from '@/hooks/use-system-config'

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
  const { config: systemConfig } = useSystemConfig()
  const lastCompletionRef = useRef<number>(0)

  // Get birthday configuration from system
  const birthdayConfig = getBirthdayConfigFromSystem(systemConfig)

  // Handle countdown completion with email trigger
  const handleCountdownComplete = async () => {
    try {
      // Debounce: prevent multiple calls within 30 seconds
      const now = Date.now()
      if (now - lastCompletionRef.current < 30000) {
        console.log('🎂 Countdown completion debounced (too recent)')
        return
      }
      lastCompletionRef.current = now

      console.log('🎂 Countdown complete! Checking if emails need to be triggered...')

      // First check if emails have already been sent
      const statusResponse = await fetch('/api/countdown/trigger?action=status')
      const statusResult = await statusResponse.json()

      if (statusResult.success && statusResult.data.trigger.emailsSent) {
        console.log('📧 Birthday emails already sent, skipping trigger')
        return
      }

      // Check if countdown trigger is already monitoring
      if (statusResult.success && statusResult.data.trigger.isMonitoring) {
        console.log('📧 Countdown trigger already monitoring, skipping duplicate trigger')
        return
      }

      console.log('🎂 Triggering birthday emails...')
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
      targetDate={props.targetDate || birthdayConfig.targetDate}
      timezone={props.timezone || birthdayConfig.timezone}
      girlfriendName={props.girlfriendName || birthdayConfig.girlfriendName}
      variant={props.variant}
      showSparkles={props.showSparkles}
      enableFlipAnimation={props.enableFlipAnimation}
      enableCelebration={props.enableCelebration}
      showTargetDate={props.showTargetDate}
      dateFormat={props.dateFormat}
      className={props.className}
      onComplete={handleCountdownComplete}
    />
  )
}
