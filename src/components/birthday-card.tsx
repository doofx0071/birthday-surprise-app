'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BirthdayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'floating' | 'sparkle'
  withHearts?: boolean
  glowEffect?: boolean
}

const BirthdayCard = React.forwardRef<HTMLDivElement, BirthdayCardProps>(
  ({ className, variant = 'default', withHearts = false, glowEffect = false, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const getVariantStyles = () => {
      switch (variant) {
        case 'gradient':
          return 'bg-gradient-to-br from-card via-primary/5 to-secondary/10 border-primary/20'
        case 'floating':
          return 'bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl'
        case 'sparkle':
          return 'bg-card border-primary/30 shadow-md hover:shadow-lg sparkle-effect'
        default:
          return 'bg-card border-border'
      }
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          'hover:scale-105 transform',
          getVariantStyles(),
          glowEffect && 'hover:shadow-primary/20 hover:shadow-2xl',
          withHearts && 'floating-hearts',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Floating hearts background */}
        {withHearts && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-4 text-primary/20 text-lg animate-float">♥</div>
            <div className="absolute top-8 right-6 text-primary/15 text-sm animate-float" style={{ animationDelay: '1s' }}>♥</div>
            <div className="absolute bottom-6 left-8 text-primary/10 text-xs animate-float" style={{ animationDelay: '2s' }}>♥</div>
            <div className="absolute bottom-4 right-4 text-primary/20 text-lg animate-float" style={{ animationDelay: '0.5s' }}>♥</div>
          </div>
        )}

        {/* Sparkle effects on hover */}
        {variant === 'sparkle' && isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-2 left-4 text-primary animate-sparkle">✨</span>
            <span className="absolute top-4 right-8 text-primary animate-sparkle" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="absolute bottom-4 left-6 text-primary animate-sparkle" style={{ animationDelay: '0.4s' }}>✨</span>
            <span className="absolute bottom-2 right-4 text-primary animate-sparkle" style={{ animationDelay: '0.6s' }}>✨</span>
          </div>
        )}

        {/* Gradient overlay for gradient variant */}
        {variant === 'gradient' && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-1000 translate-x-full" />
        )}

        {/* Card content */}
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    )
  }
)

BirthdayCard.displayName = 'BirthdayCard'

// Export individual card components with birthday styling
const BirthdayCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <CardHeader
      ref={ref}
      className={cn('text-center', className)}
      {...props}
    />
  )
)
BirthdayCardHeader.displayName = 'BirthdayCardHeader'

const BirthdayCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <CardTitle
      ref={ref}
      className={cn('font-display text-xl text-foreground', className)}
      {...props}
    />
  )
)
BirthdayCardTitle.displayName = 'BirthdayCardTitle'

const BirthdayCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <CardContent
      ref={ref}
      className={cn('text-center', className)}
      {...props}
    />
  )
)
BirthdayCardContent.displayName = 'BirthdayCardContent'

export { 
  BirthdayCard, 
  BirthdayCardHeader, 
  BirthdayCardTitle, 
  BirthdayCardContent,
  type BirthdayCardProps 
}
