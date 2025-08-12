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
  showFireworks?: boolean
  showRainbow?: boolean
  intensity?: 'low' | 'medium' | 'high'
  message?: string
  className?: string
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  isActive,
  showConfetti = true,
  showFireworks = true,
  showRainbow = true,
  intensity = 'high',
  message = "🎉 Happy Birthday! 🎉",
  className,
}) => {
  if (!isActive) return null

  const getParticleCount = () => {
    switch (intensity) {
      case 'low': return { confetti: 20, hearts: 10, sparkles: 15, fireworks: 3 }
      case 'medium': return { confetti: 35, hearts: 15, sparkles: 20, fireworks: 5 }
      case 'high': return { confetti: 60, hearts: 25, sparkles: 35, fireworks: 8 }
      default: return { confetti: 50, hearts: 20, sparkles: 30, fireworks: 6 }
    }
  }

  const counts = getParticleCount()

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 pointer-events-none overflow-hidden',
        className
      )}
    >
      {/* Rainbow background effect */}
      {showRainbow && (
        <div className="absolute inset-0 animate-pulse-slow">
          <div className="absolute inset-0 bg-gradient-to-r from-red-200/20 to-yellow-200/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-green-200/20 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-blue-200/20 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-purple-200/20 opacity-30" />
        </div>
      )}

      {/* Fireworks */}
      {showFireworks && (
        <div className="absolute inset-0">
          {Array.from({ length: counts.fireworks }).map((_, i) => (
            <FireworkEffect key={i} delay={i * 0.8} />
          ))}
        </div>
      )}

      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0">
          {Array.from({ length: counts.confetti }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Floating hearts */}
      <div className="absolute inset-0">
        {Array.from({ length: counts.hearts }).map((_, i) => (
          <FloatingHeart key={i} delay={i * 0.15} />
        ))}
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0">
        {Array.from({ length: counts.sparkles }).map((_, i) => (
          <SparkleEffect key={i} delay={i * 0.1} />
        ))}
      </div>

      {/* Birthday icons */}
      <div className="absolute inset-0">
        <FloatingIcon Icon={CakeIcon} delay={0.5} />
        <FloatingIcon Icon={BalloonIcon} delay={1.0} />
        <FloatingIcon Icon={CakeIcon} delay={1.5} />
        <FloatingIcon Icon={BalloonIcon} delay={2.0} />
        <FloatingIcon Icon={CakeIcon} delay={2.5} />
        <FloatingIcon Icon={BalloonIcon} delay={3.0} />
      </div>

      {/* Celebration message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl',
            'border-2 border-primary/30 p-8 text-center',
            'animate-scale-in transform-gpu'
          )}
        >
          <h1 className="font-display text-4xl md:text-6xl font-bold text-charcoal-black mb-4 animate-bounce-gentle">
            {message}
          </h1>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 animate-fade-in-up">
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

interface FireworkEffectProps {
  delay: number
}

const FireworkEffect: React.FC<FireworkEffectProps> = ({ delay }) => {
  const left = Math.random() * 80 + 10 // 10% to 90%
  const top = Math.random() * 60 + 10 // 10% to 70%
  const colors = ['text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400', 'text-purple-400', 'text-pink-400']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return (
    <div
      className="absolute"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Central burst */}
      <div className={cn('relative', color)}>
        <div className="absolute animate-firework-burst">
          <SparkleIcon size="lg" />
        </div>

        {/* Radiating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute animate-firework-particle',
              color
            )}
            style={{
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${delay + 0.2}s`,
            }}
          >
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
