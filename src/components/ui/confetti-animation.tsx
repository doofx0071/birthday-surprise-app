'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocity: { x: number; y: number }
}

interface ConfettiAnimationProps {
  trigger: boolean
  duration?: number
  intensity?: 'light' | 'medium' | 'heavy'
  colors?: string[]
  className?: string
}

const defaultColors = [
  '#ec4899', // pink-500
  '#f472b6', // pink-400
  '#fbbf24', // amber-400
  '#a78bfa', // violet-400
  '#34d399', // emerald-400
  '#60a5fa', // blue-400
]

export function ConfettiAnimation({ 
  trigger, 
  duration = 3000, 
  intensity = 'medium',
  colors = defaultColors,
  className = ''
}: ConfettiAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  const pieceCount = {
    light: 20,
    medium: 40,
    heavy: 80
  }[intensity]

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        y: -10, // start above viewport
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, // 4-12px
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4, // -2 to 2
          y: Math.random() * 3 + 2 // 2-5
        }
      }))
      
      setConfetti(pieces)

      // Clean up after duration
      const timer = setTimeout(() => {
        setIsActive(false)
        setConfetti([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, duration, pieceCount, colors])

  if (!isActive) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}>
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              backgroundColor: piece.color,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 50,
              x: piece.velocity.x * 100,
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: 'easeOut',
            }}
            exit={{
              opacity: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Sparkle effect for subtle celebrations
interface SparkleEffectProps {
  trigger: boolean
  duration?: number
  className?: string
}

export function SparkleEffect({ 
  trigger, 
  duration = 2000,
  className = ''
}: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      
      // Generate sparkle positions
      const sparklePositions = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      
      setSparkles(sparklePositions)

      const timer = setTimeout(() => {
        setIsActive(false)
        setSparkles([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!isActive) return null

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute w-2 h-2 bg-pink-400 rounded-full"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: Math.random() * 0.5,
              ease: 'easeInOut',
            }}
            exit={{
              opacity: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Birthday celebration burst effect
interface CelebrationBurstProps {
  trigger: boolean
  centerX?: number
  centerY?: number
  className?: string
}

export function CelebrationBurst({ 
  trigger, 
  centerX = 50, 
  centerY = 50,
  className = ''
}: CelebrationBurstProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      
      const timer = setTimeout(() => {
        setIsActive(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (!isActive) return null

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute"
        style={{
          left: `${centerX}%`,
          top: `${centerY}%`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        {/* Burst rays */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-gradient-to-r from-pink-400 to-transparent"
            style={{
              height: '40px',
              transformOrigin: 'bottom center',
              transform: `rotate(${i * 30}deg)`,
              left: '-2px',
              bottom: '0',
            }}
            initial={{
              scaleY: 0,
              opacity: 0,
            }}
            animate={{
              scaleY: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
          />
        ))}
        
        {/* Center glow */}
        <motion.div
          className="absolute w-4 h-4 bg-pink-400 rounded-full -translate-x-1/2 -translate-y-1/2"
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
          }}
        />
      </motion.div>
    </div>
  )
}

// Enhanced confetti component with side cannons
interface TSParticlesConfettiProps {
  trigger: boolean
  duration?: number
  className?: string
}

export function TSParticlesConfetti({
  trigger,
  duration = 5000,
  className = ''
}: TSParticlesConfettiProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsActive(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!isActive) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {/* Left side confetti cannon */}
      <div className="absolute left-0 top-1/3 w-4 h-32">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#ec4899', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#ffffff'][i % 7],
              left: Math.random() * 16,
              top: Math.random() * 128,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              rotate: 0,
              scale: 0
            }}
            animate={{
              x: Math.random() * 400 + 200,
              y: Math.random() * -300 - 100,
              opacity: 0,
              rotate: Math.random() * 720,
              scale: [0, 1, 0.5, 0]
            }}
            transition={{
              duration: duration / 1000,
              delay: Math.random() * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Right side confetti cannon */}
      <div className="absolute right-0 top-1/3 w-4 h-32">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#ec4899', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#ffffff'][i % 7],
              right: Math.random() * 16,
              top: Math.random() * 128,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              rotate: 0,
              scale: 0
            }}
            animate={{
              x: -(Math.random() * 400 + 200),
              y: Math.random() * -300 - 100,
              opacity: 0,
              rotate: Math.random() * 720,
              scale: [0, 1, 0.5, 0]
            }}
            transition={{
              duration: duration / 1000,
              delay: Math.random() * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}
