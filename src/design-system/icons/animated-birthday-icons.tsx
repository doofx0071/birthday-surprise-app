'use client'

/**
 * Birthday Surprise Design System - Professional Animated Icons
 *
 * Using React Icons library with Framer Motion animations for professional,
 * high-quality birthday celebration icons. Much better than custom SVGs!
 */

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Import professional icons from React Icons
import {
  FaHeart,
  FaBirthdayCake,
  FaGift,
  FaStar
} from 'react-icons/fa'
import {
  FaHeartPulse,
  FaCakeCandles,
  FaGifts
} from 'react-icons/fa6'
import {
  GiBalloons,
  GiPartyPopper,
  GiPartyHat
} from 'react-icons/gi'
import {
  IoSparkles,
  IoHeart,
  IoHeartSharp
} from 'react-icons/io5'
import {
  MdCelebration,
  MdPartyMode,
  MdFavorite
} from 'react-icons/md'
import {
  RiHeartFill,
  RiHeartPulseFill,
  RiSparklingFill
} from 'react-icons/ri'

// Base animated icon props interface
interface AnimatedIconProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'current' | 'pink' | 'roseGold' | 'white' | 'charcoal'
  style?: React.CSSProperties
  animate?: boolean
  intensity?: 'subtle' | 'normal' | 'energetic'
}

// Size mappings
const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

// Color mappings
const colorClasses = {
  current: 'text-current',
  pink: 'text-soft-pink',
  roseGold: 'text-rose-gold',
  white: 'text-white',
  charcoal: 'text-charcoal-black',
}

// Animation variants for different intensities
const heartBeatVariants = {
  subtle: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  normal: {
    scale: [1, 1.1, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  energetic: {
    scale: [1, 1.2, 1],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  }
}

const sparkleVariants = {
  subtle: {
    rotate: [0, 360],
    scale: [0.8, 1, 0.8],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  normal: {
    rotate: [0, 360],
    scale: [0.7, 1.1, 0.7],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  energetic: {
    rotate: [0, 360],
    scale: [0.6, 1.2, 0.6],
    opacity: [0.4, 1, 0.4],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
}

const floatVariants = {
  subtle: {
    y: [0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  normal: {
    y: [0, -4, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
  },
  energetic: {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
}

// Professional Animated Heart Icon with pulse effect
export const AnimatedHeartIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? heartBeatVariants[intensity] : undefined}
    whileHover={{ scale: 1.1 }}
  >
    <FaHeartPulse className="w-full h-full" />
  </motion.div>
)

// Alternative Heart Icons
export const AnimatedHeartFillIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? heartBeatVariants[intensity] : undefined}
    whileHover={{ scale: 1.1 }}
  >
    <RiHeartFill className="w-full h-full" />
  </motion.div>
)

// Professional Animated Sparkle Icon with rotation and scale
export const AnimatedSparkleIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? sparkleVariants[intensity] : undefined}
    whileHover={{ scale: 1.2, rotate: 180 }}
  >
    <IoSparkles className="w-full h-full" />
  </motion.div>
)

// Alternative Sparkle Icons
export const AnimatedStarIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? sparkleVariants[intensity] : undefined}
    whileHover={{ scale: 1.2, rotate: 180 }}
  >
    <FaStar className="w-full h-full" />
  </motion.div>
)

export const AnimatedSparklingIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? sparkleVariants[intensity] : undefined}
    whileHover={{ scale: 1.2, rotate: 180 }}
  >
    <RiSparklingFill className="w-full h-full" />
  </motion.div>
)

// Professional Animated Cake Icon with celebration bounce
export const AnimatedCakeIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      y: [0, -2, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1, rotate: 5 }}
  >
    <FaCakeCandles className="w-full h-full" />
  </motion.div>
)

// Alternative Cake Icons
export const AnimatedBirthdayCakeIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      y: [0, -2, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1, rotate: 5 }}
  >
    <FaBirthdayCake className="w-full h-full" />
  </motion.div>
)

// Professional Animated Balloon Icon with floating effect
export const AnimatedBalloonIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? floatVariants[intensity] : undefined}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
  >
    <GiBalloons className="w-full h-full" />
  </motion.div>
)

// Professional Confetti Icon for celebrations (using sparkles as alternative)
export const AnimatedConfettiIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 360],
      scale: [0.8, 1.2, 0.8],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
  >
    <FaStar className="w-full h-full" />
  </motion.div>
)

// Professional Party Popper Icon
export const AnimatedPartyPopperIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1, rotate: 15 }}
  >
    <GiPartyPopper className="w-full h-full" />
  </motion.div>
)

// Professional Fireworks Icon (using star as alternative)
export const AnimatedFireworksIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      scale: [0.8, 1.2, 0.8],
      rotate: [0, 180, 360],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.3 }}
  >
    <FaStar className="w-full h-full" />
  </motion.div>
)

// Professional Celebration Icon
export const AnimatedCelebrationIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      y: [0, -4, 0],
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1 }}
  >
    <MdCelebration className="w-full h-full" />
  </motion.div>
)

// Professional Party Hat Icon
export const AnimatedPartyHatIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 3, -3, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1, rotate: 10 }}
  >
    <GiPartyHat className="w-full h-full" />
  </motion.div>
)

// Professional Animated Gift Icon with gentle shake
export const AnimatedGiftIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 1, -1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.05, rotate: 5 }}
  >
    <FaGift className="w-full h-full" />
  </motion.div>
)

// Professional Multiple Gifts Icon
export const AnimatedGiftsIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 1, -1, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.1, rotate: 5 }}
  >
    <FaGifts className="w-full h-full" />
  </motion.div>
)

// Professional Party Mode Icon
export const AnimatedPartyModeIcon: React.FC<AnimatedIconProps> = ({
  className,
  size = 'md',
  color = 'current',
  style,
  animate = true,
  intensity = 'normal'
}) => (
  <motion.div
    className={cn(sizeClasses[size], colorClasses[color], className)}
    style={style}
    animate={animate ? {
      rotate: [0, 360],
      scale: [0.9, 1.1, 0.9],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    } : undefined}
    whileHover={{ scale: 1.2 }}
  >
    <MdPartyMode className="w-full h-full" />
  </motion.div>
)
