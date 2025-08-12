/**
 * Birthday Surprise Design System - Color Tokens
 * 
 * Comprehensive color palette for the birthday surprise application.
 * Based on the white/pink/black theme with romantic and celebratory feel.
 */

// Primary Brand Colors
export const brandColors = {
  // Pure white for clean backgrounds and cards
  white: '#FFFFFF',
  
  // Soft pink for accents, buttons, and hearts
  softPink: '#FFB6C1',
  
  // Rose gold for elegant highlights and borders
  roseGold: '#E8B4B8',
  
  // Charcoal black for text and strong contrast
  charcoal: '#2D2D2D',
  
  // Light gray for subtle backgrounds
  lightGray: '#F8F9FA',
} as const

// Extended Pink Palette
export const pinkPalette = {
  50: '#FEF7F7',
  100: '#FDEAEA',
  200: '#FBD9DB',
  300: '#F7BCC0',
  400: '#F194A0',
  500: '#E8B4B8', // Rose gold
  600: '#D89CA2',
  700: '#C17D85',
  800: '#A16670',
  900: '#85555E',
} as const

// Extended Accent Palette (Soft Pink variations)
export const accentPalette = {
  50: '#FEF7F7',
  100: '#FEF0F0',
  200: '#FFE4E6',
  300: '#FFCDD2',
  400: '#FFB6C1', // Soft pink
  500: '#FF9FB0',
  600: '#FF7A94',
  700: '#FF5577',
  800: '#E6405A',
  900: '#CC2E47',
} as const

// Neutral Palette (Grays and Blacks)
export const neutralPalette = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#2D2D2D', // Charcoal
  900: '#171717',
} as const

// Semantic Colors
export const semanticColors = {
  // Success (soft green that complements pink)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Warning (soft amber)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error (soft red that works with pink)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Info (soft blue that complements the palette)
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const

// Special Birthday Colors
export const birthdayColors = {
  // Heart colors for floating animations
  heartPink: '#FF69B4',
  heartRed: '#FF1493',
  heartLight: '#FFB6C1',
  
  // Sparkle colors
  sparkleGold: '#FFD700',
  sparkleSilver: '#C0C0C0',
  sparkleWhite: '#FFFFFF',
  
  // Celebration colors
  confettiPink: '#FF69B4',
  confettiGold: '#FFD700',
  confettiPurple: '#DA70D6',
  confettiBlue: '#87CEEB',
} as const

// Gradient Definitions
export const gradients = {
  // Primary gradients
  primary: 'linear-gradient(135deg, #FFFFFF 0%, #FFB6C1 100%)',
  accent: 'linear-gradient(135deg, #FFB6C1 0%, #E8B4B8 100%)',
  
  // Celebration gradients
  celebration: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #E8B4B8 100%)',
  sunset: 'linear-gradient(135deg, #FFB6C1 0%, #FFD700 50%, #FF69B4 100%)',
  
  // Subtle gradients
  subtle: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
  card: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 182, 193, 0.05) 100%)',
} as const

// Shadow Colors (with opacity)
export const shadowColors = {
  soft: 'rgba(0, 0, 0, 0.1)',
  medium: 'rgba(0, 0, 0, 0.15)',
  strong: 'rgba(0, 0, 0, 0.25)',
  
  // Colored shadows for special effects
  pink: 'rgba(255, 182, 193, 0.3)',
  roseGold: 'rgba(232, 180, 184, 0.3)',
  celebration: 'rgba(255, 105, 180, 0.2)',
} as const

// Export all color tokens
export const colorTokens = {
  brand: brandColors,
  pink: pinkPalette,
  accent: accentPalette,
  neutral: neutralPalette,
  semantic: semanticColors,
  birthday: birthdayColors,
  gradients,
  shadows: shadowColors,
} as const

// Type definitions for TypeScript
export type BrandColor = keyof typeof brandColors
export type PinkShade = keyof typeof pinkPalette
export type AccentShade = keyof typeof accentPalette
export type NeutralShade = keyof typeof neutralPalette
export type SemanticColor = keyof typeof semanticColors
export type BirthdayColor = keyof typeof birthdayColors
export type GradientName = keyof typeof gradients
export type ShadowColor = keyof typeof shadowColors
