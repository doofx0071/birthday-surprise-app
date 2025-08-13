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

  // Get current position
  const getCurrentPosition = useCallback(() => {
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
      maximumAge: 300000, // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
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

        // Reverse geocoding to get city and country
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
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

  // Reverse geocoding using a free service
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Birthday-Surprise-App/1.0',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const address = data.address || {}
        
        setLocationData({
          city: address.city || address.town || address.village || address.hamlet || 'Unknown City',
          country: address.country || 'Unknown Country',
          latitude: lat,
          longitude: lng,
        })
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
      // Still set the coordinates even if reverse geocoding fails
      setLocationData({
        city: 'Unknown City',
        country: 'Unknown Country',
        latitude: lat,
        longitude: lng,
      })
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
    clearLocation,
    watchPosition,
    stopWatching,
    hasLocation: state.latitude !== null && state.longitude !== null,
    locationString: locationData 
      ? `${locationData.city}, ${locationData.country}`
      : null,
  }
}
