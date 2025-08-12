export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pure-white to-soft-pink/10">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="loading-spinner mx-auto mb-6"></div>
        
        {/* Loading Text */}
        <h2 className="font-display text-2xl font-semibold text-charcoal-black mb-2">
          Preparing the surprise...
        </h2>
        <p className="font-body text-charcoal-black/70">
          Something magical is loading ✨
        </p>
      </div>
    </div>
  )
}
