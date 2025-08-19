'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchIcon, XIcon, ClockIcon } from 'lucide-react'

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
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gallery-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Save search to recent searches
  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) return

    const updated = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5) // Keep only 5 recent searches

    setRecentSearches(updated)
    localStorage.setItem('gallery-recent-searches', JSON.stringify(updated))
  }

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Show suggestions when typing
    if (newValue.length > 0 && recentSearches.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle search submission
  const handleSearch = (searchTerm: string = value) => {
    if (searchTerm.trim()) {
      saveSearch(searchTerm.trim())
      onChange(searchTerm.trim())
    }
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  // Clear search
  const clearSearch = () => {
    onChange('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('gallery-recent-searches')
    setShowSuggestions(false)
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter recent searches based on current input
  const filteredRecentSearches = recentSearches.filter(search =>
    search.toLowerCase().includes(value.toLowerCase()) && search !== value
  )

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-black/40" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => {
            setIsFocused(true)
            if (recentSearches.length > 0 && !value) {
              setShowSuggestions(true)
            }
          }}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pl-10 pr-10 transition-all duration-200',
            isFocused && 'ring-2 ring-primary/20 border-primary/30'
          )}
        />
        
        {/* Clear Button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (filteredRecentSearches.length > 0 || (!value && recentSearches.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Recent Searches Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-3 w-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">Recent Searches</span>
              </div>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Recent Search Items */}
            <div className="max-h-48 overflow-y-auto">
              {(value ? filteredRecentSearches : recentSearches).map((search, index) => (
                <motion.button
                  key={search}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSearch(search)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2"
                >
                  <SearchIcon className="h-3 w-3 text-gray-400" />
                  <span>{search}</span>
                </motion.button>
              ))}
            </div>

            {/* No Recent Searches */}
            {recentSearches.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No recent searches
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Hints */}
      {isFocused && !value && recentSearches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
        >
          <div className="text-xs text-gray-500 space-y-1">
            <div className="font-medium mb-2">Search tips:</div>
            <div>• Search by name: "John", "Sarah"</div>
            <div>• Search by location: "New York", "London"</div>
            <div>• Search message content: "birthday", "love"</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
