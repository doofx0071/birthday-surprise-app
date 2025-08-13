/**
 * Birthday Surprise Design System - Animation Tokens
 * 
 * Comprehensive animation system with durations, easings, and keyframes
 * for delightful birthday-themed interactions.
 */

// Animation Durations
export const durations = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  slowest: '1000ms',
  
  // Contextual durations
  hover: '200ms',
  focus: '150ms',
  tooltip: '100ms',
  modal: '300ms',
  page: '500ms',
  
  // Birthday-specific durations
  heartBeat: '1200ms',
  float: '3000ms',
  sparkle: '1500ms',
  celebration: '2000ms',
} as const

// Easing Functions
export const easings = {
  // Standard easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier easings
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  
  // Birthday-themed easings
  heartBeat: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  float: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  sparkle: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  celebration: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// Keyframe Animations
export const keyframes = {
  // Floating animation for hearts and elements
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  
  // Heart beat animation
  heartBeat: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
  },
  
  // Sparkle animation
  sparkle: {
    '0%, 100%': { opacity: '0', transform: 'scale(0)' },
    '50%': { opacity: '1', transform: 'scale(1)' },
  },
  
  // Pulse animation (soft)
  pulseSoft: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.7' },
  },
  
  // Bounce animation
  bounce: {
    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
    '70%': { transform: 'translate3d(0, -15px, 0)' },
    '90%': { transform: 'translate3d(0, -4px, 0)' },
  },
  
  // Fade animations
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  
  fadeInUp: {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  
  fadeInDown: {
    '0%': { opacity: '0', transform: 'translateY(-20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  
  // Scale animations
  scaleIn: {
    '0%': { opacity: '0', transform: 'scale(0.9)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  
  scaleOut: {
    '0%': { opacity: '1', transform: 'scale(1)' },
    '100%': { opacity: '0', transform: 'scale(0.9)' },
  },
  
  // Slide animations
  slideInLeft: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  
  slideInRight: {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  
  slideInUp: {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' },
  },
  
  slideInDown: {
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(0)' },
  },
  
  // Rotation animations
  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  
  // Birthday celebration animations
  confetti: {
    '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
    '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
  },
  
  celebration: {
    '0%': { transform: 'scale(1) rotate(0deg)' },
    '25%': { transform: 'scale(1.1) rotate(90deg)' },
    '50%': { transform: 'scale(1.2) rotate(180deg)' },
    '75%': { transform: 'scale(1.1) rotate(270deg)' },
    '100%': { transform: 'scale(1) rotate(360deg)' },
  },
  
  // Shimmer effect
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
} as const

// Pre-defined Animation Combinations
export const animations = {
  // Basic animations
  fadeIn: `${durations.normal} ${easings.smooth} fadeIn`,
  fadeOut: `${durations.normal} ${easings.smooth} fadeOut`,
  scaleIn: `${durations.fast} ${easings.bounce} scaleIn`,
  scaleOut: `${durations.fast} ${easings.smooth} scaleOut`,
  
  // Birthday-themed animations
  float: `${durations.float} ${easings.float} float infinite`,
  heartBeat: `${durations.heartBeat} ${easings.heartBeat} heartBeat infinite`,
  sparkle: `${durations.sparkle} ${easings.sparkle} sparkle infinite`,
  pulseSoft: `${durations.celebration} ${easings.smooth} pulseSoft infinite`,
  
  // Interaction animations
  hover: `${durations.hover} ${easings.smooth}`,
  focus: `${durations.focus} ${easings.smooth}`,
  
  // Loading animations
  spin: `${durations.slowest} ${easings.linear} spin infinite`,
  bounce: `${durations.celebration} ${easings.bounce} bounce infinite`,
  
  // Celebration animations
  celebration: `${durations.celebration} ${easings.celebration} celebration`,
  confetti: `${durations.slower} ${easings.linear} confetti`,
} as const

// Transition Presets
export const transitions = {
  // All properties
  all: `all ${durations.normal} ${easings.smooth}`,
  allFast: `all ${durations.fast} ${easings.smooth}`,
  allSlow: `all ${durations.slow} ${easings.smooth}`,
  
  // Specific properties
  colors: `color ${durations.normal} ${easings.smooth}, background-color ${durations.normal} ${easings.smooth}, border-color ${durations.normal} ${easings.smooth}`,
  transform: `transform ${durations.normal} ${easings.smooth}`,
  opacity: `opacity ${durations.normal} ${easings.smooth}`,
  shadow: `box-shadow ${durations.normal} ${easings.smooth}`,
  
  // Interactive states
  button: `all ${durations.hover} ${easings.smooth}`,
  card: `all ${durations.normal} ${easings.smooth}`,
  input: `all ${durations.focus} ${easings.smooth}`,
  
  // Birthday-themed transitions
  birthday: `all ${durations.normal} ${easings.bounce}`,
  celebration: `all ${durations.slow} ${easings.celebration}`,
} as const

// Export all animation tokens
export const animationTokens = {
  durations,
  easings,
  keyframes,
  animations,
  transitions,
} as const

// Type definitions
export type Duration = keyof typeof durations
export type Easing = keyof typeof easings
export type Keyframe = keyof typeof keyframes
export type Animation = keyof typeof animations
export type Transition = keyof typeof transitions
