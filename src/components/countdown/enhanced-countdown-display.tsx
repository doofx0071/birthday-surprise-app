'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  AnimatedHeartIcon,
  AnimatedFireworksIcon,
  AnimatedCelebrationIcon,
  AnimatedPartyPopperIcon
} from '@/design-system/icons/animated-birthday-icons'
import { ConfettiCelebration } from '@/components/celebration/confetti-celebration'

interface EnhancedCountdownDisplayProps {
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
    isComplete: boolean
  }
  variant?: 'default' | 'large' | 'compact'
  showSparkles?: boolean
  className?: string
}

interface TimeUnitProps {
  value: number
  label: string
  variant: 'default' | 'large' | 'compact'
  isAnimating?: boolean
  showSparkles?: boolean
}

const EnhancedTimeUnit: React.FC<TimeUnitProps> = ({
  value,
  label,
  variant,
  isAnimating = false,
  showSparkles = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'p-4 sm:p-6 md:p-8',
          value: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-countdown font-black',
          label: 'text-sm sm:text-base md:text-lg font-body font-semibold tracking-wider',
        }
      case 'compact':
        return {
          container: 'p-2 sm:p-3 md:p-4',
          value: 'text-xl sm:text-2xl md:text-3xl font-countdown font-bold',
          label: 'text-xs sm:text-sm font-body font-medium tracking-wide',
        }
      default:
        return {
          container: 'p-3 sm:p-4 md:p-6',
          value: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-countdown font-bold',
          label: 'text-xs sm:text-sm md:text-base font-body font-semibold tracking-wide',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <motion.div
      className={cn(
        'relative bg-gradient-to-br from-white to-primary/5',
        'rounded-2xl shadow-lg border border-primary/20',
        'overflow-hidden group',
        styles.container
      )}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />

      {/* Sparkle decorations */}
      {showSparkles && (
        <>
          <div className="absolute top-2 right-2">
            <span className="text-pink-500 text-xs">✨</span>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="text-pink-500 text-xs">✨</span>
          </div>
        </>
      )}

      {/* Time value with enhanced animation */}
      <div className="relative z-10 text-center">
        <motion.div
          className={cn(
            'text-charcoal-black mb-2',
            styles.value
          )}
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {value.toString().padStart(2, '0')}
        </motion.div>

        {/* Label */}
        <div className={cn(
          'text-charcoal-black/70 uppercase',
          styles.label
        )}>
          {label}
        </div>
      </div>

      {/* Pulse effect for active units */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 border-2 border-primary/30 rounded-2xl"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}

export const EnhancedCountdownDisplay: React.FC<EnhancedCountdownDisplayProps> = ({
  timeRemaining,
  variant = 'default',
  showSparkles = true,
  className
}) => {
  const getLayoutStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'p-6 sm:p-8 md:p-12',
          grid: 'grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8',
          title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 sm:mb-8',
        }
      case 'compact':
        return {
          container: 'p-4 sm:p-6',
          grid: 'grid-cols-4 gap-2 sm:gap-3',
          title: 'text-lg sm:text-xl md:text-2xl mb-4',
        }
      default:
        return {
          container: 'p-4 sm:p-6 md:p-8',
          grid: 'grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6',
          title: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6',
        }
    }
  }

  const styles = getLayoutStyles()

  if (timeRemaining.isComplete) {
    return (
      <motion.div
        className={cn(
          'relative bg-gradient-to-br from-white to-primary/10',
          'rounded-3xl shadow-xl border border-primary/20',
          'overflow-hidden text-center',
          styles.container,
          className
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Celebration background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative z-10">
          <motion.div
            className="flex justify-center mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <AnimatedFireworksIcon size="xl" color="pink" />
          </motion.div>

          <h2 className={cn(
            'font-display font-bold text-charcoal-black mb-4',
            styles.title
          )}>
            🎉 It's Time! 🎉
          </h2>

          <p className="font-body text-lg md:text-xl text-charcoal-black/80">
            The special day has arrived!
          </p>

          {/* Floating hearts */}
          <div className="flex justify-center space-x-4 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                <AnimatedHeartIcon size="md" color="pink" intensity="energetic" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'relative bg-gradient-to-br from-white to-primary/10',
        'rounded-3xl shadow-xl border border-primary/20',
        'overflow-hidden',
        styles.container,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background sparkles */}
      {showSparkles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            >
              <span className="text-pink-500 text-xs">✨</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {/* Time units grid */}
        <div className={cn('grid', styles.grid)}>
          <EnhancedTimeUnit
            value={timeRemaining.days}
            label="Days"
            variant={variant}
            isAnimating={timeRemaining.days > 0}
            showSparkles={showSparkles}
          />
          <EnhancedTimeUnit
            value={timeRemaining.hours}
            label="Hours"
            variant={variant}
            isAnimating={timeRemaining.hours > 0}
            showSparkles={showSparkles}
          />
          <EnhancedTimeUnit
            value={timeRemaining.minutes}
            label="Minutes"
            variant={variant}
            isAnimating={timeRemaining.minutes > 0}
            showSparkles={showSparkles}
          />
          <EnhancedTimeUnit
            value={timeRemaining.seconds}
            label="Seconds"
            variant={variant}
            isAnimating={true}
            showSparkles={showSparkles}
          />
        </div>

        {/* Decorative hearts */}
        {showSparkles && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                <AnimatedHeartIcon 
                  size="xs" 
                  color={i % 2 === 0 ? "pink" : "roseGold"} 
                  intensity="subtle"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
