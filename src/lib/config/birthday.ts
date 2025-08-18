// Birthday celebration configuration
// This file contains configurable settings for the birthday surprise system

export interface BirthdayConfig {
  // Birthday celebrant information
  celebrant: {
    name: string
    email: string
  }
  
  // Birthday date and timing
  birthday: {
    date: Date
    timezone: string
  }
  
  // Website configuration
  website: {
    url: string
    name: string
  }
  
  // Email sender configuration
  sender: {
    name: string
    email: string
  }
}

// Default configuration - can be overridden by environment variables or admin dashboard
const defaultConfig: BirthdayConfig = {
  celebrant: {
    name: process.env.NEXT_PUBLIC_GIRLFRIEND_NAME || 'Gracela Elmera C. Betarmos',
    email: process.env.BIRTHDAY_CELEBRANT_EMAIL || 'gracela.betarmos@gmail.com', // Default email - should be configured
  },
  
  birthday: {
    date: new Date(process.env.NEXT_PUBLIC_BIRTHDAY_DATE || '2025-09-08T00:00:00+08:00'),
    timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Manila',
  },
  
  website: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app',
    name: 'Birthday Surprise',
  },
  
  sender: {
    name: "Cela's Birthday",
    email: process.env.EMAIL_FROM || 'no-reply@doofio.site',
  },
}

// Get current birthday configuration
export function getBirthdayConfig(): BirthdayConfig {
  return defaultConfig
}

// Update celebrant email (for admin dashboard use)
export function updateCelebrantEmail(email: string): BirthdayConfig {
  defaultConfig.celebrant.email = email
  return defaultConfig
}

// Check if it's currently the birthday time in the configured timezone
export function isBirthdayTime(): boolean {
  const config = getBirthdayConfig()
  const now = new Date()
  const birthdayDate = config.birthday.date
  
  // Convert to Philippine timezone for comparison
  const phNow = new Date(now.toLocaleString("en-US", { timeZone: config.birthday.timezone }))
  const phBirthday = new Date(birthdayDate.toLocaleString("en-US", { timeZone: config.birthday.timezone }))
  
  // Check if it's the same day and within the birthday hour (midnight to 1 AM)
  const isSameDay = phNow.getDate() === phBirthday.getDate() &&
                    phNow.getMonth() === phBirthday.getMonth() &&
                    phNow.getFullYear() === phBirthday.getFullYear()
  
  const isWithinBirthdayHour = phNow.getHours() === 0 // Midnight hour
  
  return isSameDay && isWithinBirthdayHour
}

// Get time remaining until birthday
export function getTimeUntilBirthday(): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
} {
  const config = getBirthdayConfig()
  const now = new Date()
  const birthdayDate = config.birthday.date
  
  const total = birthdayDate.getTime() - now.getTime()
  
  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isComplete: true,
    }
  }
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  
  return {
    days,
    hours,
    minutes,
    seconds,
    total,
    isComplete: false,
  }
}
