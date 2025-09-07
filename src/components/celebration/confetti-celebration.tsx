'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'

interface ConfettiCelebrationProps {
  isActive?: boolean
  intensity?: 'low' | 'medium' | 'high'
  duration?: number
  className?: string
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive = false,
  intensity = 'medium',
  duration = 3000,
  className
}) => {
  const refAnimationInstance = useRef<any>(null)

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio)
      })
  }, [])

  const fire = useCallback(() => {
    const intensityConfig = {
      low: {
        spread: 26,
        startVelocity: 55,
        shots: 2
      },
      medium: {
        spread: 60,
        startVelocity: 45,
        shots: 3
      },
      high: {
        spread: 100,
        startVelocity: 70,
        shots: 5
      }
    }

    const config = intensityConfig[intensity]

    // Birthday-themed colors (pink, rose gold, white)
    const colors = ['#FFB6C1', '#FFC0CB', '#FF69B4', '#DA70D6', '#DDA0DD', '#FFFFFF', '#F5F5DC']

    for (let i = 0; i < config.shots; i++) {
      setTimeout(() => {
        makeShot(0.25, {
          spread: config.spread,
          startVelocity: config.startVelocity,
          colors: colors
        })

        makeShot(0.2, {
          spread: config.spread + 20,
          startVelocity: config.startVelocity + 10,
          colors: colors
        })

        makeShot(0.35, {
          spread: config.spread - 10,
          startVelocity: config.startVelocity - 5,
          decay: 0.91,
          scalar: 0.8,
          colors: colors
        })

        makeShot(0.1, {
          spread: config.spread + 30,
          startVelocity: config.startVelocity + 15,
          decay: 0.92,
          scalar: 1.2,
          colors: colors
        })

        makeShot(0.1, {
          spread: config.spread - 20,
          startVelocity: config.startVelocity - 10,
          decay: 0.92,
          scalar: 1.2,
          colors: colors
        })
      }, i * 300)
    }
  }, [makeShot, intensity])

  useEffect(() => {
    if (isActive) {
      fire()
    }
  }, [isActive, fire])

  return (
    <ReactCanvasConfetti
      {...({ refConfetti: getInstance } as any)}
      className={className}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    />
  )
}

// Heart-shaped confetti for special moments
export const HeartConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive = false,
  intensity = 'medium',
  className
}) => {
  const refAnimationInstance = useRef<any>(null)

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance
  }, [])

  const fireHearts = useCallback(() => {
    const count = intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 200
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#DA70D6']
    }

    function fire(particleRatio: number, opts: any) {
      refAnimationInstance.current &&
        refAnimationInstance.current({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      shapes: ['heart']
    })

    fire(0.2, {
      spread: 60,
      shapes: ['heart']
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      shapes: ['heart']
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      shapes: ['heart']
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      shapes: ['heart']
    })
  }, [intensity])

  useEffect(() => {
    if (isActive) {
      fireHearts()
    }
  }, [isActive, fireHearts])

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      className={className}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    />
  )
}

// Continuous gentle confetti for background ambiance
export const GentleConfettiAmbiance: React.FC<{
  isActive?: boolean
  className?: string
}> = ({
  isActive = false,
  className
}) => {
  const refAnimationInstance = useRef<any>(null)

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance
  }, [])

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      if (refAnimationInstance.current) {
        refAnimationInstance.current({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FFB6C1', '#FFC0CB', '#FFFFFF'],
          startVelocity: 20,
          gravity: 0.5,
          drift: 1,
          scalar: 0.6
        })

        refAnimationInstance.current({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FF69B4', '#DA70D6', '#FFFFFF'],
          startVelocity: 20,
          gravity: 0.5,
          drift: -1,
          scalar: 0.6
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      className={className}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 100
      }}
    />
  )
}
