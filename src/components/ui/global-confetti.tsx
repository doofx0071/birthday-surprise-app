'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: string
  side: 'left' | 'right'
  color: string
  startY: number
  delay: number
}

export function GlobalConfetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isVisible, setIsVisible] = useState(true)

  // Confetti colors matching the birthday theme
  const colors = [
    '#ec4899', // pink-500
    '#f472b6', // pink-400
    '#fbbf24', // amber-400
    '#a78bfa', // violet-400
    '#ffffff', // white
    '#f8fafc', // slate-50
  ]

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsVisible(!mediaQuery.matches)

    const handleChange = () => setIsVisible(!mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Continuous particle emission
  useEffect(() => {
    if (!isVisible) return

    const emitParticles = () => {
      const newParticles: Particle[] = []

      // Emit 1-2 particles from each side for subtlety
      const particleCount = Math.floor(Math.random() * 2) + 1

      for (let i = 0; i < particleCount; i++) {
        // Left side particles
        newParticles.push({
          id: `left-${Date.now()}-${i}`,
          side: 'left',
          color: colors[Math.floor(Math.random() * colors.length)],
          startY: Math.random() * 50 + 25, // 25% to 75% of screen height
          delay: Math.random() * 2000, // 0-2 second delay for more spread
        })

        // Right side particles
        newParticles.push({
          id: `right-${Date.now()}-${i}`,
          side: 'right',
          color: colors[Math.floor(Math.random() * colors.length)],
          startY: Math.random() * 50 + 25,
          delay: Math.random() * 2000,
        })
      }

      setParticles(prev => {
        // Limit total particles for performance
        const filtered = prev.length > 20 ? prev.slice(-10) : prev
        return [...filtered, ...newParticles]
      })

      // Clean up old particles after animation completes
      setTimeout(() => {
        setParticles(prev => prev.filter(p =>
          !newParticles.some(np => np.id === p.id)
        ))
      }, 15000) // Clean up after 15 seconds
    }

    // Initial emission after a short delay
    const initialTimer = setTimeout(() => {
      emitParticles()
    }, 2000)

    // Continuous emission every 6-10 seconds for subtlety
    const interval = setInterval(() => {
      emitParticles()
    }, Math.random() * 4000 + 6000) // 6-10 seconds

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [isVisible, colors])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: particle.color,
              [particle.side]: 0,
              top: `${particle.startY}%`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              x: particle.side === 'left' ? -10 : 10,
            }}
            animate={{
              opacity: [0, 0.3, 0.4, 0.3, 0],
              scale: [0, 0.8, 1, 0.8, 0],
              x: particle.side === 'left'
                ? [0, window.innerWidth * 0.2, window.innerWidth * 0.5, window.innerWidth * 0.8, window.innerWidth + 10]
                : [0, -window.innerWidth * 0.2, -window.innerWidth * 0.5, -window.innerWidth * 0.8, -window.innerWidth - 10],
              y: [0, -30, -80, -120, -180],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 12,
              delay: particle.delay / 1000,
              ease: "easeOut",
              times: [0, 0.15, 0.4, 0.75, 1],
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
