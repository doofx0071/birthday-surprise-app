// Geocoding utilities for converting locations to coordinates

import type { GeocodeResult, MapMessage, LocationPin, Contributor } from '@/types/map'

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, GeocodeResult>()

// Common location variations and their standardized coordinates
const LOCATION_FALLBACKS: Record<string, GeocodeResult> = {
  'philippines': {
    latitude: 14.5995,
    longitude: 120.9842,
    city: 'Manila',
    country: 'Philippines',
    formatted: 'Manila, Philippines'
  },
  'manila': {
    latitude: 14.5995,
    longitude: 120.9842,
    city: 'Manila',
    country: 'Philippines',
    formatted: 'Manila, Philippines'
  },
  'usa': {
    latitude: 39.8283,
    longitude: -98.5795,
    city: 'Kansas',
    country: 'United States',
    formatted: 'United States'
  },
  'united states': {
    latitude: 39.8283,
    longitude: -98.5795,
    city: 'Kansas',
    country: 'United States',
    formatted: 'United States'
  },
  'uk': {
    latitude: 55.3781,
    longitude: -3.4360,
    city: 'London',
    country: 'United Kingdom',
    formatted: 'United Kingdom'
  },
  'united kingdom': {
    latitude: 55.3781,
    longitude: -3.4360,
    city: 'London',
    country: 'United Kingdom',
    formatted: 'United Kingdom'
  },
  'canada': {
    latitude: 56.1304,
    longitude: -106.3468,
    city: 'Ottawa',
    country: 'Canada',
    formatted: 'Canada'
  },
  'australia': {
    latitude: -25.2744,
    longitude: 133.7751,
    city: 'Canberra',
    country: 'Australia',
    formatted: 'Australia'
  },
  'japan': {
    latitude: 36.2048,
    longitude: 138.2529,
    city: 'Tokyo',
    country: 'Japan',
    formatted: 'Japan'
  },
  'singapore': {
    latitude: 1.3521,
    longitude: 103.8198,
    city: 'Singapore',
    country: 'Singapore',
    formatted: 'Singapore'
  }
}

