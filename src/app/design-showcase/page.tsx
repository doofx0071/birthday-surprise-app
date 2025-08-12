import type { Metadata } from 'next'
import { BirthdayButton } from '@/components/birthday-button'
import { BirthdayCard, BirthdayCardHeader, BirthdayCardTitle, BirthdayCardContent } from '@/components/birthday-card'
import { BirthdayInput } from '@/design-system/components/forms/birthday-input'
import { BirthdayTextarea } from '@/design-system/components/forms/birthday-textarea'
import { Badge } from '@/components/ui/badge'
import { BirthdayIcons } from '@/design-system/icons/birthday-icons'

export const metadata: Metadata = {
  title: 'Design Showcase',
  description: 'Birthday Surprise Design System Components',
}

export default function DesignShowcasePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pure-white to-soft-pink/10 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-charcoal-black mb-4">
            Design System
          </h1>
          <p className="font-body text-xl text-charcoal-black/70 max-w-2xl mx-auto">
            Birthday Surprise Design System showcasing our beautiful components, 
            colors, typography, and animations.
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-full h-24 bg-pure-white border-2 border-charcoal-black/10 rounded-xl mb-3 shadow-soft"></div>
              <p className="font-body text-sm font-medium">Pure White</p>
              <p className="font-body text-xs text-charcoal-black/60">#FFFFFF</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 bg-soft-pink rounded-xl mb-3 shadow-soft"></div>
              <p className="font-body text-sm font-medium">Soft Pink</p>
              <p className="font-body text-xs text-charcoal-black/60">#FFB6C1</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 bg-rose-gold rounded-xl mb-3 shadow-soft"></div>
              <p className="font-body text-sm font-medium">Rose Gold</p>
              <p className="font-body text-xs text-charcoal-black/60">#E8B4B8</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 bg-charcoal-black rounded-xl mb-3 shadow-soft"></div>
              <p className="font-body text-sm font-medium">Charcoal</p>
              <p className="font-body text-xs text-charcoal-black/60">#2D2D2D</p>
            </div>
            <div className="text-center">
              <div className="w-full h-24 bg-light-gray rounded-xl mb-3 shadow-soft"></div>
              <p className="font-body text-sm font-medium">Light Gray</p>
              <p className="font-body text-xs text-charcoal-black/60">#F8F9FA</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Typography</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-5xl font-bold text-charcoal-black">
                Display Font - Playfair Display
              </h3>
              <p className="text-sm text-charcoal-black/60 mt-2">Used for headings and special text</p>
            </div>
            <div>
              <p className="font-body text-xl text-charcoal-black">
                Body Font - Inter - Used for general content and readable text
              </p>
              <p className="text-sm text-charcoal-black/60 mt-2">Clean, modern sans-serif</p>
            </div>
            <div>
              <p className="font-countdown text-2xl font-bold text-charcoal-black">
                Countdown Font - Poppins - 12:34:56
              </p>
              <p className="text-sm text-charcoal-black/60 mt-2">Bold display font for timers</p>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Birthday Icons</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {Object.entries(BirthdayIcons).map(([name, Icon]) => (
              <div key={name} className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-soft flex items-center justify-center mb-2">
                  <Icon size="lg" color="pink" />
                </div>
                <p className="font-body text-xs text-charcoal-black/70">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-body text-lg font-semibold">Standard Variants</h3>
              <BirthdayButton variant="primary">Primary Button</BirthdayButton>
              <BirthdayButton variant="secondary">Secondary Button</BirthdayButton>
              <BirthdayButton variant="ghost">Ghost Button</BirthdayButton>
              <BirthdayButton variant="outline">Outline Button</BirthdayButton>
            </div>
            <div className="space-y-4">
              <h3 className="font-body text-lg font-semibold">Special Effects</h3>
              <BirthdayButton variant="heart" withHearts>Heart Button</BirthdayButton>
              <BirthdayButton variant="primary" sparkle>Sparkle Button</BirthdayButton>
              <BirthdayButton variant="heart" withHearts sparkle>
                Full Effects
              </BirthdayButton>
            </div>
            <div className="space-y-4">
              <h3 className="font-body text-lg font-semibold">Sizes</h3>
              <BirthdayButton size="sm" variant="primary">Small</BirthdayButton>
              <BirthdayButton size="default" variant="primary">Default</BirthdayButton>
              <BirthdayButton size="lg" variant="primary">Large</BirthdayButton>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BirthdayCard variant="default">
              <BirthdayCardHeader>
                <BirthdayCardTitle>Default Card</BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p>Clean and simple card design for general content.</p>
              </BirthdayCardContent>
            </BirthdayCard>

            <BirthdayCard variant="gradient" glowEffect>
              <BirthdayCardHeader>
                <BirthdayCardTitle>Gradient Card</BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p>Beautiful gradient background with glow effect.</p>
              </BirthdayCardContent>
            </BirthdayCard>

            <BirthdayCard variant="sparkle" withHearts>
              <BirthdayCardHeader>
                <BirthdayCardTitle>Sparkle Card</BirthdayCardTitle>
              </BirthdayCardHeader>
              <BirthdayCardContent>
                <p>Magical sparkle effects with floating hearts.</p>
              </BirthdayCardContent>
            </BirthdayCard>
          </div>
        </section>

        {/* Form Components */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Form Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <BirthdayInput
                label="Standard Input"
                placeholder="Enter your name"
                hint="This is a standard input field"
              />
              <BirthdayInput
                label="Birthday Input"
                placeholder="Enter your message"
                variant="birthday"
                withIcon
                sparkle
                hint="Special birthday-themed input with effects"
              />
              <BirthdayInput
                label="Required Field"
                placeholder="Required field"
                required
                error="This field is required"
              />
            </div>
            <div className="space-y-6">
              <BirthdayTextarea
                label="Standard Textarea"
                placeholder="Write your message here..."
                hint="Standard textarea for longer content"
              />
              <BirthdayTextarea
                label="Birthday Message"
                placeholder="Share your birthday wishes..."
                variant="celebration"
                withIcon
                sparkle
                maxLength={500}
                showCharCount
                hint="Special birthday message with character limit"
              />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-charcoal-black mb-8">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-primary text-primary-foreground">Birthday</Badge>
            <Badge className="bg-accent text-accent-foreground">Celebration</Badge>
          </div>
        </section>
      </div>
    </main>
  )
}
