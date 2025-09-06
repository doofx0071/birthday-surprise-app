'use client'

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MemoryMap } from '@/components/map/MemoryMap'

interface MemoryMapSectionProps {
  className?: string
  /**
   * Force reveal content (for admin preview)
   */
  forceReveal?: boolean
}

export const MemoryMapSection: React.FC<MemoryMapSectionProps> = ({
  className,
  forceReveal = false
}) => {
  // Memoize callback functions to prevent unnecessary re-renders
  const handlePinClick = useCallback((event: any) => {
    console.log('Pin clicked:', event.pin)
  }, [])

  const handleMapLoad = useCallback((event: any) => {
    console.log('Map loaded:', event.map)
  }, [])
  return (
    <section
      id="memory-map"
      className={cn(
        'py-16 md:py-24',
        className
      )}
    >
      <div className="w-[95%] sm:w-[92%] md:w-[90%] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-charcoal-black mb-4">
            Memory Map
          </h2>
          <p className="text-lg md:text-xl text-charcoal-black/70 max-w-2xl mx-auto leading-relaxed">
            Discover where all the love is coming from around the world. Each pin represents a heartfelt message from family and friends.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="neuro-card overflow-hidden"
        >
          <MemoryMap
            height="600px"
            className="w-full"
            showFilters={false}
            onPinClick={handlePinClick}
            onLoad={handleMapLoad}
          />
        </motion.div>

        {/* Map Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="neuro-card p-6 text-center">
            <div className="text-3xl mb-2">🌍</div>
            <div className="font-display text-2xl font-bold text-charcoal-black mb-1">
              Global Love
            </div>
            <div className="text-charcoal-black/70">
              Messages from around the world
            </div>
          </div>

          <div className="neuro-card p-6 text-center">
            <div className="text-3xl mb-2">📍</div>
            <div className="font-display text-2xl font-bold text-charcoal-black mb-1">
              Every Location
            </div>
            <div className="text-charcoal-black/70">
              Pinpointed with precision
            </div>
          </div>

          <div className="neuro-card p-6 text-center">
            <div className="text-3xl mb-2">💝</div>
            <div className="font-display text-2xl font-bold text-charcoal-black mb-1">
              Heartfelt Messages
            </div>
            <div className="text-charcoal-black/70">
              Each pin tells a story
            </div>
          </div>
        </motion.div>

        {/* Interactive Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-soft-pink/10 rounded-full border border-soft-pink/20">
            <span className="text-xl">💡</span>
            <span className="text-charcoal-black/70">
              Click on any pin to read the message and see photos!
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
