'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TimeUnit, FlipTimeUnit } from './time-unit'
import { CelebrationAnimation, PulseCelebration } from './celebration-animation'

import {
  useCountdown,
  useCountdownAnimations,
  useCelebrationEffects,
  getTimeDescription,
  formatTargetDate,
  type CountdownConfig,
  type TimeRemaining
} from './countdown-hooks'

interface CountdownDisplayProps extends Omit<CountdownConfig, 'onComplete' | 'onTick'> {
  girlfriendName?: string
  variant?: 'default' | 'large' | 'compact'
  showSparkles?: boolean
  enableFlipAnimation?: boolean
  enableCelebration?: boolean
  showTargetDate?: boolean
  dateFormat?: 'default' | 'long' | 'short'
  className?: string
  onComplete?: () => void
  onTick?: (timeRemaining: TimeRemaining) => void
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  targetDate,
  timezone,
  girlfriendName = "Your Special Someone",
  variant = 'default',
  showSparkles = true,
  enableFlipAnimation = true,
  enableCelebration = true,
  showTargetDate = false,
  dateFormat = 'default',
  className,
  onComplete,
  onTick,
  updateInterval = 1000,
}) => {
  const { isAnimating, triggerAnimation, lastValues } = useCountdownAnimations()
  const { isCelebrating, showConfetti, startCelebration } = useCelebrationEffects()

  const timeRemaining = useCountdown({
    targetDate,
    timezone,
    updateInterval,
    onComplete: () => {
      if (enableCelebration) {
        startCelebration()
      }
      onComplete?.()
    },
    onTick: (time) => {
      triggerAnimation(time)
      onTick?.(time)
    },
  })

  const timeDescription = getTimeDescription(timeRemaining)

  const getLayoutStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16',
          title: 'text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3', // Smaller "Countdown to" text
          subtitle: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 sm:mb-8', // Larger birthday name
          grid: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8',
          description: 'text-base sm:text-lg md:text-xl lg:text-2xl mt-6 sm:mt-8',
        }
      case 'compact':
        return {
          container: 'p-3 sm:p-4 md:p-6',
          title: 'text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4',
          subtitle: 'text-sm sm:text-base md:text-lg mb-3 sm:mb-4',
          grid: 'grid-cols-4 gap-2 sm:gap-3 md:gap-4',
          description: 'text-xs sm:text-sm md:text-base mt-3 sm:mt-4',
        }
      default:
        return {
          container: 'p-4 sm:p-6 md:p-8 lg:p-10',
          title: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 sm:mb-6',
          subtitle: 'text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6',
          grid: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6',
          description: 'text-sm sm:text-base md:text-lg lg:text-xl mt-4 sm:mt-6',
        }
    }
  }

  const styles = getLayoutStyles()

  if (!timeRemaining.isValid) {
    return (
      <div className={cn(
        'relative bg-gradient-to-br from-white to-primary/5',
        'rounded-3xl shadow-xl border border-primary/10',
        'text-center',
        styles.container,
        className
      )}>
        <div className="text-destructive">
          <h2 className="font-display text-2xl font-bold mb-2">Invalid Date</h2>
          <p className="font-body">Please check the target date configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative neuro-countdown-container',
        'overflow-hidden w-full max-w-6xl mx-auto',
        'countdown-container countdown-text',
        // Only apply padding when countdown is active, not when showing birthday card
        timeRemaining.isComplete ? '' : styles.container,
        className
      )}
    >
      {/* Background decorative elements */}


      {/* Content */}
      <div className="relative z-10">
        {/* Birthday Card - 16:9 Responsive */}
        {timeRemaining.isComplete ? (
          <div className="w-full max-w-6xl mx-auto">
            {/* 16:9 Aspect Ratio Container with Background */}
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                aspectRatio: '16/9',
                backgroundImage: 'url(/assets/images/backgrounds/card-background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4 sm:px-6 md:px-8 lg:px-12">
                  <h1
                    className={cn(
                      'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-black drop-shadow-lg mb-2 sm:mb-3 md:mb-4 uppercase tracking-wider',
                      styles.subtitle
                    )}
                    style={{ fontFamily: 'Kalam, cursive', fontWeight: 700 }}
                  >
                    HAPPY BIRTHDAY
                  </h1>
                  <h2 className={cn(
                    'font-black text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-bright-pink drop-shadow-lg mb-3 sm:mb-4 md:mb-6 uppercase tracking-wide truncate max-w-full',
                    styles.subtitle
                  )}>
                    {girlfriendName}
                  </h2>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <p className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-charcoal-black/80">
                      The special day has arrived!
                    </p>
                    <p className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-charcoal-black/80 flex items-center justify-center gap-2">
                      Enjoy this present!
                      <span className="text-xl sm:text-2xl md:text-3xl animate-bounce">🎁</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Title - Only show when countdown is active */}
            <div className="text-center mb-6">
              <h1 className={cn(
                'font-body font-medium text-lg text-charcoal-black/60', // Smaller, lighter text for "Countdown to"
                styles.title
              )}>
                Countdown to
              </h1>
              <h2 className={cn(
                'font-heading font-black text-4xl md:text-5xl lg:text-6xl text-bright-pink drop-shadow-sm', // Much larger, bolder, BRIGHT pink name
                styles.subtitle
              )}>
                {girlfriendName} Birthday
              </h2>

              {/* Target Date Display */}
              {showTargetDate && (
                <p className="font-body text-sm md:text-base text-charcoal-black/60 mt-2">
                  {formatTargetDate(targetDate, dateFormat, timezone)}
                </p>
              )}
            </div>

            <div className={cn(
              'grid w-full',
              'countdown-mobile-grid sm:countdown-tablet-grid md:countdown-desktop-grid',
              styles.grid
            )}>
              {enableFlipAnimation ? (
                <>
                  <FlipTimeUnit
                    value={timeRemaining.days}
                    previousValue={lastValues.days}
                    label="Days"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.days > 0}
                    className="countdown-time-unit"
                  />
                  <FlipTimeUnit
                    value={timeRemaining.hours}
                    previousValue={lastValues.hours}
                    label="Hours"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.hours > 0}
                    className="countdown-time-unit"
                  />
                  <FlipTimeUnit
                    value={timeRemaining.minutes}
                    previousValue={lastValues.minutes}
                    label="Minutes"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.minutes > 0}
                    className="countdown-time-unit"
                  />
                  <FlipTimeUnit
                    value={timeRemaining.seconds}
                    previousValue={lastValues.seconds}
                    label="Seconds"
                    variant={variant}
                    showSparkles={showSparkles}
                    className="countdown-time-unit"
                  />
                </>
              ) : (
                <>
                  <TimeUnit
                    value={timeRemaining.days}
                    label="Days"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles && timeRemaining.days > 0}
                    className="countdown-time-unit"
                  />
                  <TimeUnit
                    value={timeRemaining.hours}
                    label="Hours"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles && timeRemaining.hours > 0}
                    className="countdown-time-unit"
                  />
                  <TimeUnit
                    value={timeRemaining.minutes}
                    label="Minutes"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles && timeRemaining.minutes > 0}
                    className="countdown-time-unit"
                  />
                  <TimeUnit
                    value={timeRemaining.seconds}
                    label="Seconds"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles}
                    className="countdown-time-unit"
                  />
                </>
              )}
            </div>

            {/* Time description */}
            <div className={cn(
              'text-center text-charcoal-black/70 font-body countdown-mobile-text',
              'px-4 sm:px-6',
              styles.description
            )}>
              {timeDescription}
            </div>
          </>
        )}
      </div>

      {/* Celebration effects */}
      {enableCelebration && (
        <>
          <PulseCelebration
            isActive={timeRemaining.isComplete && !isCelebrating}
            intensity="medium"
          />
        </>
      )}
    </div>
  )
}
