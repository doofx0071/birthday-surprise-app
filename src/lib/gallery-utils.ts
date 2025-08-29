// Gallery utility functions for the Memory Gallery

import { MessageWithMedia } from '@/types/database'

/**
 * Get the Supabase storage URL for a media file
 */
export const getMediaUrl = (storagePath: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    return ''
  }
  return `${supabaseUrl}/storage/v1/object/public/birthday-media/${storagePath}`
}

/**
 * Get thumbnail URL for a media file, fallback to original if no thumbnail
 */
export const getThumbnailUrl = (file: { storage_path: string; thumbnail_path?: string }): string => {
  if (file.thumbnail_path) {
    return getMediaUrl(file.thumbnail_path)
  }
  return getMediaUrl(file.storage_path)
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date for display in gallery
 */
export const formatGalleryDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays <= 7) {
    return `${diffDays} days ago`
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diffTime / (1000 * 60))
  const hours = Math.floor(diffTime / (1000 * 60 * 60))
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

/**
 * Get location display string from message
 */
export const getLocationDisplay = (message: MessageWithMedia): string => {
  if (message.location_city && message.location_country) {
    return `${message.location_city}, ${message.location_country}`
  }
  return message.location_country || message.location_city || message.location || 'Unknown Location'
}

/**
 * Get message content type based on media files
 */
export const getMessageContentType = (message: MessageWithMedia): 'text' | 'image' | 'video' | 'mixed' => {
  if (!message.media_files || message.media_files.length === 0) {
    return 'text'
  }
  
  const hasImages = message.media_files.some(f => f.file_type === 'image')
  const hasVideos = message.media_files.some(f => f.file_type === 'video')
  
  if (hasImages && hasVideos) {
    return 'mixed'
  } else if (hasImages) {
    return 'image'
  } else if (hasVideos) {
    return 'video'
  }
  
  return 'text'
}

/**
 * Get media statistics for a message
 */
export const getMediaStats = (message: MessageWithMedia) => {
  const mediaFiles = message.media_files || []
  
  return {
    total: mediaFiles.length,
    images: mediaFiles.filter(f => f.file_type === 'image').length,
    videos: mediaFiles.filter(f => f.file_type === 'video').length,
    totalSize: mediaFiles.reduce((sum, f) => sum + (f.file_size || 0), 0),
  }
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Extract keywords from message text for search
 */
export const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10) // Limit to 10 keywords
}

/**
 * Check if a message matches search criteria
 */
export const matchesSearch = (message: MessageWithMedia, searchQuery: string): boolean => {
  if (!searchQuery.trim()) return true
  
  const query = searchQuery.toLowerCase()
  const searchableText = [
    message.name,
    message.message,
    message.location_city,
    message.location_country,
    message.location,
  ].filter(Boolean).join(' ').toLowerCase()
  
  return searchableText.includes(query)
}

/**
 * Sort messages by different criteria
 */
export const sortMessages = (
  messages: MessageWithMedia[],
  sortBy: 'newest' | 'oldest' | 'location' | 'length' | 'random'
): MessageWithMedia[] => {
  const sorted = [...messages]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    case 'location':
      return sorted.sort((a, b) => {
        const locationA = getLocationDisplay(a)
        const locationB = getLocationDisplay(b)
        return locationA.localeCompare(locationB)
      })
    
    case 'length':
      return sorted.sort((a, b) => b.message.length - a.message.length)
    
    case 'random':
      return sorted.sort(() => Math.random() - 0.5)
    
    default:
      return sorted
  }
}

/**
 * Filter messages by content type
 */
export const filterByContentType = (
  messages: MessageWithMedia[],
  contentType: 'all' | 'text' | 'image' | 'video' | 'mixed'
): MessageWithMedia[] => {
  if (contentType === 'all') return messages
  
  return messages.filter(message => {
    const messageType = getMessageContentType(message)
    return messageType === contentType
  })
}

/**
 * Filter messages by date range
 */
export const filterByDateRange = (
  messages: MessageWithMedia[],
  dateRange: 'all' | 'week' | 'month' | 'year'
): MessageWithMedia[] => {
  if (dateRange === 'all') return messages
  
  const now = new Date()
  const cutoffDate = new Date()
  
  switch (dateRange) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return messages.filter(message => new Date(message.created_at) >= cutoffDate)
}

/**
 * Filter messages by location
 */
export const filterByLocation = (
  messages: MessageWithMedia[],
  locationQuery: string
): MessageWithMedia[] => {
  if (!locationQuery.trim()) return messages
  
  const query = locationQuery.toLowerCase()
  
  return messages.filter(message => {
    const location = getLocationDisplay(message).toLowerCase()
    return location.includes(query)
  })
}

/**
 * Get unique locations from messages
 */
export const getUniqueLocations = (messages: MessageWithMedia[]): string[] => {
  const locations = new Set<string>()
  
  messages.forEach(message => {
    const location = getLocationDisplay(message)
    if (location !== 'Unknown Location') {
      locations.add(location)
    }
  })
  
  return Array.from(locations).sort()
}

/**
 * Get unique countries from messages
 */
export const getUniqueCountries = (messages: MessageWithMedia[]): string[] => {
  const countries = new Set<string>()
  
  messages.forEach(message => {
    if (message.location_country) {
      countries.add(message.location_country)
    }
  })
  
  return Array.from(countries).sort()
}

/**
 * Calculate gallery statistics
 */
export const calculateGalleryStats = (messages: MessageWithMedia[]) => {
  const totalMessages = messages.length
  const totalMedia = messages.reduce((sum, msg) => sum + (msg.media_files?.length || 0), 0)
  const totalImages = messages.reduce((sum, msg) => 
    sum + (msg.media_files?.filter(f => f.file_type === 'image').length || 0), 0
  )
  const totalVideos = messages.reduce((sum, msg) => 
    sum + (msg.media_files?.filter(f => f.file_type === 'video').length || 0), 0
  )
  const uniqueCountries = getUniqueCountries(messages).length
  const uniqueContributors = new Set(messages.map(m => m.email)).size
  
  return {
    totalMessages,
    totalMedia,
    totalImages,
    totalVideos,
    uniqueCountries,
    uniqueContributors,
    averageMessageLength: totalMessages > 0 
      ? Math.round(messages.reduce((sum, msg) => sum + msg.message.length, 0) / totalMessages)
      : 0,
  }
}
