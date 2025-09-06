'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout'
import { AboutSection, MessageSection, GallerySection } from '@/components/sections'
import { CountdownWrapper } from '@/components/countdown/countdown-wrapper'
import { ContentRevealWrapper } from '@/components/reveal/ContentRevealWrapper'
import { useSystemConfig, getBirthdayConfigFromSystem } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

interface ClientPreviewFrameProps {
  previewMode: 'current' | 'post-countdown'
  isFullscreen: boolean
  onFullscreenExit: () => void
  forceRevealContent: boolean
}

export const ClientPreviewFrame: React.FC<ClientPreviewFrameProps> = ({
  previewMode,
  isFullscreen,
  onFullscreenExit,
  forceRevealContent,
}) => {
  const { config, loading, error } = useSystemConfig()
  const birthdayConfig = getBirthdayConfigFromSystem(config)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <div className="text-gray-600">Loading preview...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative',
      isFullscreen ? 'h-screen overflow-auto' : 'border-2 border-gray-200 rounded-lg overflow-hidden'
    )}>
      {/* Fullscreen Header */}
      {isFullscreen && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium text-charcoal-black">
                Client Preview: {previewMode === 'current' ? 'Current View' : 'Post-Countdown View'}
              </span>
              <div className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                previewMode === 'current' 
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-green-100 text-green-700'
              )}>
                {previewMode === 'current' ? 'Live Preview' : 'Simulation'}
              </div>
            </div>
            <button
              onClick={onFullscreenExit}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <span>✕</span>
              <span className="text-sm">Exit Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview Badge (non-fullscreen) */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-50">
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium shadow-lg',
            previewMode === 'current' 
              ? 'bg-orange-500 text-white'
              : 'bg-green-500 text-white'
          )}>
            {previewMode === 'current' ? 'Live Preview' : 'Simulation'}
          </div>
        </div>
      )}

      {/* Client Website Content */}
      <div className="min-h-screen w-full bg-white relative">
        {/* Pink Glow Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #ec4899 100%)
            `,
            backgroundSize: "100% 100%",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <Header />

          <main>
            {/* Hero Section with Countdown */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-16">
              <div className="text-center max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-8"
                >
                  <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-charcoal-black mb-6 leading-tight">
                    Happy Birthday
                    <br />
                    <span className="text-soft-pink">{birthdayConfig.girlfriendName}</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-charcoal-black/80 mb-8 leading-relaxed">
                    A special surprise from everyone who loves you
                  </p>
                </motion.div>

                <div className="mb-8">
                  <CountdownWrapper
                    targetDate={birthdayConfig.targetDate}
                    timezone={birthdayConfig.timezone}
                    girlfriendName={birthdayConfig.girlfriendName}
                    variant="large"
                    showSparkles={true}
                    enableFlipAnimation={true}
                    enableCelebration={true}
                    showTargetDate={true}
                    dateFormat="long"
                  />
                </div>
              </div>
            </section>

            {/* About Section */}
            <AboutSection />

            {/* Message Section */}
            <MessageSection />

            {/* Gallery Section - Conditionally Revealed */}
            <ContentRevealWrapper
              contentType="gallery"
              forceReveal={forceRevealContent}
            >
              <GallerySection />
            </ContentRevealWrapper>
          </main>
        </div>
      </div>
    </div>
  )
}
