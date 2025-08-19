'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  XIcon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  DownloadIcon, 
  PlayIcon, 
  PauseIcon,
  VolumeXIcon,
  Volume2Icon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-react'
import Image from 'next/image'

interface MediaLightboxProps {
  media: {
    url: string
    type: 'image' | 'video'
    title?: string
  } | null
  onClose: () => void
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset state when media changes
  useEffect(() => {
    if (media) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setIsDragging(false)
      setIsPlaying(false)
      setImageError(false)
    }
  }, [media])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!media) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          e.preventDefault()
          resetZoom()
          break
        case ' ':
          if (media.type === 'video') {
            e.preventDefault()
            togglePlay()
          }
          break
        case 'm':
          if (media.type === 'video') {
            e.preventDefault()
            toggleMute()
          }
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
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
  }, [media, isPlaying, isMuted])

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5))
  }

  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Download handler
  const handleDownload = async () => {
    if (!media) return

    try {
      const response = await fetch(media.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.title || `birthday-memory.${media.type === 'image' ? 'jpg' : 'mp4'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (!media) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            {media.title && (
              <h3 className="text-white font-medium text-lg">{media.title}</h3>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {media.type === 'image' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomOut()
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOutIcon className="h-4 w-4" />
                </Button>
                
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              className="text-white hover:bg-white/20"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleFullscreen()
              }}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <MinimizeIcon className="h-4 w-4" />
              ) : (
                <MaximizeIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Media Content */}
        <div
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {media.type === 'image' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: 'center',
              }}
            >
              {!imageError ? (
                <Image
                  ref={imageRef}
                  src={media.url}
                  alt={media.title || 'Birthday memory'}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                  onDoubleClick={zoom === 1 ? handleZoomIn : resetZoom}
                />
              ) : (
                <div className="w-96 h-96 bg-gray-800 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p>Failed to load image</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <video
                ref={videoRef}
                src={media.url}
                className="max-w-full max-h-full"
                controls={false}
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeXIcon className="h-4 w-4" />
                    ) : (
                      <Volume2Icon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 left-4 text-white/70 text-xs space-y-1">
          <div>ESC: Close • +/-: Zoom • 0: Reset</div>
          {media.type === 'video' && (
            <div>Space: Play/Pause • M: Mute • F: Fullscreen</div>
          )}
          {media.type === 'image' && (
            <div>Double-click: Zoom • Drag: Pan when zoomed</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
