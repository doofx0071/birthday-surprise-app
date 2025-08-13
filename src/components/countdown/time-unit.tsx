'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SparkleIcon } from '@/design-system/icons/birthday-icons'
import { formatTimeUnit } from './countdown-hooks'

interface TimeUnitProps {
  value: number
  label: string
  isAnimating?: boolean
  variant?: 'default' | 'large' | 'compact'
  showSparkles?: boolean
  className?: string
}

export const TimeUnit: React.FC<TimeUnitProps> = ({
  value,
  label,
  isAnimating = false,
  variant = 'default',
  showSparkles = false,
  className,
}) => {
  const formattedValue = formatTimeUnit(value, variant === 'large' ? 3 : 2, label.toLowerCase())

  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10',
          value: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-countdown font-black',
          label: 'text-xs sm:text-sm md:text-base lg:text-lg font-body font-semibold tracking-wider',
        }
      case 'compact':
        return {
          container: 'p-2 sm:p-3 md:p-4',
          value: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-countdown font-bold',
          label: 'text-xs sm:text-xs md:text-sm font-body font-medium tracking-wide',
        }
      default:
        return {
          container: 'p-3 sm:p-4 md:p-5 lg:p-6',
          value: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-countdown font-bold',
          label: 'text-xs sm:text-xs md:text-sm lg:text-base font-body font-semibold tracking-wide',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      className={cn(
        'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg',
        'border border-primary/20 transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/20 hover:scale-105',
        isAnimating && 'animate-pulse-soft scale-110',
        styles.container,
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-primary/5 rounded-2xl" />
      
      {/* Sparkle effects */}
      {showSparkles && (
        <>
          <div className="absolute -top-2 -right-2">
            <SparkleIcon 
              size="sm" 
              color="pink" 
              className="animate-sparkle opacity-80" 
            />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <SparkleIcon 
              size="xs" 
              color="roseGold" 
              className="animate-sparkle opacity-60" 
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Value */}
        <div
          className={cn(
            'text-charcoal-black mb-2 transition-all duration-300',
            isAnimating && 'animate-bounce',
            styles.value
          )}
        >
          {formattedValue.split('').map((digit, index) => (
            <span
              key={`${digit}-${index}`}
              className={cn(
                'inline-block transition-all duration-300',
                isAnimating && 'animate-heart-beat'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {digit}
            </span>
          ))}
        </div>

        {/* Label */}
        <div
          className={cn(
            'text-charcoal-black/70 uppercase transition-all duration-300',
            isAnimating && 'text-primary',
            styles.label
          )}
        >
          {label}
        </div>
      </div>

      {/* Glow effect on animation */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-soft" />
      )}
    </div>
  )
}

interface FlipTimeUnitProps extends TimeUnitProps {
  previousValue?: number
}

export const FlipTimeUnit: React.FC<FlipTimeUnitProps> = ({
  value,
  previousValue,
  label,
  variant = 'default',
  showSparkles = false,
  className,
}) => {
  const [isFlipping, setIsFlipping] = React.useState(false)
  const formattedValue = formatTimeUnit(value, variant === 'large' ? 3 : 2, label.toLowerCase())
  const formattedPrevious = formatTimeUnit(previousValue || value, variant === 'large' ? 3 : 2, label.toLowerCase())

  React.useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setIsFlipping(true)
      const timer = setTimeout(() => setIsFlipping(false), 600)
      return () => clearTimeout(timer)
    }
  }, [value, previousValue])

  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10',
          value: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-countdown font-black',
          label: 'text-xs sm:text-sm md:text-base lg:text-lg font-body font-semibold tracking-wider',
        }
      case 'compact':
        return {
          container: 'p-2 sm:p-3 md:p-4',
          value: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-countdown font-bold',
          label: 'text-xs sm:text-xs md:text-sm font-body font-medium tracking-wide',
        }
      default:
        return {
          container: 'p-3 sm:p-4 md:p-5 lg:p-6',
          value: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-countdown font-bold',
          label: 'text-xs sm:text-xs md:text-sm lg:text-base font-body font-semibold tracking-wide',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      className={cn(
        'relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg',
        'border border-primary/20 transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/20 hover:scale-105',
        'perspective-1000',
        styles.container,
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-primary/5 rounded-2xl" />
      
      {/* Sparkle effects */}
      {showSparkles && (
        <>
          <div className="absolute -top-2 -right-2">
            <SparkleIcon 
              size="sm" 
              color="pink" 
              className="animate-sparkle opacity-80" 
            />
          </div>
          <div className="absolute -bottom-1 -left-1">
            <SparkleIcon 
              size="xs" 
              color="roseGold" 
              className="animate-sparkle opacity-60" 
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </>
      )}

      {/* Flip container */}
      <div className="relative z-10 text-center">
        <div className="relative overflow-hidden">
          {/* Current value */}
          <div
            className={cn(
              'text-charcoal-black mb-2 transition-all duration-600',
              isFlipping && 'animate-flip-in',
              styles.value
            )}
          >
            {formattedValue}
          </div>

          {/* Previous value (for flip animation) */}
          {isFlipping && (
            <div
              className={cn(
                'absolute inset-0 text-charcoal-black mb-2 animate-flip-out',
                styles.value
              )}
            >
              {formattedPrevious}
            </div>
          )}
        </div>

        {/* Label */}
        <div
          className={cn(
            'text-charcoal-black/70 uppercase transition-all duration-300',
            isFlipping && 'text-primary',
            styles.label
          )}
        >
          {label}
        </div>
      </div>

      {/* Glow effect on flip */}
      {isFlipping && (
        <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-soft" />
      )}
    </div>
  )
}
