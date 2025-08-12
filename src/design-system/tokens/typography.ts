/**
 * Birthday Surprise Design System - Typography Tokens
 * 
 * Comprehensive typography system with font families, sizes, weights, and line heights
 * optimized for the birthday surprise application.
 */

// Font Family Tokens
export const fontFamilies = {
  // Display font for headings and special text (elegant serif)
  display: ['Playfair Display', 'serif'],
  
  // Body font for general content (clean sans-serif)
  body: ['Inter', 'sans-serif'],
  
  // Countdown font for timer display (bold display font)
  countdown: ['Poppins', 'sans-serif'],
  
  // Monospace for code or special formatting
  mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
} as const

// Font Weight Tokens
export const fontWeights = {
  thin: 100,
  extraLight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const

// Font Size Tokens (in rem)
export const fontSizes = {
  // Extra small sizes
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  
  // Base sizes
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  
  // Heading sizes
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
  '8xl': '6rem',      // 96px
  '9xl': '8rem',      // 128px
  
  // Special countdown sizes
  countdown: {
    sm: '2rem',       // 32px
    md: '3rem',       // 48px
    lg: '4rem',       // 64px
    xl: '6rem',       // 96px
    '2xl': '8rem',    // 128px
    '3xl': '10rem',   // 160px
  },
} as const

// Line Height Tokens
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  
  // Specific line heights for different contexts
  heading: 1.2,
  body: 1.6,
  caption: 1.4,
} as const

// Letter Spacing Tokens
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

// Typography Scale Definitions
export const typographyScale = {
  // Display styles (for hero sections, major headings)
  display: {
    '3xl': {
      fontSize: fontSizes['9xl'],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    '2xl': {
      fontSize: fontSizes['8xl'],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSizes['7xl'],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSizes['6xl'],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes['5xl'],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes['4xl'],
      lineHeight: lineHeights.snug,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Heading styles
  heading: {
    h1: {
      fontSize: fontSizes['4xl'],
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSizes['3xl'],
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
    h3: {
      fontSize: fontSizes['2xl'],
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.heading,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.wide,
    },
  },
  
  // Body text styles
  body: {
    xl: {
      fontSize: fontSizes.xl,
      lineHeight: lineHeights.body,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    lg: {
      fontSize: fontSizes.lg,
      lineHeight: lineHeights.body,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.base,
      lineHeight: lineHeights.body,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.sm,
      lineHeight: lineHeights.body,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    xs: {
      fontSize: fontSizes.xs,
      lineHeight: lineHeights.caption,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },
  
  // Countdown styles
  countdown: {
    hero: {
      fontSize: fontSizes.countdown['3xl'],
      lineHeight: lineHeights.none,
      fontWeight: fontWeights.black,
      letterSpacing: letterSpacing.tight,
    },
    large: {
      fontSize: fontSizes.countdown['2xl'],
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.extraBold,
      letterSpacing: letterSpacing.tight,
    },
    medium: {
      fontSize: fontSizes.countdown.xl,
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSizes.countdown.lg,
      lineHeight: lineHeights.snug,
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.normal,
    },
  },
} as const

// Export all typography tokens
export const typographyTokens = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  scale: typographyScale,
} as const

// Type definitions
export type FontFamily = keyof typeof fontFamilies
export type FontWeight = keyof typeof fontWeights
export type FontSize = keyof typeof fontSizes
export type LineHeight = keyof typeof lineHeights
export type LetterSpacing = keyof typeof letterSpacing
export type DisplaySize = keyof typeof typographyScale.display
export type HeadingLevel = keyof typeof typographyScale.heading
export type BodySize = keyof typeof typographyScale.body
export type CountdownSize = keyof typeof typographyScale.countdown
