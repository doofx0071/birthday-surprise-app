/**
 * Birthday Surprise Design System - Spacing & Layout Tokens
 * 
 * Comprehensive spacing system for consistent layouts and component spacing.
 */

// Base Spacing Scale (in rem)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  18: '4.5rem',     // 72px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// Semantic Spacing (contextual spacing values)
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
  },
  
  // Layout spacing
  layout: {
    xs: spacing[4],      // 16px
    sm: spacing[6],      // 24px
    md: spacing[8],      // 32px
    lg: spacing[12],     // 48px
    xl: spacing[16],     // 64px
    '2xl': spacing[24],  // 96px
    '3xl': spacing[32],  // 128px
  },
  
  // Section spacing
  section: {
    xs: spacing[8],      // 32px
    sm: spacing[12],     // 48px
    md: spacing[16],     // 64px
    lg: spacing[24],     // 96px
    xl: spacing[32],     // 128px
    '2xl': spacing[40],  // 160px
  },
  
  // Container spacing
  container: {
    xs: spacing[4],      // 16px
    sm: spacing[6],      // 24px
    md: spacing[8],      // 32px
    lg: spacing[12],     // 48px
    xl: spacing[16],     // 64px
  },
} as const

// Border Radius Tokens
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  '4xl': '2rem',       // 32px
  full: '9999px',
  
  // Semantic radius values
  button: '0.75rem',   // 12px - slightly rounded for buttons
  card: '1rem',        // 16px - comfortable for cards
  input: '0.5rem',     // 8px - subtle for form inputs
  badge: '9999px',     // full - pill shape for badges
  modal: '1.5rem',     // 24px - prominent for modals
} as const

// Shadow Tokens
export const shadows = {
  none: 'none',
  
  // Soft shadows (subtle depth)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Birthday-themed shadows (with pink tints)
  birthday: {
    soft: '0 4px 6px -1px rgba(255, 182, 193, 0.3), 0 2px 4px -1px rgba(255, 182, 193, 0.2)',
    medium: '0 10px 15px -3px rgba(255, 182, 193, 0.3), 0 4px 6px -2px rgba(255, 182, 193, 0.2)',
    strong: '0 20px 25px -5px rgba(255, 182, 193, 0.4), 0 10px 10px -5px rgba(255, 182, 193, 0.3)',
  },
  
  // Glow effects
  glow: {
    pink: '0 0 20px rgba(255, 182, 193, 0.5)',
    roseGold: '0 0 20px rgba(232, 180, 184, 0.5)',
    white: '0 0 20px rgba(255, 255, 255, 0.8)',
  },
} as const

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

// Breakpoints (for responsive design)
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Container Max Widths
export const containerSizes = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // Content-specific containers
  content: '65ch',     // Optimal reading width
  prose: '75ch',       // For long-form content
  narrow: '32rem',     // For forms and focused content
  wide: '80rem',       // For wide layouts
} as const

// Grid System
export const grid = {
  columns: 12,
  gap: {
    xs: spacing[2],    // 8px
    sm: spacing[4],    // 16px
    md: spacing[6],    // 24px
    lg: spacing[8],    // 32px
    xl: spacing[12],   // 48px
  },
} as const

// Export all spacing tokens
export const spacingTokens = {
  spacing,
  semantic: semanticSpacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  containers: containerSizes,
  grid,
} as const

// Type definitions
export type Spacing = keyof typeof spacing
export type SemanticSpacing = keyof typeof semanticSpacing
export type BorderRadius = keyof typeof borderRadius
export type Shadow = keyof typeof shadows
export type ZIndex = keyof typeof zIndex
export type Breakpoint = keyof typeof breakpoints
export type ContainerSize = keyof typeof containerSizes
