/**
 * Birthday Surprise Design System - Design Tokens
 * 
 * Central export for all design tokens used throughout the application.
 * This provides a single source of truth for colors, typography, spacing, and animations.
 */

// Import all token categories
export { colorTokens, type BrandColor, type PinkShade, type AccentShade, type NeutralShade } from './colors'
export { typographyTokens, type FontFamily, type FontWeight, type FontSize, type DisplaySize } from './typography'
export { spacingTokens, type Spacing, type BorderRadius, type Shadow, type Breakpoint } from './spacing'
export { animationTokens, type Duration, type Easing, type Animation, type Transition } from './animations'

// Re-export individual token objects for convenience
export {
  brandColors,
  pinkPalette,
  accentPalette,
  neutralPalette,
  semanticColors,
  birthdayColors,
  gradients,
  shadowColors,
} from './colors'

export {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  typographyScale,
} from './typography'

export {
  spacing,
  semanticSpacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  containerSizes,
  grid,
} from './spacing'

export {
  durations,
  easings,
  keyframes,
  animations,
  transitions,
} from './animations'

// Combined design tokens object
export const designTokens = {
  colors: {
    brand: {
      white: '#FFFFFF',
      softPink: '#FFB6C1',
      roseGold: '#E8B4B8',
      charcoal: '#2D2D2D',
      lightGray: '#F8F9FA',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    birthday: {
      heartPink: '#FF69B4',
      sparkleGold: '#FFD700',
      confettiPink: '#FF69B4',
    },
  },
  
  typography: {
    fonts: {
      display: 'Playfair Display, serif',
      body: 'Inter, sans-serif',
      countdown: 'Poppins, sans-serif',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    birthday: '0 4px 6px -1px rgba(255, 182, 193, 0.3)',
  },
  
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easings: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const

// Utility functions for working with design tokens
export const getColor = (path: string) => {
  const keys = path.split('.')
  let value: unknown = designTokens.colors

  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key]
  }

  return (value as string) || path
}

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size] || size
}

export const getFontSize = (size: keyof typeof designTokens.typography.sizes) => {
  return designTokens.typography.sizes[size] || size
}

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => {
  return designTokens.borderRadius[size] || size
}

export const getShadow = (size: keyof typeof designTokens.shadows) => {
  return designTokens.shadows[size] || size
}

// CSS Custom Properties Generator
export const generateCSSCustomProperties = () => {
  const cssVars: Record<string, string> = {}
  
  // Colors
  Object.entries(designTokens.colors.brand).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value
  })
  
  Object.entries(designTokens.colors.semantic).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value
  })
  
  // Typography
  Object.entries(designTokens.typography.sizes).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value
  })
  
  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })
  
  // Border Radius
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value
  })
  
  return cssVars
}

// Type definitions for the combined tokens
export type DesignTokens = typeof designTokens
export type ColorPath = string
export type SpacingSize = keyof typeof designTokens.spacing
export type TypographySize = keyof typeof designTokens.typography.sizes
export type RadiusSize = keyof typeof designTokens.borderRadius
export type ShadowSize = keyof typeof designTokens.shadows
