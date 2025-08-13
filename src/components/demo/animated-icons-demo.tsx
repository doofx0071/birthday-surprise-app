'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  AnimatedHeartIcon,
  AnimatedHeartFillIcon,
  AnimatedSparkleIcon,
  AnimatedStarIcon,
  AnimatedCakeIcon,
  AnimatedBirthdayCakeIcon,
  AnimatedBalloonIcon,
  AnimatedConfettiIcon,
  AnimatedPartyPopperIcon,
  AnimatedFireworksIcon,
  AnimatedCelebrationIcon,
  AnimatedPartyHatIcon,
  AnimatedGiftIcon,
  AnimatedGiftsIcon,
  AnimatedPartyModeIcon
} from '@/design-system/icons/animated-birthday-icons'
import { ConfettiCelebration, HeartConfettiCelebration } from '@/components/celebration/confetti-celebration'
import { BirthdayCard, BirthdayCardContent } from '@/components/birthday-card'

interface AnimatedIconsDemoProps {
  className?: string
}

export const AnimatedIconsDemo: React.FC<AnimatedIconsDemoProps> = ({ className }) => {
  const [intensity, setIntensity] = useState<'subtle' | 'normal' | 'energetic'>('normal')
  const [animate, setAnimate] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showHeartConfetti, setShowHeartConfetti] = useState(false)

  const icons = [
    {
      component: AnimatedHeartIcon,
      name: 'Heart Pulse',
      description: 'Professional heart with pulse animation',
      color: 'pink' as const
    },
    {
      component: AnimatedSparkleIcon,
      name: 'Sparkles',
      description: 'Twinkling sparkle effect',
      color: 'roseGold' as const
    },
    {
      component: AnimatedCakeIcon,
      name: 'Birthday Cake',
      description: 'Celebration cake with candles',
      color: 'pink' as const
    },
    {
      component: AnimatedBalloonIcon,
      name: 'Balloons',
      description: 'Floating party balloons',
      color: 'roseGold' as const
    },
    {
      component: AnimatedPartyPopperIcon,
      name: 'Party Popper',
      description: 'Celebration party popper',
      color: 'pink' as const
    },
    {
      component: AnimatedFireworksIcon,
      name: 'Fireworks',
      description: 'Spectacular fireworks display',
      color: 'roseGold' as const
    },
    {
      component: AnimatedGiftsIcon,
      name: 'Gifts',
      description: 'Multiple birthday presents',
      color: 'pink' as const
    },
    {
      component: AnimatedCelebrationIcon,
      name: 'Celebration',
      description: 'General celebration icon',
      color: 'roseGold' as const
    },
    {
      component: AnimatedPartyHatIcon,
      name: 'Party Hat',
      description: 'Birthday party hat',
      color: 'pink' as const
    },
    {
      component: AnimatedPartyModeIcon,
      name: 'Party Mode',
      description: 'Ultimate party celebration',
      color: 'roseGold' as const
    }
  ]

  return (
    <div className={cn('space-y-8', className)}>
      {/* Confetti Effects */}
      <ConfettiCelebration isActive={showConfetti} intensity="high" />
      <HeartConfettiCelebration isActive={showHeartConfetti} intensity="medium" />

      {/* Demo Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-charcoal-black mb-4">
          🎨 Animated Icons Demo
        </h2>
        <p className="font-body text-lg text-charcoal-black/70 mb-6">
          Professional animated icons for your birthday surprise app
        </p>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <label className="font-body text-sm font-medium text-charcoal-black">
              Animation:
            </label>
            <button
              onClick={() => setAnimate(!animate)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                animate
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-charcoal-black'
              )}
            >
              {animate ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="font-body text-sm font-medium text-charcoal-black">
              Intensity:
            </label>
            <div className="flex space-x-1">
              {(['subtle', 'normal', 'energetic'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize',
                    intensity === level
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-charcoal-black hover:bg-gray-300'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Celebration Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 3000)
            }}
            className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium hover:scale-105 transition-transform"
          >
            🎉 Trigger Confetti
          </button>

          <button
            onClick={() => {
              setShowHeartConfetti(true)
              setTimeout(() => setShowHeartConfetti(false), 3000)
            }}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:scale-105 transition-transform"
          >
            💕 Heart Confetti
          </button>
        </div>
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {icons.map((icon, index) => {
          const IconComponent = icon.component
          return (
            <motion.div
              key={icon.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BirthdayCard className="p-6 text-center hover:shadow-lg transition-shadow">
                <BirthdayCardContent>
                  <div className="space-y-4">
                    {/* Icon Display */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/5 rounded-2xl">
                        <IconComponent
                          size="xl"
                          color={icon.color}
                          animate={animate}
                          intensity={intensity}
                        />
                      </div>
                    </div>

                    {/* Icon Info */}
                    <div>
                      <h3 className="font-display text-lg font-semibold text-charcoal-black mb-1">
                        {icon.name}
                      </h3>
                      <p className="font-body text-sm text-charcoal-black/70">
                        {icon.description}
                      </p>
                    </div>

                    {/* Size Variations */}
                    <div className="flex items-center justify-center space-x-3 pt-2">
                      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                        <IconComponent
                          key={size}
                          size={size}
                          color={icon.color}
                          animate={animate}
                          intensity={intensity}
                        />
                      ))}
                    </div>
                  </div>
                </BirthdayCardContent>
              </BirthdayCard>
            </motion.div>
          )
        })}
      </div>

      {/* Comparison Section */}
      <BirthdayCard className="p-8">
        <BirthdayCardContent>
          <div className="text-center space-y-6">
            <h3 className="font-display text-2xl font-bold text-charcoal-black">
              ✨ Before vs After Comparison
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="space-y-4">
                <h4 className="font-display text-lg font-semibold text-charcoal-black">
                  Before: Static Icons
                </h4>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex justify-center space-x-4">
                    {/* Static versions would go here */}
                    <div className="text-2xl">💖</div>
                    <div className="text-2xl">✨</div>
                    <div className="text-2xl">🎂</div>
                    <div className="text-2xl">🎈</div>
                  </div>
                  <p className="font-body text-sm text-charcoal-black/70 mt-3">
                    Basic, static appearance
                  </p>
                </div>
              </div>

              {/* After */}
              <div className="space-y-4">
                <h4 className="font-display text-lg font-semibold text-charcoal-black">
                  After: Animated Icons
                </h4>
                <div className="p-6 bg-primary/5 rounded-xl">
                  <div className="flex justify-center space-x-4">
                    <AnimatedHeartIcon size="lg" color="pink" intensity="normal" />
                    <AnimatedSparkleIcon size="lg" color="roseGold" intensity="normal" />
                    <AnimatedCakeIcon size="lg" color="pink" intensity="normal" />
                    <AnimatedBalloonIcon size="lg" color="roseGold" intensity="normal" />
                  </div>
                  <p className="font-body text-sm text-charcoal-black/70 mt-3">
                    Engaging, professional animations
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="font-body text-base text-charcoal-black/80">
                The new animated icons bring your birthday surprise app to life with smooth, 
                professional animations that enhance user engagement while maintaining 
                excellent performance.
              </p>
            </div>
          </div>
        </BirthdayCardContent>
      </BirthdayCard>
    </div>
  )
}
