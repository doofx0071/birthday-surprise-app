'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { HeartIcon, SparkleIcon } from '@/design-system/icons/birthday-icons'

interface BirthdayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'birthday' | 'celebration'
  withIcon?: boolean
  sparkle?: boolean
  required?: boolean
}

const BirthdayInput = React.forwardRef<HTMLInputElement, BirthdayInputProps>(
  ({
    className,
    label,
    error,
    hint,
    variant = 'default',
    withIcon = false,
    sparkle = false,
    required = false,
    id,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id || generatedId

    const getVariantStyles = () => {
      switch (variant) {
        case 'birthday':
          return 'border-primary/30 focus:border-primary focus:ring-primary/20 bg-gradient-to-r from-white to-primary/5'
        case 'celebration':
          return 'border-accent/30 focus:border-accent focus:ring-accent/20 bg-gradient-to-r from-white to-accent/5'
        default:
          return 'border-border focus:border-primary focus:ring-primary/20'
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium text-foreground',
              'flex items-center gap-2',
              required && 'after:content-["*"] after:text-destructive'
            )}
          >
            {withIcon && (
              <HeartIcon 
                size="xs" 
                color="pink" 
                className={cn(
                  'transition-all duration-200',
                  isFocused && 'animate-heart-beat'
                )}
              />
            )}
            {label}
            {sparkle && isFocused && (
              <SparkleIcon 
                size="xs" 
                color="pink" 
                className="animate-sparkle"
              />
            )}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              'transition-all duration-300',
              'placeholder:text-muted-foreground/60',
              'hover:border-primary/50',
              getVariantStyles(),
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              withIcon && 'pl-10',
              sparkle && hasValue && 'shadow-md shadow-primary/10',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            {...props}
          />

          {/* Icon inside input */}
          {withIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <HeartIcon 
                size="sm" 
                color={isFocused ? 'pink' : 'current'} 
                className={cn(
                  'transition-all duration-200 opacity-60',
                  isFocused && 'opacity-100 animate-pulse-soft'
                )}
              />
            </div>
          )}

          {/* Sparkle effect on focus */}
          {sparkle && isFocused && (
            <div className="absolute -top-1 -right-1">
              <SparkleIcon 
                size="xs" 
                color="pink" 
                className="animate-sparkle"
              />
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {sparkle && (
              <SparkleIcon size="xs" className="opacity-50" />
            )}
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <span className="text-destructive">⚠</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

BirthdayInput.displayName = 'BirthdayInput'

export { BirthdayInput, type BirthdayInputProps }
