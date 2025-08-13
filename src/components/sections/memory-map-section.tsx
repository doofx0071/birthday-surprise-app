'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SparkleIcon } from '@/design-system/icons/birthday-icons'
import { BirthdayCard, BirthdayCardContent } from '@/components/birthday-card'

interface MemoryMapSectionProps {
  className?: string
}

export const MemoryMapSection: React.FC<MemoryMapSectionProps> = ({ className }) => {
  return (
    <section
      id="memory-map"
      className={cn(
        'py-16 md:py-24 bg-gradient-to-br from-white to-accent/5',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparkleIcon size="md" color="roseGold" className="animate-sparkle" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black">
              Memory Map
            </h2>
            <SparkleIcon size="md" color="pink" className="animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto">
            Explore special places and memories from around the world
          </p>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          <BirthdayCard className="p-8 md:p-12">
            <BirthdayCardContent>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="text-6xl md:text-8xl">🗺️</div>
                </div>
                
                <h3 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black">
                  Interactive Memory Map Coming Soon!
                </h3>
                
                <p className="font-body text-base md:text-lg text-charcoal-black/70 max-w-2xl mx-auto">
                  This will be an interactive world map where friends and family can pin special 
                  locations and share memories associated with those places. Coming in Task 09!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {[
                    { emoji: '📍', title: 'Pin Locations', desc: 'Mark special places' },
                    { emoji: '💭', title: 'Share Stories', desc: 'Add memory details' },
                    { emoji: '📸', title: 'Photo Markers', desc: 'Visual memories' },
                    { emoji: '🌍', title: 'Global View', desc: 'Worldwide memories' }
                  ].map((feature, index) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-xl text-center">
                      <div className="text-3xl mb-2">{feature.emoji}</div>
                      <h4 className="font-display font-semibold text-charcoal-black mb-1">
                        {feature.title}
                      </h4>
                      <p className="font-body text-sm text-charcoal-black/70">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-accent/10 rounded-full">
                    <SparkleIcon size="sm" color="roseGold" className="animate-sparkle" />
                    <span className="font-body text-sm text-charcoal-black/80">
                      Task 09: Memory Map Implementation
                    </span>
                  </div>
                </div>
              </div>
            </BirthdayCardContent>
          </BirthdayCard>
        </div>
      </div>
    </section>
  )
}
