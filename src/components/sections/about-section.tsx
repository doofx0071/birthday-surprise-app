'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Heart, MapPin, Camera, Clock, Sparkles, Gift } from 'lucide-react'

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
        'py-16 md:py-24',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-bright-pink" />
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black text-charcoal-black">
              About This Surprise
            </h2>
            <Sparkles className="w-8 h-8 text-bright-pink" />
          </div>
          <p className="font-body text-lg md:text-xl text-charcoal-black/70 max-w-3xl mx-auto leading-relaxed">
            A heartfelt collection of love, memories, and birthday wishes from everyone who cares about you
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <BirthdayCard className="p-6 md:p-8">
              <BirthdayCardContent>
                <div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-6 h-6 text-bright-pink" />
                      <h3 className="font-heading text-xl md:text-2xl font-black text-charcoal-black">
                        What Makes This Special?
                      </h3>
                    </div>
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
                <div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="w-6 h-6 text-bright-pink" />
                      <h3 className="font-heading text-xl md:text-2xl font-black text-charcoal-black">
                        How It Works
                      </h3>
                    </div>
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
            <h3 className="font-heading text-2xl md:text-3xl font-black text-charcoal-black text-center lg:text-left">
              What's Inside
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                {
                  title: "Heartfelt Messages",
                  description: "Personal notes and wishes from loved ones",
                  icon: Heart
                },
                {
                  title: "Memory Map",
                  description: "Interactive map of special places and moments",
                  icon: MapPin
                },
                {
                  title: "Photo Gallery",
                  description: "Beautiful collection of memories and moments",
                  icon: Camera
                },
                {
                  title: "Countdown Timer",
                  description: "Building excitement for the big day",
                  icon: Clock
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    className="p-5 neuro-card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-bright-pink" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                          {feature.title}
                        </h4>
                        <p className="font-body text-sm text-charcoal-black/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-flex items-center px-6 py-3 neuro-card">
            <p className="font-body text-sm md:text-base text-charcoal-black/80">
              Ready to add your own special message?
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
