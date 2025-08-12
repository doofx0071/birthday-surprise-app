/**
 * Birthday Surprise Design System - Birthday Icons
 * 
 * Custom SVG icons designed specifically for the birthday surprise application.
 * All icons follow the birthday theme with hearts, sparkles, and celebration elements.
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Base icon props interface
interface IconProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'current' | 'pink' | 'roseGold' | 'white' | 'charcoal'
}

// Size mappings
const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

// Color mappings
const colorClasses = {
  current: 'text-current',
  pink: 'text-soft-pink',
  roseGold: 'text-rose-gold',
  white: 'text-white',
  charcoal: 'text-charcoal-black',
}

// Heart Icon (various styles)
export const HeartIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

// Heart Outline Icon
export const HeartOutlineIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
  </svg>
)

// Sparkle Icon
export const SparkleIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0l2.4 7.2L22 9.6l-7.6 2.4L12 19.2l-2.4-7.2L2 9.6l7.6-2.4L12 0z"/>
    <path d="M19 3l1.2 3.6L24 8.4l-3.8 1.2L19 13.2l-1.2-3.6L14 8.4l3.8-1.2L19 3z"/>
    <path d="M5 14l0.8 2.4L8 17.6l-2.2 0.8L5 21.2l-0.8-2.4L2 17.6l2.2-0.8L5 14z"/>
  </svg>
)

// Birthday Cake Icon
export const CakeIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.89 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9H6l-1.24 2.48c-.17.33-.26.69-.26 1.06C4.5 14.37 5.63 15.5 7.46 15.5c.8 0 1.54-.29 2.12-.87l1.42-1.42 1.42 1.42c.58.58 1.32.87 2.12.87 1.83 0 2.96-1.13 2.96-2.96 0-.37-.09-.73-.26-1.06L18 9z"/>
  </svg>
)

// Gift Icon
export const GiftIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="20,12 20,22 4,22 4,12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="m5,7 0,0c0,-1.1 0.9,-2 2,-2h2c0,0 0,0 0,0s-1.34,-2 -2,-2c-1.66,0 -3,1.34 -3,3z"/>
    <path d="m19,7 0,0c0,-1.1 -0.9,-2 -2,-2h-2c0,0 0,0 0,0s1.34,-2 2,-2c1.66,0 3,1.34 3,3z"/>
  </svg>
)

// Balloon Icon
export const BalloonIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 4 6 5 8.5.5 1.25 1 2.5 2 2.5s1.5-1.25 2-2.5c1-2.5 5-3.25 5-8.5 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.88-2.88 3.19-4 5.5-.38.81-.62 1.5-1 1.5s-.62-.69-1-1.5C9.88 12.19 7 11.88 7 9c0-2.76 2.24-5 5-5z"/>
    <circle cx="9.5" cy="7.5" r="1.5" fill="rgba(255,255,255,0.3)"/>
    <path d="M12 20v2l-1 1h2l-1-1v-2z"/>
  </svg>
)

// Party Hat Icon
export const PartyHatIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l8 18H4l8-18z"/>
    <circle cx="12" cy="2" r="1"/>
    <circle cx="8" cy="12" r="0.5"/>
    <circle cx="16" cy="14" r="0.5"/>
    <circle cx="10" cy="16" r="0.5"/>
    <circle cx="14" cy="10" r="0.5"/>
    <path d="M4 20h16v1c0 0.55-0.45 1-1 1H5c-0.55 0-1-0.45-1-1v-1z"/>
  </svg>
)

// Confetti Icon
export const ConfettiIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="2" height="2" transform="rotate(45 4 4)"/>
    <rect x="7" y="1" width="1" height="3" transform="rotate(30 7.5 2.5)"/>
    <circle cx="12" cy="4" r="1"/>
    <rect x="17" y="2" width="2" height="2" transform="rotate(45 18 3)"/>
    <circle cx="20" cy="7" r="0.5"/>
    <rect x="1" y="8" width="3" height="1" transform="rotate(60 2.5 8.5)"/>
    <circle cx="6" cy="10" r="1"/>
    <rect x="15" y="9" width="2" height="2" transform="rotate(45 16 10)"/>
    <circle cx="21" cy="12" r="1"/>
    <rect x="2" y="14" width="2" height="2" transform="rotate(45 3 15)"/>
    <circle cx="8" cy="16" r="0.5"/>
    <rect x="13" y="15" width="1" height="3" transform="rotate(30 13.5 16.5)"/>
    <circle cx="18" cy="17" r="1"/>
    <rect x="5" y="19" width="2" height="2" transform="rotate(45 6 20)"/>
    <circle cx="11" cy="21" r="0.5"/>
    <rect x="16" y="20" width="3" height="1" transform="rotate(60 17.5 20.5)"/>
  </svg>
)

// Message Icon
export const MessageIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
)

// Calendar Icon
export const CalendarIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="12" cy="16" r="2" fill="currentColor"/>
  </svg>
)

// Map Pin Icon
export const MapPinIcon: React.FC<IconProps> = ({ 
  className, 
  size = 'md', 
  color = 'current' 
}) => (
  <svg
    className={cn(sizeClasses[size], colorClasses[color], className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <circle cx="12" cy="11" r="3"/>
    <circle cx="12" cy="11" r="1" fill="currentColor"/>
  </svg>
)

// Export all icons as a collection
export const BirthdayIcons = {
  Heart: HeartIcon,
  HeartOutline: HeartOutlineIcon,
  Sparkle: SparkleIcon,
  Cake: CakeIcon,
  Gift: GiftIcon,
  Balloon: BalloonIcon,
  PartyHat: PartyHatIcon,
  Confetti: ConfettiIcon,
  Message: MessageIcon,
  Calendar: CalendarIcon,
  MapPin: MapPinIcon,
} as const

// Type for icon names
export type BirthdayIconName = keyof typeof BirthdayIcons
