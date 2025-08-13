'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'
import { BirthdayCard, BirthdayCardContent } from '@/components/birthday-card'
import { BirthdayButton } from '@/components/birthday-button'

interface ContributeSectionProps {
  className?: string
}

export const ContributeSection: React.FC<ContributeSectionProps> = ({ className }) => {
  return (
    <section
      id="contribute"
      className={cn(
        'py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/10',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HeartIcon size="md" color="pink" className="animate-pulse-soft" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black">
              Share Your Love
            </h2>
            <HeartIcon size="md" color="roseGold" className="animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto">
            Add your heartfelt message, photos, and memories to make this birthday extra special
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <BirthdayCard className="p-8 md:p-12 text-center">
            <BirthdayCardContent>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <SparkleIcon size="xl" color="pink" className="animate-sparkle" />
                    <SparkleIcon 
                      size="md" 
                      color="roseGold" 
                      className="absolute -top-2 -right-2 animate-sparkle" 
                      style={{ animationDelay: '0.3s' }} 
                    />
                  </div>
                </div>
                
                <h3 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black">
                  Message Form Coming Soon!
                </h3>
                
                <p className="font-body text-base md:text-lg text-charcoal-black/70 max-w-2xl mx-auto">
                  We're building an amazing form where you can share your birthday messages, 
                  upload photos, and add special memories. This will be implemented in the next task!
                </p>

                <div className="space-y-4">
                  <h4 className="font-display text-lg font-semibold text-charcoal-black">
                    What you'll be able to share:
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: '💌', title: 'Messages', desc: 'Heartfelt birthday wishes' },
                      { icon: '📸', title: 'Photos', desc: 'Favorite memories together' },
                      { icon: '🗺️', title: 'Locations', desc: 'Special places on the map' }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-white/50 rounded-xl">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h5 className="font-display font-semibold text-charcoal-black mb-1">
                          {item.title}
                        </h5>
                        <p className="font-body text-sm text-charcoal-black/70">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <BirthdayButton
                    variant="primary"
                    size="lg"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Coming in Task 06 - Message Form
                  </BirthdayButton>
                </div>
              </div>
            </BirthdayCardContent>
          </BirthdayCard>
        </div>
      </div>
    </section>
  )
}
