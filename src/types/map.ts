// Map-related types for the memory map feature

export interface LocationPin {
  id: string
  latitude: number
  longitude: number
  city: string
  country: string
  messageCount: number
  contributors: Contributor[]
}

export interface Contributor {
  id: string
  name: string
  message: string
  messagePreview: string // First 100 characters
  submittedAt: string
  hasMedia: boolean
}

export interface MapMessage {
  id: string
  name: string
  email: string
  message: string
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
  created_at: string
  is_approved: boolean
  is_visible: boolean
  media_files?: MediaFile[]
}

export interface MediaFile {
  id: string
  message_id: string
  file_name: string
  file_type: string
  storage_path: string
  thumbnail_path?: string
}

export interface MapCluster {
  id: string
  latitude: number
  longitude: number
  pointCount: number
  pins: LocationPin[]
}

export interface MapPopupData {
  pin: LocationPin
  position: [number, number] // [longitude, latitude]
  isVisible: boolean
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  bearing?: number
  pitch?: number
}

export interface MapFilters {
  showTextOnly: boolean
  showWithMedia: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  searchLocation?: string
}

export interface GeocodeResult {
  latitude: number
  longitude: number
  city: string
  country: string
  formatted: string
}

export interface MapConfig {
  accessToken: string
  style: string
  initialView: MapViewState
  clusterRadius: number
  clusterMaxZoom: number
  pinSize: {
    small: number
    medium: number
    large: number
  }
  animationDuration: number
}

// Map event types
export interface MapPinClickEvent {
  pin: LocationPin
  coordinates: [number, number]
  originalEvent: MouseEvent
}

export interface MapClusterClickEvent {
  cluster: MapCluster
  coordinates: [number, number]
  originalEvent: MouseEvent
}

export interface MapLoadEvent {
  map: mapboxgl.Map
}

export interface MapMoveEvent {
  viewState: MapViewState
}

// Mapbox GL types (extending the library types)
declare global {
  namespace mapboxgl {
    interface Map {
      // Add any custom methods we might add to the map instance
    }
  }
}

// Pin styling types
export interface PinStyle {
  color: string
  hoverColor: string
  activeColor: string
  size: number
  pulseAnimation: boolean
  shadowColor: string
}

export interface ClusterStyle {
  backgroundColor: string
  textColor: string
  borderColor: string
  borderWidth: number
  fontSize: number
}

// Animation types
export interface PinAnimation {
  type: 'pulse' | 'bounce' | 'fade' | 'scale'
  duration: number
  delay?: number
  repeat?: boolean
}

export interface MapTransition {
  duration: number
  easing: string
}

// Error types
export interface MapError {
  type: 'LOAD_ERROR' | 'GEOCODING_ERROR' | 'DATA_ERROR' | 'PERMISSION_ERROR'
  message: string
  details?: any
}

// Hook return types
export interface UseMapDataReturn {
  pins: LocationPin[]
  clusters: MapCluster[]
  loading: boolean
  error: MapError | null
  refetch: () => void
}

export interface UseMapControlsReturn {
  viewState: MapViewState
  filters: MapFilters
  popup: MapPopupData | null
  setViewState: (viewState: MapViewState) => void
  setFilters: (filters: MapFilters) => void
  showPopup: (data: MapPopupData) => void
  hidePopup: () => void
  flyToLocation: (coordinates: [number, number], zoom?: number) => void
  resetView: () => void
}

// Component prop types
export interface MemoryMapProps {
  className?: string
  height?: string | number
  onPinClick?: (event: MapPinClickEvent) => void
  onClusterClick?: (event: MapClusterClickEvent) => void
  onLoad?: (event: MapLoadEvent) => void
  initialFilters?: Partial<MapFilters>
  showControls?: boolean
  showFilters?: boolean
}

export interface MapPinProps {
  pin: LocationPin
  onClick: (pin: LocationPin) => void
  style?: Partial<PinStyle>
  animation?: PinAnimation
}

export interface LocationPopupProps {
  pin: LocationPin
  onClose: () => void
  onViewAll: (pin: LocationPin) => void
}

export interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onToggleFullscreen: () => void
  className?: string
}
