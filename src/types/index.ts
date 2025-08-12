// Global type definitions for the Birthday Surprise App

/**
 * Birthday message from family and friends
 */
export interface BirthdayMessage {
  id: string
  name: string
  email: string
  message: string
  location?: {
    city?: string
    country?: string
    latitude?: number
    longitude?: number
  }
  mediaFiles?: MediaFile[]
  wantsReminders: boolean
  createdAt: Date
  updatedAt: Date
  isApproved: boolean
  isVisible: boolean
}

/**
 * Media file attached to a birthday message
 */
export interface MediaFile {
  id: string
  messageId: string
  fileName: string
  fileType: 'image' | 'video'
  fileSize: number
  storagePath: string
  thumbnailPath?: string
  createdAt: Date
}

/**
 * Email notification for birthday reminders
 */
export interface EmailNotification {
  id: string
  email: string
  notificationType: 'birthday' | 'reminder' | 'thank_you'
  scheduledFor: Date
  sentAt?: Date
  status: 'pending' | 'sent' | 'failed'
  createdAt: Date
}

/**
 * Countdown timer state
 */
export interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

/**
 * Location data for the memory map
 */
export interface LocationPin {
  id: string
  latitude: number
  longitude: number
  city: string
  country: string
  messageCount: number
  contributors: Array<{
    name: string
    message: string
  }>
}

/**
 * Form validation error
 */
export interface FormError {
  field: string
  message: string
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * File upload progress
 */
export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  language: string
}

/**
 * Admin dashboard statistics
 */
export interface DashboardStats {
  totalMessages: number
  totalContributors: number
  totalCountries: number
  totalMediaFiles: number
  recentMessages: BirthdayMessage[]
  topCountries: Array<{
    country: string
    count: number
  }>
}

/**
 * Component props for common UI elements
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface InputProps {
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg'
}

/**
 * Animation variants for Framer Motion
 */
export interface AnimationVariants {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit?: Record<string, unknown>
  transition?: Record<string, unknown>
}

/**
 * Map configuration
 */
export interface MapConfig {
  center: [number, number]
  zoom: number
  style: string
  accessToken: string
}

/**
 * Email template data
 */
export interface EmailTemplateData {
  recipientName: string
  girlfriendName: string
  messageCount: number
  contributorCount: number
  websiteUrl: string
  unsubscribeUrl: string
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  birthdayDate: string
  girlfriendName: string
  supabaseUrl: string
  supabaseAnonKey: string
  mapboxToken: string
  resendApiKey: string
  isDevelopment: boolean
  isProduction: boolean
}
