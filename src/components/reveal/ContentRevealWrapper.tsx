'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContentReveal } from '@/hooks/useCountdownStatus'
import { cn } from '@/lib/utils'
import { Camera, MapPin, Clock, Sparkles } from 'lucide-react'

interface ContentRevealWrapperProps {
  children: React.ReactNode
  className?: string
  /**
   * Type of content being wrapped (for customized coming soon messages)
   */
  contentType?: 'gallery' | 'map' | 'general'
  /**
   * Force reveal content (for admin preview)
   */
  forceReveal?: boolean
  /**
   * Custom coming soon message
   */
  comingSoonMessage?: string
}

export const ContentRevealWrapper: React.FC<ContentRevealWrapperProps> = ({
  children,
  className,
  contentType = 'general',
  forceReveal = false,
  comingSoonMessage,
}) => {
  const { shouldRevealContent, isLoading, countdownStatus } = useContentReveal()

  const shouldShow = forceReveal || shouldRevealContent

  const getContentData = () => {
    switch (contentType) {
      case 'gallery':
        return {
          icon: Camera,
          title: 'Memory Gallery',
          description: 'A beautiful collection of heartfelt messages, precious photos, and cherished memories from everyone who loves you will be revealed when the countdown ends.',
          comingSoonText: 'Gallery will be revealed when the countdown ends!'
        }
      case 'map':
        return {
          icon: MapPin,
          title: 'Memory Map',
          description: 'An interactive map showing all the locations where birthday wishes came from will appear once the countdown reaches zero.',
          comingSoonText: 'Map will show all locations when countdown ends!'
        }
      default:
        return {
          icon: Sparkles,
          title: 'Special Content',
          description: 'This content will be revealed when the countdown ends.',
          comingSoonText: 'Content will be revealed soon!'
        }
    }
  }

  const contentData = getContentData()
  const IconComponent = contentData.icon

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {shouldShow ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="coming-soon"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="py-16 md:py-24"
          >
            <div className="w-[95%] sm:w-[85%] md:w-[75%] lg:w-[70%] mx-auto">
              <div className="text-center p-6 neuro-card">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 neuro-icon-container rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-bright-pink" />
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-heading text-lg font-semibold text-charcoal-black mb-2">
                  {contentData.title}
                </h4>

                {/* Description */}
                <p className="font-body text-sm text-charcoal-black/70 mb-6">
                  {comingSoonMessage || contentData.description}
                </p>

                {/* Countdown Display */}
                {!isLoading && countdownStatus && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-soft-pink/10 rounded-full border border-soft-pink/20">
                    <Clock className="w-4 h-4 text-bright-pink" />
                    <span className="font-body text-sm text-charcoal-black">
                      {countdownStatus.timeRemaining.days > 0 && (
                        <>
                          {countdownStatus.timeRemaining.days} day{countdownStatus.timeRemaining.days !== 1 ? 's' : ''}{' '}
                          {countdownStatus.timeRemaining.hours > 0 && (
                            <>and {countdownStatus.timeRemaining.hours} hour{countdownStatus.timeRemaining.hours !== 1 ? 's' : ''} </>
                          )}
                          remaining
                        </>
                      )}
                      {countdownStatus.timeRemaining.days === 0 && countdownStatus.timeRemaining.hours > 0 && (
                        <>
                          {countdownStatus.timeRemaining.hours} hour{countdownStatus.timeRemaining.hours !== 1 ? 's' : ''}{' '}
                          {countdownStatus.timeRemaining.minutes > 0 && (
                            <>and {countdownStatus.timeRemaining.minutes} minute{countdownStatus.timeRemaining.minutes !== 1 ? 's' : ''} </>
                          )}
                          remaining
                        </>
                      )}
                      {countdownStatus.timeRemaining.days === 0 && countdownStatus.timeRemaining.hours === 0 && (
                        <>
                          {countdownStatus.timeRemaining.minutes} minute{countdownStatus.timeRemaining.minutes !== 1 ? 's' : ''} remaining
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Thank you message */}
                <div className="mt-4">
                  <span className="font-body text-sm text-charcoal-black/70">
                    Thank you for being part of this special surprise
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