export const geocodeLocationWithFallback = async (
  location: string
): Promise<GeocodeResult | null> => {
  if (!location) return null

  const normalizedLocation = location.toLowerCase().trim()
  
  // Check cache first
  if (geocodeCache.has(normalizedLocation)) {
    return geocodeCache.get(normalizedLocation)!
  }

  // Check fallbacks for common locations
  if (LOCATION_FALLBACKS[normalizedLocation]) {
    const result = LOCATION_FALLBACKS[normalizedLocation]
    geocodeCache.set(normalizedLocation, result)
    return result
  }

  // Try Mapbox geocoding
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`
    )
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center
      
      const result: GeocodeResult = {
        latitude,
        longitude,
        city: extractCity(feature),
        country: extractCountry(feature),
        formatted: feature.place_name,
      }
      
      // Cache the result
      geocodeCache.set(normalizedLocation, result)
      return result
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error for location:', location, error)
    
    // Try to extract country from location string as last resort
    const countryGuess = guessCountryFromLocation(location)
    if (countryGuess) {
      return countryGuess
    }
    
    return null
  }
}

const extractCity = (feature: any): string => {
  // Try to get city from different context types
  const contexts = feature.context || []
  
  for (const context of contexts) {
    if (context.id.startsWith('place.')) {
      return context.text
    }
  }
  
  // Fallback to first part of place name
  return feature.place_name.split(',')[0]
}

const extractCountry = (feature: any): string => {
  // Try to get country from context
  const contexts = feature.context || []
  
  for (const context of contexts) {
    if (context.id.startsWith('country.')) {
      return context.text
    }
  }
  
  // Fallback to last part of place name
  return feature.place_name.split(',').pop()?.trim() || ''
}

const guessCountryFromLocation = (location: string): GeocodeResult | null => {
  const lowerLocation = location.toLowerCase()
  
  // Simple country detection based on common patterns
  for (const [key, value] of Object.entries(LOCATION_FALLBACKS)) {
    if (lowerLocation.includes(key)) {
      return value
    }
  }
  
  return null
}

export const processMessagesIntoLocationPins = async (
  messages: MapMessage[]
): Promise<LocationPin[]> => {
  const locationGroups = new Map<string, {
    coordinates: [number, number]
    city: string
    country: string
    contributors: Contributor[]
  }>()

  // Process each message
  for (const message of messages) {
    let coordinates: [number, number] | null = null
    let city = message.location_city || ''
    let country = message.location_country || ''

    // Use existing coordinates if available
    if (message.latitude && message.longitude) {
      coordinates = [message.longitude, message.latitude]
    } else {
      // Try to geocode from location fields
      const locationString = message.location_city && message.location_country
        ? `${message.location_city}, ${message.location_country}`
        : message.location_city || message.location_country || ''

      if (locationString) {
        const geocoded = await geocodeLocationWithFallback(locationString)
        if (geocoded) {
          coordinates = [geocoded.longitude, geocoded.latitude]
          city = geocoded.city
          country = geocoded.country
        }
      }
    }

    // Skip messages without valid coordinates
    if (!coordinates) continue

    // Create location key for grouping
    const locationKey = `${coordinates[0]},${coordinates[1]}`

    // Create contributor object
    const contributor: Contributor = {
      id: message.id,
      name: message.name,
      message: message.message,
      messagePreview: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
      submittedAt: message.created_at,
      hasMedia: (message.media_files?.length || 0) > 0
    }

    // Group by location
    if (locationGroups.has(locationKey)) {
      locationGroups.get(locationKey)!.contributors.push(contributor)
    } else {
      locationGroups.set(locationKey, {
        coordinates,
        city,
        country,
        contributors: [contributor]
      })
    }
  }

  // Convert groups to LocationPin objects
  const pins: LocationPin[] = []
  let pinIndex = 0

  for (const [locationKey, group] of locationGroups) {
    pins.push({
      id: `pin-${pinIndex++}`,
      latitude: group.coordinates[1],
      longitude: group.coordinates[0],
      city: group.city,
      country: group.country,
      messageCount: group.contributors.length,
      contributors: group.contributors
    })
  }

  return pins
}

export const updatePinCoordinates = async (
  pin: LocationPin
): Promise<LocationPin> => {
  // If pin already has coordinates, return as is
  if (pin.latitude && pin.longitude) {
    return pin
  }

  // Try to geocode from city/country
  const locationString = pin.city && pin.country
    ? `${pin.city}, ${pin.country}`
    : pin.city || pin.country

  if (locationString) {
    const geocoded = await geocodeLocationWithFallback(locationString)
    if (geocoded) {
      return {
        ...pin,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        city: geocoded.city,
        country: geocoded.country
      }
    }
  }

  return pin
}

// Utility to get country flag emoji
export const getCountryFlag = (countryName: string): string => {
  const countryFlags: Record<string, string> = {
    'philippines': '🇵🇭',
    'united states': '🇺🇸',
    'usa': '🇺🇸',
    'united kingdom': '🇬🇧',
    'uk': '🇬🇧',
    'canada': '🇨🇦',
    'australia': '🇦🇺',
    'japan': '🇯🇵',
    'singapore': '🇸🇬',
    'france': '🇫🇷',
    'germany': '🇩🇪',
    'italy': '🇮🇹',
    'spain': '🇪🇸',
    'brazil': '🇧🇷',
    'mexico': '🇲🇽',
    'india': '🇮🇳',
    'china': '🇨🇳',
    'south korea': '🇰🇷',
    'thailand': '🇹🇭',
    'vietnam': '🇻🇳',
    'indonesia': '🇮🇩',
    'malaysia': '🇲🇾'
  }

  return countryFlags[countryName.toLowerCase()] || '🌍'
}

// Clear geocoding cache (useful for testing)
export const clearGeocodeCache = (): void => {
  geocodeCache.clear()
}

// Get cache size (for debugging)
export const getGeocacheCacheSize = (): number => {
  return geocodeCache.size
}
