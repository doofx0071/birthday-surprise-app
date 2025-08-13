// Mapbox GL JS configuration and utilities

import mapboxgl from 'mapbox-gl'
import type { MapConfig, MapViewState, GeocodeResult } from '@/types/map'

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

// Default map configuration
export const DEFAULT_MAP_CONFIG: MapConfig = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  style: 'mapbox://styles/mapbox/light-v11',
  initialView: {
    longitude: 0,
    latitude: 20,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  },
  clusterRadius: 50,
  clusterMaxZoom: 14,
  pinSize: {
    small: 20,
    medium: 30,
    large: 40,
  },
  animationDuration: 1000,
}

// Custom map style with birthday theme colors
export const BIRTHDAY_MAP_STYLE = {
  version: 8,
  name: 'Birthday Map',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f8f9fa', // Light background
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#e3f2fd', // Soft blue for water
      },
    },
    {
      id: 'land',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': '#ffffff', // White for land
      },
    },
    {
      id: 'country-boundaries',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'admin',
      filter: ['==', 'admin_level', 0],
      paint: {
        'line-color': '#e0e0e0', // Subtle borders
        'line-width': 1,
      },
    },
  ],
}

// Pin styling constants
export const PIN_STYLES = {
  default: {
    color: '#FFB6C1', // Light pink
    hoverColor: '#E8B4B8', // Rose gold
    activeColor: '#FF69B4', // Hot pink
    size: 30,
    pulseAnimation: true,
    shadowColor: 'rgba(255, 182, 193, 0.4)',
  },
  cluster: {
    backgroundColor: '#FF69B4',
    textColor: '#ffffff',
    borderColor: '#ffffff',
    borderWidth: 2,
    fontSize: 14,
  },
}

// Animation configurations
export const ANIMATIONS = {
  pinPulse: {
    duration: 2000,
    repeat: true,
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.2)', opacity: 0.7 },
      { transform: 'scale(1)', opacity: 1 },
    ],
  },
  pinHover: {
    duration: 200,
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
    ],
  },
  mapTransition: {
    duration: 1000,
    easing: 'ease-in-out',
  },
}

// Utility functions
export const createMapInstance = (
  container: string | HTMLElement,
  config: Partial<MapConfig> = {}
): mapboxgl.Map => {
  const finalConfig = { ...DEFAULT_MAP_CONFIG, ...config }
  
  const map = new mapboxgl.Map({
    container,
    style: finalConfig.style,
    center: [finalConfig.initialView.longitude, finalConfig.initialView.latitude],
    zoom: finalConfig.initialView.zoom,
    bearing: finalConfig.initialView.bearing,
    pitch: finalConfig.initialView.pitch,
    projection: { name: 'globe' },
    antialias: true,
  })

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  
  // Add fullscreen control
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

  return map
}

export const flyToLocation = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  zoom: number = 10,
  duration: number = 1000
): void => {
  map.flyTo({
    center: coordinates,
    zoom,
    duration,
    essential: true,
  })
}

export const resetMapView = (
  map: mapboxgl.Map,
  config: MapConfig = DEFAULT_MAP_CONFIG
): void => {
  map.flyTo({
    center: [config.initialView.longitude, config.initialView.latitude],
    zoom: config.initialView.zoom,
    bearing: config.initialView.bearing,
    pitch: config.initialView.pitch,
    duration: config.animationDuration,
    essential: true,
  })
}

export const createHeartPinElement = (
  size: number = 30,
  color: string = PIN_STYLES.default.color,
  count?: number
): HTMLElement => {
  const el = document.createElement('div')
  el.className = 'map-pin'
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease;
  `

  // Create heart shape using CSS
  const heart = document.createElement('div')
  heart.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    position: relative;
    transform: rotate(-45deg);
    background: ${color};
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    box-shadow: 0 2px 8px ${PIN_STYLES.default.shadowColor};
  `

  // Add pseudo-elements for heart shape
  const before = document.createElement('div')
  before.style.cssText = `
    content: '';
    width: ${size}px;
    height: ${size}px;
    position: absolute;
    left: ${size / 2}px;
    top: -${size / 2}px;
    background: ${color};
    border-radius: 50%;
    transform: rotate(-45deg);
    transform-origin: 0 100%;
  `

  const after = document.createElement('div')
  after.style.cssText = `
    content: '';
    width: ${size}px;
    height: ${size}px;
    position: absolute;
    left: -${size / 2}px;
    top: 0;
    background: ${color};
    border-radius: 50%;
    transform: rotate(-45deg);
    transform-origin: 100% 100%;
  `

  heart.appendChild(before)
  heart.appendChild(after)

  // Add count for clusters
  if (count && count > 1) {
    const countEl = document.createElement('div')
    countEl.textContent = count.toString()
    countEl.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      color: white;
      font-size: ${size * 0.4}px;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      z-index: 1;
    `
    heart.appendChild(countEl)
  }

  el.appendChild(heart)

  // Add hover effects
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.1)'
  })

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)'
  })

  return el
}

export const addPulseAnimation = (element: HTMLElement): void => {
  element.style.animation = 'pulse 2s infinite'
  
  // Add CSS keyframes if not already added
  if (!document.querySelector('#map-pin-styles')) {
    const style = document.createElement('style')
    style.id = 'map-pin-styles'
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .map-pin:hover {
        transform: scale(1.1) !important;
        transition: transform 0.2s ease;
      }
    `
    document.head.appendChild(style)
  }
}

// Geocoding utilities (using Mapbox Geocoding API)
export const geocodeLocation = async (
  location: string
): Promise<GeocodeResult | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${mapboxgl.accessToken}&limit=1`
    )
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center
      
      return {
        latitude,
        longitude,
        city: feature.place_name.split(',')[0],
        country: feature.place_name.split(',').pop()?.trim() || '',
        formatted: feature.place_name,
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Reverse geocoding
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&limit=1`
    )
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      
      return {
        latitude,
        longitude,
        city: feature.place_name.split(',')[0],
        country: feature.place_name.split(',').pop()?.trim() || '',
        formatted: feature.place_name,
      }
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
