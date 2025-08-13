'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useGeolocation } from '@/hooks/use-geolocation'
import { BirthdayInput } from '@/design-system/components/forms/birthday-input'
import { Button } from '@/components/ui/button'
import { AnimatedSparkleIcon } from '@/design-system/icons/animated-birthday-icons'

interface LocationPickerProps {
  value?: string
  onChange?: (location: string) => void
  onLocationDetected?: (locationData: {
    city?: string
    country?: string
    latitude: number
    longitude: number
  }) => void
  error?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value = '',
  onChange,
  onLocationDetected,
  error,
  className,
  placeholder = "Enter your location (optional)",
  disabled = false
}) => {
  const [manualLocation, setManualLocation] = useState(value)
  const [showDetectedLocation, setShowDetectedLocation] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const {
    loading,
    error: geoError,
    supported,
    locationData,
    locationString,
    hasLocation,
    getCurrentPosition,
    clearLocation
  } = useGeolocation()

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update manual location when value prop changes
  useEffect(() => {
    setManualLocation(value)
  }, [value])

  // Handle manual location input
  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setManualLocation(newValue)
    onChange?.(newValue)
    
    // Clear detected location if user starts typing manually
    if (newValue && hasLocation) {
      setShowDetectedLocation(false)
    }
  }

  // Handle location detection
  const handleDetectLocation = () => {
    getCurrentPosition()
  }

  // Handle using detected location
  const handleUseDetectedLocation = () => {
    if (locationString) {
      setManualLocation(locationString)
      onChange?.(locationString)
      setShowDetectedLocation(false)
      
      // Notify parent about detected location data
      if (locationData && onLocationDetected) {
        onLocationDetected(locationData)
      }
    }
  }

  // Handle clearing location
  const handleClearLocation = () => {
    setManualLocation('')
    onChange?.('')
    clearLocation()
    setShowDetectedLocation(false)
  }

  // Show detected location when available
  useEffect(() => {
    if (hasLocation && locationString && !manualLocation) {
      setShowDetectedLocation(true)
    }
  }, [hasLocation, locationString, manualLocation])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Manual Location Input */}
      <div className="relative">
        <BirthdayInput
          value={manualLocation}
          onChange={handleManualLocationChange}
          placeholder={placeholder}
          error={error || geoError || undefined}
          disabled={disabled || loading}
          variant="birthday"
          sparkle
          className="pr-24"
        />
        
        {/* Location Detection Button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDetectLocation}
            disabled={disabled || loading || (isClient && !supported)}
            className={cn(
              'h-7 px-2 text-xs',
              'hover:bg-primary/10 hover:text-primary',
              'transition-colors duration-200'
            )}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3"
              >
                <AnimatedSparkleIcon size="xs" color="pink" animate={false} />
              </motion.div>
            ) : (
              <span className="flex items-center gap-1">
                📍
                <span className="hidden sm:inline">Detect</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Detected Location Suggestion */}
      <AnimatePresence>
        {showDetectedLocation && locationString && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AnimatedSparkleIcon size="sm" color="pink" intensity="subtle" />
                <div>
                  <p className="text-sm font-medium text-charcoal-black">
                    Location detected
                  </p>
                  <p className="text-xs text-charcoal-black/70">
                    {locationString}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseDetectedLocation}
                  className="h-7 px-3 text-xs bg-white hover:bg-primary/5"
                >
                  Use This
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetectedLocation(false)}
                  className="h-7 px-2 text-xs hover:bg-white/50"
                >
                  ✕
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Status Messages */}
      <AnimatePresence>
        {isClient && !supported && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            <span>ℹ️</span>
            Location detection is not supported by your browser
          </motion.p>
        )}

        {geoError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <span>⚠️</span>
            {geoError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Clear Location Button */}
      {(manualLocation || hasLocation) && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearLocation}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear location
          </Button>
        </div>
      )}

      {/* Helper Text */}
      {!error && !geoError && (
        <p className="text-xs text-muted-foreground">
          You can enter your location manually or click "Detect" to use your current location
        </p>
      )}
    </div>
  )
}
