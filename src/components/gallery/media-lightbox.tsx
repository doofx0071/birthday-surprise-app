'use client'

import React, { useEffect, useState, useRef } from 'react'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  title?: string
  id: string
}

interface MediaLightboxProps {
  media: MediaItem | null
  mediaList?: MediaItem[]
  currentIndex?: number
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  mediaList = [],
  currentIndex = 0,
  onClose,
  onNavigate
}) => {
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Check if navigation is available
  const hasMultipleMedia = mediaList.length > 1
  const canGoPrev = hasMultipleMedia && currentIndex > 0
  const canGoNext = hasMultipleMedia && currentIndex < mediaList.length - 1

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!media) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (canGoPrev && onNavigate) {
            e.preventDefault()
            onNavigate('prev')
          }
          break
        case 'ArrowRight':
          if (canGoNext && onNavigate) {
            e.preventDefault()
            onNavigate('next')
          }
          break
      }
    }

    if (media) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [media, onClose, onNavigate, canGoPrev, canGoNext])

  // Handle download
  const handleDownload = async () => {
    if (!media) return

    try {
      const response = await fetch(media.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.title || `media-${Date.now()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  // Don't render on server side
  if (!mounted) return null

  // Don't render if no media
  if (!media) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleMedia && onNavigate && (
        <>
          {/* Previous Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate('prev')
            }}
            disabled={!canGoPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Next Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate('next')
            }}
            disabled={!canGoNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Title and Counter */}
      <div className="absolute top-4 left-4 z-10">
        {media?.title && (
          <h3 className="text-white text-lg font-semibold mb-1">
            {media.title}
          </h3>
        )}
        {hasMultipleMedia && (
          <div className="text-white/70 text-sm bg-black/30 rounded px-2 py-1 backdrop-blur-sm">
            {currentIndex + 1} of {mediaList.length}
          </div>
        )}
      </div>

      {/* Media Content */}
      <div
        className="relative flex items-center justify-center w-full h-full p-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 2rem)'
        }}
      >
        {media.type === 'image' ? (
          <div className="relative flex items-center justify-center w-full h-full">
            <Image
              src={media.url}
              alt={media.title || 'Media'}
              width={1200}
              height={800}
              className="object-contain"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              priority
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={media.url}
            controls
            autoPlay
            className="rounded-lg"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto'
            }}
            onLoadedData={() => {
              // Auto-play when loaded
              if (videoRef.current) {
                videoRef.current.play().catch(console.error)
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-white/70 text-sm text-center bg-black/30 rounded px-3 py-1 backdrop-blur-sm">
          {hasMultipleMedia
            ? 'Use ← → arrow keys to navigate • ESC or click outside to close'
            : 'Press ESC or click outside to close'
          }
        </p>
      </div>
    </div>
  )
}
