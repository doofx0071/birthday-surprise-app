import type { Metadata } from 'next'
import { Header } from '@/components/layout'
import { AboutSection, MessageSection, GallerySection } from '@/components/sections'
import { CountdownWrapper } from '@/components/countdown/countdown-wrapper'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to the Birthday Surprise - A magical countdown to a special day',
}

export default function HomePage() {
  return (
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
            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-charcoal-black mb-4 sm:mb-6 lg:mb-8">
              Birthday Surprise
            </h1>

            {/* Subtitle */}
            <p className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal-black/80 mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto">
              Something magical is coming...
            </p>

            {/* Countdown Timer */}
            <div className="mb-6 sm:mb-8 lg:mb-12 w-full">
              <CountdownWrapper
                targetDate={process.env.NEXT_PUBLIC_BIRTHDAY_DATE}
                timezone={process.env.NEXT_PUBLIC_TIMEZONE}
                girlfriendName={process.env.NEXT_PUBLIC_GIRLFRIEND_NAME?.replace(/"/g, '') || "Your Special Someone"}
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

        {/* Gallery Section */}
        <GallerySection />
      </main>
      </div>
    </div>
  )
}
