'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { HeartIcon, SparkleIcon, CakeIcon } from '@/design-system/icons/birthday-icons'
import { BirthdayCard, BirthdayCardContent } from '@/components/birthday-card'

interface AboutSectionProps {
  className?: string
}

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const girlfriendName = process.env.NEXT_PUBLIC_GIRLFRIEND_NAME?.replace(/"/g, '') || "Your Special Someone"

  return (
    <section
      id="about"
      className={cn(
        'py-16 md:py-24 bg-gradient-to-br from-white to-primary/5',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparkleIcon size="md" color="pink" className="animate-sparkle" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black">
              About This Surprise
            </h2>
            <SparkleIcon size="md" color="roseGold" className="animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto">
            A heartfelt collection of love, memories, and birthday wishes from everyone who cares about you
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <BirthdayCard className="p-6 md:p-8">
              <BirthdayCardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <HeartIcon size="lg" color="pink" className="animate-pulse-soft" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-charcoal-black mb-3">
                      What Makes This Special?
                    </h3>
                    <p className="font-body text-base md:text-lg text-charcoal-black/80 leading-relaxed">
                      This isn't just a birthday countdown – it's a celebration of you, {girlfriendName}. 
                      Every message, every memory, and every moment shared here represents the love and 
                      joy you bring into our lives.
                    </p>
                  </div>
                </div>
              </BirthdayCardContent>
            </BirthdayCard>

            <BirthdayCard className="p-6 md:p-8">
              <BirthdayCardContent>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CakeIcon size="lg" color="roseGold" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-charcoal-black mb-3">
                      How It Works
                    </h3>
                    <p className="font-body text-base md:text-lg text-charcoal-black/80 leading-relaxed">
                      Friends and family can contribute messages, photos, and memories that will be 
                      revealed on your special day. Each contribution adds to the magic of your 
                      birthday celebration.
                    </p>
                  </div>
                </div>
              </BirthdayCardContent>
            </BirthdayCard>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-charcoal-black text-center lg:text-left">
              What's Inside
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                {
                  icon: <HeartIcon size="md" color="pink" />,
                  title: "Heartfelt Messages",
                  description: "Personal notes and wishes from loved ones"
                },
                {
                  icon: <SparkleIcon size="md" color="roseGold" />,
                  title: "Memory Map",
                  description: "Interactive map of special places and moments"
                },
                {
                  icon: <CakeIcon size="md" color="pink" />,
                  title: "Photo Gallery",
                  description: "Beautiful collection of memories and moments"
                },
                {
                  icon: <HeartIcon size="md" color="roseGold" />,
                  title: "Countdown Timer",
                  description: "Building excitement for the big day"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-charcoal-black">
                      {feature.title}
                    </h4>
                    <p className="font-body text-sm text-charcoal-black/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 rounded-full">
            <SparkleIcon size="sm" color="pink" className="animate-sparkle" />
            <p className="font-body text-sm md:text-base text-charcoal-black/80">
              Ready to add your own special message?
            </p>
            <SparkleIcon size="sm" color="roseGold" className="animate-sparkle" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
