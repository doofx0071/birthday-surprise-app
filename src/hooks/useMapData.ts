// Hook for managing map data and real-time updates

import { useState, useEffect, useCallback } from 'react'
import { messageOperations } from '@/lib/supabase'
import { processMessagesIntoLocationPins } from '@/lib/geocoding'
import type { 
  LocationPin, 
  MapCluster, 
  MapError, 
  UseMapDataReturn,
  MapMessage 
} from '@/types/map'

export const useMapData = (): UseMapDataReturn => {
  const [pins, setPins] = useState<LocationPin[]>([])
  const [clusters, setClusters] = useState<MapCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<MapError | null>(null)

  // Fetch and process map data
  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get approved messages from database
      const messages = await messageOperations.getApproved()
      
      // Convert messages to map format
      const mapMessages: MapMessage[] = messages.map(msg => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        message: msg.message,
        location_city: msg.location_city,
        location_country: msg.location_country,
        latitude: msg.latitude,
        longitude: msg.longitude,
        created_at: msg.created_at,
        is_approved: msg.is_approved,
        is_visible: msg.is_visible,
        media_files: [] // Will be populated if needed
      }))

      // Process messages into location pins
      const locationPins = await processMessagesIntoLocationPins(mapMessages)
      
      setPins(locationPins)
      
      // Generate clusters (simple clustering for now)
      const mapClusters = generateClusters(locationPins)
      setClusters(mapClusters)

    } catch (err) {
      console.error('Error fetching map data:', err)
      setError({
        type: 'DATA_ERROR',
        message: 'Failed to load map data',
        details: err
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate simple clusters based on proximity
  const generateClusters = (pins: LocationPin[]): MapCluster[] => {
    const clusters: MapCluster[] = []
    const clusterRadius = 1 // degrees (roughly 111km)
    const processedPins = new Set<string>()

    pins.forEach(pin => {
      if (processedPins.has(pin.id)) return

      const nearbyPins = pins.filter(otherPin => {
        if (processedPins.has(otherPin.id) || otherPin.id === pin.id) return false
        
        const distance = calculateDistance(
          pin.latitude, pin.longitude,
          otherPin.latitude, otherPin.longitude
        )
        
        return distance <= clusterRadius
      })

      if (nearbyPins.length > 0) {
        // Create cluster
        const allPins = [pin, ...nearbyPins]
        const centerLat = allPins.reduce((sum, p) => sum + p.latitude, 0) / allPins.length
        const centerLng = allPins.reduce((sum, p) => sum + p.longitude, 0) / allPins.length
        
        clusters.push({
          id: `cluster-${clusters.length}`,
          latitude: centerLat,
          longitude: centerLng,
          pointCount: allPins.length,
          pins: allPins
        })

        // Mark pins as processed
        allPins.forEach(p => processedPins.add(p.id))
      } else {
        // Single pin
        processedPins.add(pin.id)
      }
    })

    return clusters
  }

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Set up real-time subscriptions
  useEffect(() => {
    // Initial data fetch
    fetchMapData()

    // Set up real-time subscription for new messages
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const subscription = supabase
      .channel('map-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'is_approved=eq.true'
        },
        async (payload: any) => {
          console.log('New message received for map:', payload.new)
          
          // Process the new message
          const newMessage: MapMessage = {
            id: payload.new.id,
            name: payload.new.name,
            email: payload.new.email,
            message: payload.new.message,
            location_city: payload.new.location_city,
            location_country: payload.new.location_country,
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
            created_at: payload.new.created_at,
            is_approved: payload.new.is_approved,
            is_visible: payload.new.is_visible,
            media_files: []
          }

          // Convert to location pins and update state
          const newPins = await processMessagesIntoLocationPins([newMessage])
          
          if (newPins.length > 0) {
            setPins(prevPins => {
              const updatedPins = [...prevPins]

              // Check if we need to merge with existing pin at same location
              const existingPinIndex = updatedPins.findIndex(pin =>
                Math.abs(pin.latitude - newPins[0].latitude) < 0.001 &&
                Math.abs(pin.longitude - newPins[0].longitude) < 0.001
              )

              if (existingPinIndex >= 0) {
                // Merge with existing pin
                updatedPins[existingPinIndex] = {
                  ...updatedPins[existingPinIndex],
                  messageCount: updatedPins[existingPinIndex].messageCount + 1,
                  contributors: [
                    ...updatedPins[existingPinIndex].contributors,
                    ...newPins[0].contributors
                  ]
                }
              } else {
                // Add new pin
                updatedPins.push(newPins[0])
              }

              // Update clusters with the new pins
              setClusters(generateClusters(updatedPins))

              return updatedPins
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          console.log('Message updated for map:', payload.new)
          // Refetch data if approval status changed
          if (payload.old.is_approved !== payload.new.is_approved ||
              payload.old.is_visible !== payload.new.is_visible) {
            fetchMapData()
          }
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchMapData])

  // Refetch function
  const refetch = useCallback(() => {
    fetchMapData()
  }, [fetchMapData])

  return {
    pins,
    clusters,
    loading,
    error,
    refetch
  }
}

// Hook for managing map controls and interactions
export const useMapControls = () => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2
  })
  
  const [filters, setFilters] = useState({
    showTextOnly: true,
    showWithMedia: true
  })
  
  const [popup, setPopup] = useState<any>(null)

  const showPopup = useCallback((data: any) => {
    setPopup(data)
  }, [])

  const hidePopup = useCallback(() => {
    setPopup(null)
  }, [])

  const flyToLocation = useCallback((coordinates: [number, number], zoom = 10) => {
    setViewState({
      longitude: coordinates[0],
      latitude: coordinates[1],
      zoom
    })
  }, [])

  const resetView = useCallback(() => {
    setViewState({
      longitude: 0,
      latitude: 20,
      zoom: 2
    })
  }, [])

  return {
    viewState,
    filters,
    popup,
    setViewState,
    setFilters,
    showPopup,
    hidePopup,
    flyToLocation,
    resetView
  }
}
