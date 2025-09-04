'use client'

import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
  supported: boolean
}

interface LocationData {
  city?: string
  country?: string
  latitude: number
  longitude: number
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
    supported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  })

  const [locationData, setLocationData] = useState<LocationData | null>(null)

  // Force refresh location (ignores cache)
  const forceRefreshLocation = useCallback(() => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0, // Force fresh location, no cache
    }

    console.log('Force refreshing location with no cache...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Force refresh geolocation success:', position)
        const { latitude, longitude, accuracy } = position.coords
        setState(prev => ({
          ...prev,
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
        }))

        // Reverse geocoding to get city and country
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        console.warn('Force refresh geolocation failed:', error)
        let errorMessage = 'Unable to refresh your location'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device location settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please check your internet connection.'
            break
          default:
            errorMessage = 'Location detection failed. Please try again or enter manually.'
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))
      },
      options
    )
  }, [state.supported])

  // Get current position with multiple fallback strategies
  const getCurrentPosition = useCallback(() => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }))
      return
    }

    // Check if we're on HTTPS or localhost (required for geolocation in many browsers)
    const isSecureContext = window.location.protocol === 'https:' ||
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'

    if (!isSecureContext) {
      setState(prev => ({
        ...prev,
        error: 'Location detection requires a secure connection (HTTPS). Please enter your location manually.',
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    // Try with high accuracy first, then fallback to low accuracy
    const tryGeolocation = (highAccuracy: boolean, timeout: number) => {
      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: timeout,
        maximumAge: 60000, // Use cached location for 1 minute for better performance
      }

      console.log(`Attempting geolocation with high accuracy: ${highAccuracy}, timeout: ${timeout}ms`)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position)
          const { latitude, longitude, accuracy } = position.coords
          setState(prev => ({
            ...prev,
            latitude,
            longitude,
            accuracy,
            loading: false,
            error: null,
          }))

          // Reverse geocoding to get city and country
          reverseGeocode(latitude, longitude)
        },
        (error) => {
          console.warn(`Geolocation failed (high accuracy: ${highAccuracy}):`, error)

          // If high accuracy failed, try with low accuracy
          if (highAccuracy) {
            console.log('Retrying with low accuracy...')
            tryGeolocation(false, 3000) // 3 second timeout for low accuracy (faster)
            return
          }

          // If both attempts failed, try IP-based location as last resort
          console.log('Trying IP-based location detection as fallback...')
          tryIPLocation().catch(() => {
            let errorMessage = 'Unable to retrieve your location'

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location permissions in your browser and try again.'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your device location settings and try again, or enter your location manually.'
                break
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please check your internet connection and try again, or enter your location manually.'
                break
              default:
                errorMessage = 'Location detection failed. Please enter your location manually.'
            }

            setState(prev => ({
              ...prev,
              loading: false,
              error: errorMessage,
            }))
          })
        },
        options
      )
    }

    // Start with high accuracy and shorter timeout for better performance
    tryGeolocation(true, 3000)
  }, [state.supported])

  // IP-based location detection as fallback
  const tryIPLocation = async () => {
    try {
      console.log('Attempting IP-based location detection...')

      // Using ipapi.co for IP-based location (free, no API key required)
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'Birthday-Surprise-App/1.0',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('IP location data:', data)

        if (data.latitude && data.longitude) {
          setState(prev => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: null, // IP-based location doesn't have accuracy
            loading: false,
            error: null,
          }))

          // Set location data directly from IP service
          setLocationData({
            city: data.city || 'Unknown City',
            country: data.country_name || 'Unknown Country',
            latitude: data.latitude,
            longitude: data.longitude,
          })

          console.log('IP-based location detection successful')
          return
        }
      }

      throw new Error('IP location service failed')
    } catch (error) {
      console.warn('IP-based location detection failed:', error)
      throw error
    }
  }

  // Reverse geocoding using multiple services for better accuracy
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`)

      // Try multiple zoom levels for better precision
      // Start with high precision (zoom=18) for exact location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`,
        {
          headers: {
            'User-Agent': 'Birthday-Surprise-App/1.0',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const address = data.address || {}

        console.log('Reverse geocoding response:', data)

        // Prioritize more specific location data
        // For Philippines, prioritize municipality/city over province
        let city = 'Unknown City'

        // Try different address components in order of specificity
        if (address.city) {
          city = address.city
        } else if (address.municipality) {
          city = address.municipality
        } else if (address.town) {
          city = address.town
        } else if (address.village) {
          city = address.village
        } else if (address.suburb) {
          city = address.suburb
        } else if (address.neighbourhood) {
          city = address.neighbourhood
        } else if (address.hamlet) {
          city = address.hamlet
        } else if (address.county) {
          // Use county as fallback but try to be more specific
          city = address.county
        } else if (address.state) {
          city = address.state
        }

        // For Philippines specifically, handle administrative levels better
        if (address.country === 'Philippines' || address.country_code === 'ph') {
          // In Philippines: municipality > city > province
          if (address.municipality && address.municipality !== address.state) {
            city = address.municipality
          } else if (address.city && address.city !== address.state) {
            city = address.city
          } else if (address.town && address.town !== address.state) {
            city = address.town
          }
        }

        const locationData = {
          city: city,
          country: address.country || 'Unknown Country',
          latitude: lat,
          longitude: lng,
        }

        console.log('Processed location data:', locationData)
        setLocationData(locationData)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.warn('Primary reverse geocoding failed, trying fallback:', error)

      // Fallback: Try with different zoom level
      try {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Birthday-Surprise-App/1.0',
            },
          }
        )

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          const address = data.address || {}

          setLocationData({
            city: address.municipality || address.city || address.town || address.village || address.county || 'Unknown City',
            country: address.country || 'Unknown Country',
            latitude: lat,
            longitude: lng,
          })
        } else {
          throw new Error('Fallback also failed')
        }
      } catch (fallbackError) {
        console.warn('All reverse geocoding attempts failed:', fallbackError)
        // Still set the coordinates even if reverse geocoding fails
        setLocationData({
          city: 'Unknown City',
          country: 'Unknown Country',
          latitude: lat,
          longitude: lng,
        })
      }
    }
  }

  // Clear location data
  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      loading: false,
      supported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    })
    setLocationData(null)
  }, [])

  // Watch position (for continuous tracking)
  const watchPosition = useCallback(() => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }))
      return null
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setState(prev => ({
          ...prev,
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
        }))
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Unable to watch position',
        }))
      },
      options
    )

    return watchId
  }, [state.supported])

  // Stop watching position
  const stopWatching = useCallback((watchId: number) => {
    if (state.supported && watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [state.supported])

  return {
    ...state,
    locationData,
    getCurrentPosition,
    forceRefreshLocation,
    clearLocation,
    watchPosition,
    stopWatching,
    hasLocation: state.latitude !== null && state.longitude !== null,
    locationString: locationData
      ? `${locationData.city}, ${locationData.country}`
      : null,
  }
}
