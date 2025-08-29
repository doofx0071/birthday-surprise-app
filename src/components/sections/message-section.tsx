'use client'

import React from 'react'
import { WorkingMessageForm } from '@/components/forms/WorkingMessageForm'
import { AnimatedHeartIcon } from '@/design-system/icons/animated-birthday-icons'

export const MessageSection: React.FC = () => {
  return (
    <section id="messages" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <AnimatedHeartIcon size="lg" color="pink" intensity="normal" />
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-black">
              Share Your Birthday Wishes
            </h2>
          </div>

          <p className="font-body text-lg md:text-xl text-charcoal-black/80 max-w-3xl mx-auto">
            Your heartfelt message will be part of something truly special. Share your wishes,
            memories, or anything that will make this birthday unforgettable.
          </p>
        </div>

        {/* Working Message Form */}
        <div className="mb-12 md:mb-16">
          <WorkingMessageForm />
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Privacy */}
          <div className="text-center p-6 neuro-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 neuro-icon-container rounded-full flex items-center justify-center">
              </div>
            </div>
            <h4 className="font-display text-lg font-semibold text-charcoal-black mb-2">
              Your Privacy Matters
            </h4>
            <p className="font-body text-sm text-charcoal-black/70">
              Your email and personal information are kept secure and only used for birthday reminders if you opt in.
            </p>
          </div>

          {/* Approval */}
          <div className="text-center p-6 neuro-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 neuro-icon-container rounded-full flex items-center justify-center">
              </div>
            </div>
            <h4 className="font-display text-lg font-semibold text-charcoal-black mb-2">
              Reviewed with Care
            </h4>
            <p className="font-body text-sm text-charcoal-black/70">
              All messages are reviewed to ensure they're appropriate and will make the birthday celebration special.
            </p>
          </div>

          {/* Display */}
          <div className="text-center p-6 neuro-card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 neuro-icon-container rounded-full flex items-center justify-center">
              </div>
            </div>
            <h4 className="font-display text-lg font-semibold text-charcoal-black mb-2">
              Beautifully Displayed
            </h4>
            <p className="font-body text-sm text-charcoal-black/70">
              Your message will be beautifully presented as part of the birthday surprise experience.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto p-8 neuro-card">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AnimatedHeartIcon size="md" color="pink" intensity="normal" />
              <h4 className="font-display text-2xl font-bold text-charcoal-black">
                Make It Extra Special
              </h4>
              <AnimatedHeartIcon size="md" color="roseGold" intensity="normal" />
            </div>
            
            <p className="font-body text-base text-charcoal-black/80 mb-6">
              Every message adds to the magic of this birthday celebration. Your words will be treasured forever.
            </p>

            <div className="flex items-center justify-center">
              <span className="font-body text-sm text-charcoal-black/70">
                Thank you for being part of this special surprise
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
