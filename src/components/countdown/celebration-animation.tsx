'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  HeartIcon, 
  SparkleIcon, 
  ConfettiIcon, 
  CakeIcon,
  BalloonIcon 
} from '@/design-system/icons/birthday-icons'

interface CelebrationAnimationProps {
  isActive: boolean
  showConfetti?: boolean
  message?: string
  className?: string
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isActive,
  showConfetti = true,
  message = "🎉 Happy Birthday! 🎉",
  className,
}) => {
  if (!isActive) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 pointer-events-none overflow-hidden',
        className
      )}
    >
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.1} />
          ))}
        </div>
      )}

      {/* Floating hearts */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingHeart key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <SparkleEffect key={i} delay={i * 0.15} />
        ))}
      </div>

      {/* Birthday icons */}
      <div className="absolute inset-0">
        <FloatingIcon Icon={CakeIcon} delay={0.5} />
        <FloatingIcon Icon={BalloonIcon} delay={1.0} />
        <FloatingIcon Icon={CakeIcon} delay={1.5} />
        <FloatingIcon Icon={BalloonIcon} delay={2.0} />
      </div>

      {/* Celebration message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl',
            'border-2 border-primary/30 p-8 text-center',
            'animate-scale-in'
          )}
        >
          <h1 className="font-display text-4xl md:text-6xl font-bold text-charcoal-black mb-4">
            {message}
          </h1>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70">
            The special day has arrived! 🎂✨
          </p>
        </div>
      </div>
    </div>
  )
}

interface ConfettiParticleProps {
  delay: number
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({ delay }) => {
  const colors = ['text-primary', 'text-accent', 'text-yellow-400', 'text-purple-400', 'text-blue-400']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = Math.random() * 0.5 + 0.5 // 0.5 to 1
  const left = Math.random() * 100
  const animationDuration = Math.random() * 2 + 3 // 3 to 5 seconds

  return (
    <div
      className={cn(
        'absolute animate-confetti',
        color
      )}
      style={{
        left: `${left}%`,
        top: '-10px',
        animationDelay: `${delay}s`,
        animationDuration: `${animationDuration}s`,
        transform: `scale(${size})`,
      }}
    >
      <ConfettiIcon size="sm" />
    </div>
  )
}

interface FloatingHeartProps {
  delay: number
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ delay }) => {
  const left = Math.random() * 100
  const size = Math.random() * 0.5 + 0.5 // 0.5 to 1
  const animationDuration = Math.random() * 3 + 4 // 4 to 7 seconds

  return (
    <div
      className="absolute animate-float-up opacity-80"
      style={{
        left: `${left}%`,
        bottom: '-50px',
        animationDelay: `${delay}s`,
        animationDuration: `${animationDuration}s`,
        transform: `scale(${size})`,
      }}
    >
      <HeartIcon size="lg" color="pink" />
    </div>
  )
}

interface SparkleEffectProps {
  delay: number
}

const SparkleEffect: React.FC<SparkleEffectProps> = ({ delay }) => {
  const left = Math.random() * 100
  const top = Math.random() * 100
  const size = Math.random() * 0.5 + 0.5 // 0.5 to 1

  return (
    <div
      className="absolute animate-sparkle opacity-70"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        transform: `scale(${size})`,
      }}
    >
      <SparkleIcon size="sm" color="pink" />
    </div>
  )
}

interface FloatingIconProps {
  Icon: React.ComponentType<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?: 'current' | 'pink' | 'roseGold' | 'white' | 'charcoal'
  }>
  delay: number
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ Icon, delay }) => {
  const left = Math.random() * 100
  const animationDuration = Math.random() * 2 + 5 // 5 to 7 seconds

  return (
    <div
      className="absolute animate-float opacity-60"
      style={{
        left: `${left}%`,
        top: '100%',
        animationDelay: `${delay}s`,
        animationDuration: `${animationDuration}s`,
      }}
    >
      <Icon size="xl" color="pink" />
    </div>
  )
}

// Pulse celebration effect for smaller celebrations
interface PulseCelebrationProps {
  isActive: boolean
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export const PulseCelebration: React.FC<PulseCelebrationProps> = ({
  isActive,
  intensity = 'medium',
  className,
}) => {
  if (!isActive) return null

  const getIntensityConfig = () => {
    switch (intensity) {
      case 'low':
        return { hearts: 5, sparkles: 8, duration: 2 }
      case 'high':
        return { hearts: 15, sparkles: 25, duration: 6 }
      default:
        return { hearts: 10, sparkles: 15, duration: 4 }
    }
  }

  const config = getIntensityConfig()

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        className
      )}
    >
      {/* Floating hearts */}
      {Array.from({ length: config.hearts }).map((_, i) => (
        <div
          key={`heart-${i}`}
          className="absolute animate-float-up opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '-20px',
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${config.duration}s`,
          }}
        >
          <HeartIcon size="md" color="pink" />
        </div>
      ))}

      {/* Sparkle effects */}
      {Array.from({ length: config.sparkles }).map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-sparkle opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <SparkleIcon size="sm" color="pink" />
        </div>
      ))}
    </div>
  )
}
