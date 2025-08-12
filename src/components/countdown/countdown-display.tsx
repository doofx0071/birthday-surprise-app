'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TimeUnit, FlipTimeUnit } from './time-unit'
import { CelebrationAnimation, PulseCelebration } from './celebration-animation'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'
import {
  useCountdown,
  useCountdownAnimations,
  useCelebrationEffects,
  getTimeDescription,
  type CountdownConfig,
  type TimeRemaining
} from './countdown-hooks'

interface CountdownDisplayProps extends Omit<CountdownConfig, 'onComplete' | 'onTick'> {
  girlfriendName?: string
  variant?: 'default' | 'large' | 'compact'
  showSparkles?: boolean
  enableFlipAnimation?: boolean
  enableCelebration?: boolean
  className?: string
  onComplete?: () => void
  onTick?: (timeRemaining: TimeRemaining) => void
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  targetDate,
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
  const { isAnimating, triggerAnimation, lastValues } = useCountdownAnimations()
  const { isCelebrating, showConfetti, startCelebration } = useCelebrationEffects()

  const timeRemaining = useCountdown({
    targetDate,
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
          container: 'p-8 md:p-12',
          title: 'text-3xl md:text-5xl lg:text-6xl mb-6',
          subtitle: 'text-xl md:text-2xl mb-8',
          grid: 'grid-cols-2 md:grid-cols-4 gap-4 md:gap-6',
          description: 'text-lg md:text-xl mt-8',
        }
      case 'compact':
        return {
          container: 'p-4 md:p-6',
          title: 'text-xl md:text-2xl mb-4',
          subtitle: 'text-base md:text-lg mb-4',
          grid: 'grid-cols-4 gap-2 md:gap-3',
          description: 'text-sm md:text-base mt-4',
        }
      default:
        return {
          container: 'p-6 md:p-8',
          title: 'text-2xl md:text-4xl lg:text-5xl mb-6',
          subtitle: 'text-lg md:text-xl mb-6',
          grid: 'grid-cols-2 md:grid-cols-4 gap-3 md:gap-4',
          description: 'text-base md:text-lg mt-6',
        }
    }
  }

  const styles = getLayoutStyles()

  if (!timeRemaining.isValid) {
    return (
      <div className={cn(
        'relative bg-gradient-to-br from-white to-primary/10',
        'rounded-3xl shadow-xl border border-primary/20',
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
        'relative bg-gradient-to-br from-white to-primary/10',
        'rounded-3xl shadow-xl border border-primary/20',
        'overflow-hidden',
        styles.container,
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showSparkles && (
          <>
            <div className="absolute top-4 left-4">
              <SparkleIcon size="sm" color="pink" className="animate-sparkle opacity-30" />
            </div>
            <div className="absolute top-8 right-8">
              <HeartIcon size="sm" color="pink" className="animate-float opacity-20" />
            </div>
            <div className="absolute bottom-4 left-8">
              <HeartIcon size="xs" color="roseGold" className="animate-pulse-soft opacity-25" />
            </div>
            <div className="absolute bottom-8 right-4">
              <SparkleIcon size="xs" color="roseGold" className="animate-sparkle opacity-30" style={{ animationDelay: '1s' }} />
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className={cn(
            'font-display font-bold text-charcoal-black',
            styles.title
          )}>
            Countdown to
          </h1>
          <h2 className={cn(
            'font-display font-bold text-primary',
            styles.subtitle
          )}>
            {girlfriendName}&apos;s Birthday
          </h2>
        </div>

        {/* Countdown grid */}
        {timeRemaining.isComplete ? (
          <div className="text-center">
            <div className="text-6xl md:text-8xl mb-4">🎉</div>
            <h3 className="font-display text-3xl md:text-5xl font-bold text-primary mb-4">
              Happy Birthday!
            </h3>
            <p className="font-body text-lg md:text-xl text-charcoal-black/70">
              The special day has arrived! 🎂✨
            </p>
          </div>
        ) : (
          <>
            <div className={cn('grid', styles.grid)}>
              {enableFlipAnimation ? (
                <>
                  <FlipTimeUnit
                    value={timeRemaining.days}
                    previousValue={lastValues.days}
                    label="Days"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.days > 0}
                  />
                  <FlipTimeUnit
                    value={timeRemaining.hours}
                    previousValue={lastValues.hours}
                    label="Hours"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.hours > 0}
                  />
                  <FlipTimeUnit
                    value={timeRemaining.minutes}
                    previousValue={lastValues.minutes}
                    label="Minutes"
                    variant={variant}
                    showSparkles={showSparkles && timeRemaining.minutes > 0}
                  />
                  <FlipTimeUnit
                    value={timeRemaining.seconds}
                    previousValue={lastValues.seconds}
                    label="Seconds"
                    variant={variant}
                    showSparkles={showSparkles}
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
                  />
                  <TimeUnit
                    value={timeRemaining.hours}
                    label="Hours"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles && timeRemaining.hours > 0}
                  />
                  <TimeUnit
                    value={timeRemaining.minutes}
                    label="Minutes"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles && timeRemaining.minutes > 0}
                  />
                  <TimeUnit
                    value={timeRemaining.seconds}
                    label="Seconds"
                    variant={variant}
                    isAnimating={isAnimating}
                    showSparkles={showSparkles}
                  />
                </>
              )}
            </div>

            {/* Time description */}
            <div className={cn(
              'text-center text-charcoal-black/70 font-body',
              styles.description
            )}>
              {timeDescription}
            </div>
          </>
        )}

        {/* Decorative hearts */}
        {showSparkles && !timeRemaining.isComplete && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <HeartIcon
                key={i}
                size="xs"
                color="pink"
                className={cn(
                  'animate-pulse-soft opacity-60',
                  i % 2 === 0 && 'animate-float'
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Celebration effects */}
      {enableCelebration && (
        <>
          <CelebrationAnimation
            isActive={isCelebrating}
            showConfetti={showConfetti}
            message={`🎉 Happy Birthday ${girlfriendName}! 🎉`}
          />
          <PulseCelebration
            isActive={timeRemaining.isComplete && !isCelebrating}
            intensity="medium"
          />
        </>
      )}
    </div>
  )
}
