import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { BirthdayButton } from '@/components/birthday-button'
import { BirthdayCard, BirthdayCardHeader, BirthdayCardTitle, BirthdayCardContent } from '@/components/birthday-card'
import CountdownTimer from '@/components/countdown/countdown-timer'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to the Birthday Surprise - A magical countdown to a special day',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/10">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-4 py-16">
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
            <CountdownTimer
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

          {/* Call to Action */}
          <div className="space-y-4">
            <BirthdayButton
              variant="heart"
              size="lg"
              withHearts={true}
              sparkle={true}
              className="px-8 py-6 text-lg"
            >
              Add Your Birthday Message
            </BirthdayButton>
            <p className="font-body text-sm text-muted-foreground">
              Join family and friends in creating something special
            </p>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What&apos;s Coming
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <BirthdayCard variant="gradient" glowEffect={true}>
              <BirthdayCardHeader>
                <div className="text-4xl mb-2 animate-pulse-soft">⏰</div>
                <BirthdayCardTitle>
                  Countdown Timer
                </BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p className="text-muted-foreground mb-3">Beautiful real-time countdown to the special day</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Coming Soon
                </Badge>
              </BirthdayCardContent>
            </BirthdayCard>

            {/* Feature 2 */}
            <BirthdayCard variant="sparkle" withHearts={true} glowEffect={true}>
              <BirthdayCardHeader>
                <div className="text-4xl mb-2 animate-heart-beat">💌</div>
                <BirthdayCardTitle>
                  Message Collection
                </BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p className="text-muted-foreground mb-3">Heartfelt messages from family and friends</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Coming Soon
                </Badge>
              </BirthdayCardContent>
            </BirthdayCard>

            {/* Feature 3 */}
            <BirthdayCard variant="floating" glowEffect={true}>
              <BirthdayCardHeader>
                <div className="text-4xl mb-2 animate-float">🗺️</div>
                <BirthdayCardTitle>
                  Memory Map
                </BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p className="text-muted-foreground mb-3">Interactive map showing love from around the world</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Coming Soon
                </Badge>
              </BirthdayCardContent>
            </BirthdayCard>
          </div>
        </div>
      </section>
    </main>
  )
}
