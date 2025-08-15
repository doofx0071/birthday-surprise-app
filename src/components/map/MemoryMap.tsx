'use client'

import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMapData, useMapControls } from '@/hooks/useMapData'
import { createMapInstance, createHeartPinElement, addPulseAnimation } from '@/lib/mapbox'
import { LocationPopup } from './LocationPopup'
import { MapControls } from './MapControls'
import type { MemoryMapProps, LocationPin, MapPinClickEvent } from '@/types/map'

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css'

export const MemoryMap: React.FC<MemoryMapProps> = ({
  className = '',
  height = '500px',
  onPinClick,
  onLoad,
  showControls = true,
  showFilters = true,
  initialFilters
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  
  const { pins, loading, error, refetch } = useMapData()
  const { 
    viewState, 
    filters, 
    popup, 
    setViewState, 
    setFilters, 
    showPopup, 
    hidePopup,
    flyToLocation,
    resetView 
  } = useMapControls()

  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      map.current = createMapInstance(mapContainer.current)

      map.current.on('load', () => {
        setIsMapLoaded(true)
        onLoad?.({ map: map.current! })
      })

      // Remove the problematic move event listener that causes infinite loop
      // We'll handle view state updates differently

    } catch (err) {
      console.error('Error initializing map:', err)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onLoad]) // Removed setViewState from dependencies

  // Update map view when viewState changes (but prevent infinite loop)
  useEffect(() => {
    if (map.current && isMapLoaded) {
      // Only update if the viewState is significantly different to prevent loops
      const currentCenter = map.current.getCenter()
      const currentZoom = map.current.getZoom()

      const centerDiff = Math.abs(currentCenter.lng - viewState.longitude) + Math.abs(currentCenter.lat - viewState.latitude)
      const zoomDiff = Math.abs(currentZoom - viewState.zoom)

      // Only update if there's a significant difference (threshold to prevent micro-movements)
      if (centerDiff > 0.01 || zoomDiff > 0.1) {
        map.current.flyTo({
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          duration: 1000
        })
      }
    }
  }, [viewState, isMapLoaded])

  // Add pins to map
  useEffect(() => {
    if (!map.current || !isMapLoaded || loading) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Filter pins based on current filters
    const filteredPins = pins.filter(pin => {
      if (!filters.showTextOnly && !pin.contributors.some(c => c.hasMedia)) return false
      if (!filters.showWithMedia && pin.contributors.some(c => c.hasMedia)) return false
      return true
    })

    // Add new markers
    filteredPins.forEach(pin => {
      const pinElement = createHeartPinElement(
        pin.messageCount > 1 ? 35 : 30,
        pin.messageCount > 1 ? '#FF69B4' : '#FFB6C1',
        pin.messageCount > 1 ? pin.messageCount : undefined
      )

      // Disable pulse animation to ensure click stability
      // TODO: Implement non-interfering animation in future iteration
      // addPulseAnimation(pinElement)

      // Create marker
      const marker = new mapboxgl.Marker(pinElement)
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map.current!)

      // Add click handler
      pinElement.addEventListener('click', (e) => {
        e.stopPropagation()

        const clickEvent: MapPinClickEvent = {
          pin,
          coordinates: [pin.longitude, pin.latitude],
          originalEvent: e as MouseEvent
        }

        // Show popup
        showPopup({
          pin,
          position: [pin.longitude, pin.latitude],
          isVisible: true
        })

        // Call external handler
        onPinClick?.(clickEvent)

        // Fly to pin location using direct map method to avoid dependency issues
        if (map.current) {
          map.current.flyTo({
            center: [pin.longitude, pin.latitude],
            zoom: 8,
            duration: 1000
          })
        }
      })

      markers.current.push(marker)
    })

  }, [pins, filters, isMapLoaded, loading, showPopup, onPinClick]) // Removed flyToLocation dependency

  // Apply initial filters (only once on mount)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prevFilters => ({ ...prevFilters, ...initialFilters }))
    }
  }, [initialFilters, setFilters])

  // Handle map click to hide popup
  useEffect(() => {
    if (!map.current) return

    const handleMapClick = () => {
      hidePopup()
    }

    map.current.on('click', handleMapClick)

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick)
      }
    }
  }, [hidePopup])

  if (error) {
    return (
      <div className={`memory-map-error ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Failed to load map</div>
            <div className="text-gray-600 text-sm mb-4">{error.message}</div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`memory-map-container relative ${className}`} style={{ height }}>
      {/* Map container */}
      <div
        ref={mapContainer}
        className="memory-map w-full h-full rounded-lg overflow-hidden"
        style={{ height }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading memories...</div>
          </div>
        </div>
      )}

      {/* Map controls */}
      {showControls && isMapLoaded && (
        <MapControls
          onZoomIn={() => map.current?.zoomIn()}
          onZoomOut={() => map.current?.zoomOut()}
          onResetView={resetView}
          onToggleFullscreen={() => {
            if (map.current) {
              const fullscreenControl = map.current._controls.find(
                (control: any) => control instanceof mapboxgl.FullscreenControl
              )
              if (fullscreenControl) {
                fullscreenControl._onClickFullscreen()
              }
            }
          }}
          className="absolute top-4 right-4 z-20"
        />
      )}

      {/* Filters */}
      {showFilters && isMapLoaded && (
        <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Show Messages</div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showTextOnly}
                onChange={(e) => setFilters({ ...filters, showTextOnly: e.target.checked })}
                className="mr-2 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-600">Text only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showWithMedia}
                onChange={(e) => setFilters({ ...filters, showWithMedia: e.target.checked })}
                className="mr-2 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-600">With photos/videos</span>
            </label>
          </div>
        </div>
      )}

      {/* Location popup */}
      {popup && (
        <LocationPopup
          pin={popup.pin}
          onClose={hidePopup}
          onViewAll={(pin) => {
            console.log('View all messages for:', pin)
            // This could navigate to a detailed view
          }}
        />
      )}

      {/* Stats overlay */}
      {isMapLoaded && !loading && (
        <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-600">
            <div className="font-medium text-pink-600">{pins.length} locations</div>
            <div>{pins.reduce((sum, pin) => sum + pin.messageCount, 0)} messages</div>
          </div>
        </div>
      )}
    </div>
  )
}
