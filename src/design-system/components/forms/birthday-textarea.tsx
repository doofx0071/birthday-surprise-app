'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AnimatedHeartIcon, AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'

interface BirthdayTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'birthday' | 'celebration'
  withIcon?: boolean
  sparkle?: boolean
  required?: boolean
  maxLength?: number
  showCharCount?: boolean
}

const BirthdayTextarea = React.forwardRef<HTMLTextAreaElement, BirthdayTextareaProps>(
  ({
    className,
    label,
    error,
    hint,
    variant = 'default',
    withIcon = false,
    sparkle = false,
    required = false,
    maxLength,
    showCharCount = false,
    id,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)
    const generatedId = React.useId()
    const textareaId = id || generatedId

    const getVariantStyles = () => {
      switch (variant) {
        case 'birthday':
          return 'border-primary/30 focus:border-primary focus:ring-primary/20 bg-gradient-to-br from-white to-primary/5'
        case 'celebration':
          return 'border-accent/30 focus:border-accent focus:ring-accent/20 bg-gradient-to-br from-white to-accent/5'
        default:
          return 'border-border focus:border-primary focus:ring-primary/20'
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length)
      }
    }, [value])

    const isNearLimit = maxLength && charCount > maxLength * 0.8
    const isOverLimit = maxLength && charCount > maxLength

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <Label 
            htmlFor={textareaId}
            className={cn(
              'text-sm font-medium text-foreground',
              'flex items-center gap-2',
              required && 'after:content-["*"] after:text-destructive'
            )}
          >
            {withIcon && (
              <AnimatedHeartIcon
                size="xs"
                color="pink"
                intensity={isFocused ? "normal" : "subtle"}
              />
            )}
            {label}
            {sparkle && isFocused && (
              <AnimatedSparkleIcon
                size="xs"
                color="pink"
                intensity="normal"
              />
            )}
          </Label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <Textarea
            ref={ref}
            id={textareaId}
            maxLength={maxLength}
            value={value}
            className={cn(
              'min-h-[100px] transition-all duration-300',
              'placeholder:text-muted-foreground/60',
              'hover:border-primary/50',
              'resize-none',
              getVariantStyles(),
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              sparkle && charCount > 0 && 'shadow-md shadow-primary/10',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            {...props}
          />

          {/* Floating hearts when typing */}
          {sparkle && isFocused && charCount > 0 && (
            <div className="absolute top-2 right-2 pointer-events-none">
              <div className="relative">
                <AnimatedHeartIcon
                  size="xs"
                  color="pink"
                  intensity="subtle"
                  className="opacity-60"
                />
                <AnimatedSparkleIcon
                  size="xs"
                  color="pink"
                  intensity="normal"
                  className="absolute -top-1 -right-1"
                />
              </div>
            </div>
          )}

          {/* Character count */}
          {(showCharCount || maxLength) && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={cn(
                'transition-colors duration-200',
                isOverLimit && 'text-destructive font-medium',
                isNearLimit && !isOverLimit && 'text-warning-600 font-medium'
              )}>
                {charCount}
                {maxLength && `/${maxLength}`}
              </span>
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

        {/* Character limit warning */}
        {isOverLimit && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <span className="text-destructive">⚠</span>
            Message is too long. Please keep it under {maxLength} characters.
          </p>
        )}
      </div>
    )
  }
)

BirthdayTextarea.displayName = 'BirthdayTextarea'

export { BirthdayTextarea, type BirthdayTextareaProps }
