'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AnimatedHeartIcon, AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'

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
          return 'neuro-input'
        case 'celebration':
          return 'neuro-input'
        default:
          return 'neuro-input'
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
            {label}
            {sparkle && isFocused && (
              <span className="text-pink-500 text-xs">✨</span>
            )}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              'placeholder:text-muted-foreground/40',
              getVariantStyles(),
              error && 'border-destructive focus:border-destructive',
              sparkle && hasValue && 'neuro-animate-pulse',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            {...props}
          />

          {/* Icon inside input - removed per user request */}

          {/* Sparkle effect on focus */}
          {sparkle && isFocused && (
            <div className="absolute -top-1 -right-1">
              <span className="text-pink-500 text-xs">✨</span>
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {sparkle && (
              <AnimatedSparkleIcon size="xs" intensity="subtle" className="opacity-50" />
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
