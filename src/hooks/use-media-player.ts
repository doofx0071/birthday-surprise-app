'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseMediaPlayerOptions {
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  preload?: 'none' | 'metadata' | 'auto'
}

interface UseMediaPlayerReturn {
  // Video element ref
  videoRef: React.RefObject<HTMLVideoElement | null>
  
  // Playback state
  isPlaying: boolean
  isPaused: boolean
  isEnded: boolean
  isLoading: boolean
  isError: boolean
  
  // Time and duration
  currentTime: number
  duration: number
  progress: number
  buffered: number
  
  // Volume and audio
  volume: number
  isMuted: boolean
  
  // Fullscreen
  isFullscreen: boolean
  
  // Controls
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  seek: (time: number) => void
  seekToProgress: (progress: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  toggleFullscreen: () => Promise<void>
  
  // Utility
  formatTime: (time: number) => string
  reset: () => void
}

export const useMediaPlayer = (options: UseMediaPlayerOptions = {}): UseMediaPlayerReturn => {
  const {
    autoPlay = false,
    loop = false,
    muted = false,
    volume: initialVolume = 1,
    preload = 'metadata',
  } = options

  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [isEnded, setIsEnded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  
  // Time and duration
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  
  // Volume and audio
  const [volume, setVolumeState] = useState(initialVolume)
  const [isMuted, setIsMuted] = useState(muted)
  
  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Calculate progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Format time helper
  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time)) return '0:00'
    
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Playback controls
  const play = useCallback(async (): Promise<void> => {
    if (videoRef.current) {
      try {
        await videoRef.current.play()
      } catch (error) {
        console.error('Error playing video:', error)
        setIsError(true)
      }
    }
  }, [])

  const pause = useCallback((): void => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const togglePlay = useCallback(async (): Promise<void> => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number): void => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration))
    }
  }, [duration])

  const seekToProgress = useCallback((progressPercent: number): void => {
    const time = (progressPercent / 100) * duration
    seek(time)
  }, [duration, seek])

  // Volume controls
  const setVolume = useCallback((newVolume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
    
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume
    }
  }, [])

  const toggleMute = useCallback((): void => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }, [isMuted])

  // Fullscreen controls
  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      try {
        await videoRef.current.requestFullscreen()
      } catch (error) {
        console.error('Error entering fullscreen:', error)
      }
    }
  }, [])

  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error('Error exiting fullscreen:', error)
      }
    }
  }, [])

  const toggleFullscreen = useCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exitFullscreen()
    } else {
      await enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // Reset function
  const reset = useCallback((): void => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      pause()
    }
    setIsEnded(false)
    setIsError(false)
  }, [pause])

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Configure video properties
    video.autoplay = autoPlay
    video.loop = loop
    video.muted = muted
    video.volume = initialVolume
    video.preload = preload

    // Event handlers
    const handleLoadStart = () => setIsLoading(true)
    const handleLoadedData = () => setIsLoading(false)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }
    
    const handlePlay = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setIsEnded(false)
    }
    
    const handlePause = () => {
      setIsPlaying(false)
      setIsPaused(true)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setIsPaused(true)
      setIsEnded(true)
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }
    
    const handleDurationChange = () => {
      setDuration(video.duration)
    }
    
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercent = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercent)
      }
    }
    
    const handleVolumeChange = () => {
      setVolumeState(video.volume)
      setIsMuted(video.muted)
    }
    
    const handleError = () => {
      setIsError(true)
      setIsLoading(false)
    }

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('error', handleError)

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('error', handleError)
    }
  }, [autoPlay, loop, muted, initialVolume, preload])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current || document.activeElement !== videoRef.current) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(currentTime - 10)
          break
        case 'ArrowRight':
          e.preventDefault()
          seek(currentTime + 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case '0':
        case 'Home':
          e.preventDefault()
          seek(0)
          break
        case 'End':
          e.preventDefault()
          seek(duration)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, duration, volume, togglePlay, seek, setVolume, toggleMute, toggleFullscreen])

  return {
    videoRef,
    isPlaying,
    isPaused,
    isEnded,
    isLoading,
    isError,
    currentTime,
    duration,
    progress,
    buffered,
    volume,
    isMuted,
    isFullscreen,
    play,
    pause,
    togglePlay,
    seek,
    seekToProgress,
    setVolume,
    toggleMute,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    formatTime,
    reset,
  }
}
