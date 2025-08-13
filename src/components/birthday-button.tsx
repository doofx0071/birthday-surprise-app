'use client'

import * as React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BirthdayButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'heart'
  withHearts?: boolean
  sparkle?: boolean
}

const BirthdayButton = React.forwardRef<HTMLButtonElement, BirthdayButtonProps>(
  ({ className, variant = 'primary', withHearts = false, sparkle = false, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
      setIsMounted(true)
    }, [])

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg'
        case 'secondary':
          return 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
        case 'ghost':
          return 'hover:bg-primary/10 hover:text-primary'
        case 'outline':
          return 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
        case 'heart':
          return 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl'
        default:
          return 'bg-primary hover:bg-primary/90 text-primary-foreground'
      }
    }

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300 transform hover:scale-105',
          'font-semibold rounded-full',
          getVariantStyles(),
          withHearts && 'animate-pulse-soft',
          sparkle && 'sparkle-effect',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Floating hearts effect */}
        {isMounted && withHearts && isHovered && (
          <>
            <span className="absolute -top-2 left-1/4 text-xs animate-float opacity-70">♥</span>
            <span className="absolute -top-3 right-1/4 text-xs animate-float opacity-60" style={{ animationDelay: '0.5s' }}>♥</span>
          </>
        )}

        {/* Sparkle effect */}
        {isMounted && sparkle && isHovered && (
          <>
            <span className="absolute top-1 left-2 text-xs animate-sparkle">✨</span>
            <span className="absolute bottom-1 right-2 text-xs animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</span>
          </>
        )}
        
        {/* Button content */}
        <span className="relative z-10">
          {children}
        </span>
        
        {/* Gradient overlay for heart variant */}
        {variant === 'heart' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
      </Button>
    )
  }
)

BirthdayButton.displayName = 'BirthdayButton'

export { BirthdayButton, type BirthdayButtonProps }
