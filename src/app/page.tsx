'use client'

import { Header } from '@/components/layout'
import { AboutSection, MessageSection, GallerySection } from '@/components/sections'
import { CountdownWrapper } from '@/components/countdown/countdown-wrapper'
import { ContentRevealWrapper } from '@/components/reveal/ContentRevealWrapper'
import { useSystemConfig, getBirthdayConfigFromSystem } from '@/hooks/use-system-config'

export default function HomePage() {
  const { config, loading, error } = useSystemConfig()
  const birthdayConfig = getBirthdayConfigFromSystem(config)
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
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

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="home" className="relative flex min-h-screen items-center justify-center px-4 py-16 pt-20">
          {/* Floating Hearts Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 text-soft-pink/30 text-2xl animate-float">♥</div>
            <div className="absolute top-40 right-20 text-rose-gold/30 text-xl animate-float" style={{ animationDelay: '1s' }}>♥</div>
            <div className="absolute bottom-32 left-1/4 text-soft-pink/20 text-lg animate-float" style={{ animationDelay: '2s' }}>♥</div>
            <div className="absolute bottom-20 right-1/3 text-rose-gold/20 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>♥</div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Countdown Timer */}
            <div className="mb-6 sm:mb-8 lg:mb-12 w-full">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-soft-pink"></div>
                  <p className="mt-2 text-charcoal-black/60">Loading countdown...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">Failed to load countdown configuration</p>
                  <p className="text-sm text-charcoal-black/60">Using fallback values</p>
                </div>
              ) : null}

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

        {/* Gallery Section - Revealed after countdown */}
        <ContentRevealWrapper contentType="gallery">
          <GallerySection />
        </ContentRevealWrapper>
      </main>
      </div>
    </div>
  )
}
