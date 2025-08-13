'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'
import { BirthdayCard, BirthdayCardContent } from '@/components/birthday-card'

interface GallerySectionProps {
  className?: string
}

export const GallerySection: React.FC<GallerySectionProps> = ({ className }) => {
  const girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME?.replace(/"/g, '') || "Your Special Someone"

  return (
    <section
      id="gallery"
      className={cn(
        'py-16 md:py-24 bg-gradient-to-br from-accent/5 to-primary/10',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HeartIcon size="md" color="pink" className="animate-pulse-soft" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black">
              Memory Gallery
            </h2>
            <HeartIcon size="md" color="roseGold" className="animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto">
            A beautiful collection of messages, photos, and memories for {girlfriendName}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          <BirthdayCard className="p-8 md:p-12">
            <BirthdayCardContent>
              <div className="text-center space-y-8">
                <div className="flex justify-center space-x-4">
                  <div className="text-4xl md:text-6xl">🖼️</div>
                  <div className="text-4xl md:text-6xl">📸</div>
                  <div className="text-4xl md:text-6xl">💌</div>
                </div>
                
                <h3 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black">
                  Gallery Will Be Revealed on Birthday!
                </h3>
                
                <p className="font-body text-base md:text-lg text-charcoal-black/70 max-w-3xl mx-auto">
                  This special gallery will showcase all the beautiful messages, photos, and memories 
                  that friends and family have shared. It will be unlocked and revealed on the big day 
                  as part of the birthday surprise!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {[
                    {
                      icon: <HeartIcon size="lg" color="pink" />,
                      title: "Birthday Messages",
                      description: "Heartfelt wishes and notes from loved ones",
                      count: "Coming Soon"
                    },
                    {
                      icon: <SparkleIcon size="lg" color="roseGold" />,
                      title: "Photo Memories",
                      description: "Beautiful photos and special moments",
                      count: "Coming Soon"
                    },
                    {
                      icon: <HeartIcon size="lg" color="roseGold" />,
                      title: "Video Messages",
                      description: "Personal video greetings and memories",
                      count: "Coming Soon"
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-6 bg-white/50 rounded-2xl text-center">
                      <div className="flex justify-center mb-4">
                        {item.icon}
                      </div>
                      <h4 className="font-display text-lg font-semibold text-charcoal-black mb-2">
                        {item.title}
                      </h4>
                      <p className="font-body text-sm text-charcoal-black/70 mb-3">
                        {item.description}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full">
                        <span className="font-body text-xs font-medium text-primary">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
                    <SparkleIcon size="sm" color="pink" className="animate-sparkle" />
                    <span className="font-body text-sm text-charcoal-black/80">
                      Gallery unlocks on birthday day! 🎉
                    </span>
                    <SparkleIcon size="sm" color="roseGold" className="animate-sparkle" style={{ animationDelay: '0.3s' }} />
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
