'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchIcon, XIcon } from 'lucide-react'

interface GallerySearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const GallerySearch: React.FC<GallerySearchProps> = ({
  value,
  onChange,
  placeholder = "Search messages, names, or locations...",
  className
}) => {
  const [localValue, setLocalValue] = useState(value)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative neuro-card p-1 rounded-lg',
        className
      )}
    >
      <div className="relative">
        {/* Search Icon */}
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-500" />

        {/* Search Input */}
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 py-2 w-full font-body neuro-input",
            "border-pink-200 focus:border-pink-400 focus:ring-pink-200",
            "placeholder:text-charcoal-black/50 bg-white/80"
          )}
        />

        {/* Clear Button */}
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0
                      neuro-button-hover hover:bg-pink-50 rounded-full"
          >
            <XIcon className="w-4 h-4 text-pink-500" />
          </Button>
        )}
      </div>

      {/* Search Results Count */}
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2"
        >
          <p className="text-xs text-gray-500">
            Searching for "{value}"
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
