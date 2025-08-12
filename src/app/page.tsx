import type { Metadata } from 'next'

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
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="font-display text-responsive-3xl font-bold text-charcoal-black mb-6">
            Birthday Surprise
          </h1>
          
          {/* Subtitle */}
          <p className="font-body text-xl md:text-2xl text-charcoal-black/80 mb-8 max-w-2xl mx-auto">
            Something magical is coming...
          </p>

          {/* Countdown Placeholder */}
          <div className="bg-white/80 backdrop-blur-sm rounded-4xl shadow-large p-8 md:p-12 mb-8">
            <div className="font-countdown text-6xl md:text-8xl font-bold text-soft-pink mb-4">
              🎂
            </div>
            <p className="font-body text-lg md:text-xl text-charcoal-black/70">
              Countdown timer will be here soon!
            </p>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <button className="bg-gradient-accent text-white font-semibold px-8 py-4 rounded-full shadow-medium hover:shadow-large transition-all duration-300 transform hover:scale-105">
              Add Your Birthday Message
            </button>
            <p className="font-body text-sm text-charcoal-black/60">
              Join family and friends in creating something special
            </p>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-charcoal-black mb-12">
            What&apos;s Coming
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="font-display text-xl font-semibold mb-2">Countdown Timer</h3>
              <p className="text-charcoal-black/70">Beautiful real-time countdown to the special day</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-4xl mb-4">💌</div>
              <h3 className="font-display text-xl font-semibold mb-2">Message Collection</h3>
              <p className="text-charcoal-black/70">Heartfelt messages from family and friends</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="font-display text-xl font-semibold mb-2">Memory Map</h3>
              <p className="text-charcoal-black/70">Interactive map showing love from around the world</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
