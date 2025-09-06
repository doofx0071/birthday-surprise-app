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

// Cache for system configuration
let cachedSystemConfig: any = null
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30 seconds

// Fetch system configuration from database
async function fetchSystemConfig() {
  const now = Date.now()
  if (cachedSystemConfig && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSystemConfig
  }

  try {
    const response = await fetch('/api/admin/system-config')
    if (response.ok) {
      cachedSystemConfig = await response.json()
      lastFetchTime = now
      return cachedSystemConfig
    }
  } catch (error) {
    console.error('Error fetching system config:', error)
  }

  return null
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
    name: "Cela's Birthday",
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

// Get birthday configuration with database values (async)
export async function getBirthdayConfigAsync(): Promise<BirthdayConfig> {
  const systemConfig = await fetchSystemConfig()

  if (systemConfig && systemConfig.birthdayDate && systemConfig.birthdayPersonName) {
    return {
      celebrant: {
        name: systemConfig.birthdayPersonName,
        email: defaultConfig.celebrant.email,
      },
      birthday: {
        date: new Date(systemConfig.birthdayDate),
        timezone: systemConfig.timezone || 'Asia/Manila',
      },
      website: defaultConfig.website,
      sender: defaultConfig.sender,
    }
  }

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

  // Check if it's the same day and time has passed the birthday time
  const isSameDay = phNow.getDate() === phBirthday.getDate() &&
                    phNow.getMonth() === phBirthday.getMonth() &&
                    phNow.getFullYear() === phBirthday.getFullYear()

  const hasTimePassedBirthday = phNow.getTime() >= phBirthday.getTime()

  return isSameDay && hasTimePassedBirthday
}

// Server-side function to get system configuration from database
export async function getSystemConfigFromDatabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: config, error } = await supabase
      .from('system_configurations')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return config
  } catch (error) {
    console.error('Error fetching system config from database:', error)
    return null
  }
}

// Get birthday configuration with database values (server-side)
export async function getBirthdayConfigFromDatabase(): Promise<BirthdayConfig> {
  const systemConfig = await getSystemConfigFromDatabase()

  // Get birthday celebrant email from email configuration
  let celebrantEmail = defaultConfig.celebrant.email
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: emailConfig, error } = await supabase
      .from('email_configurations')
      .select('birthday_celebrant_email')
      .eq('is_active', true)
      .single()

    if (!error && emailConfig?.birthday_celebrant_email) {
      celebrantEmail = emailConfig.birthday_celebrant_email
    }
  } catch (error) {
    console.error('Error fetching birthday celebrant email:', error)
  }

  if (systemConfig && systemConfig.birth_date && systemConfig.birthday_person_name) {
    return {
      celebrant: {
        name: systemConfig.birthday_person_name,
        email: celebrantEmail,
      },
      birthday: {
        date: new Date(systemConfig.birth_date),
        timezone: systemConfig.timezone || 'Asia/Manila',
      },
      website: defaultConfig.website,
      sender: defaultConfig.sender,
    }
  }

  return {
    ...defaultConfig,
    celebrant: {
      ...defaultConfig.celebrant,
      email: celebrantEmail,
    },
  }
}

// Get time remaining until birthday (server-side with database config)
export async function getTimeUntilBirthdayFromDatabase(): Promise<{
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
}> {
  const config = await getBirthdayConfigFromDatabase()
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

// Get time remaining until birthday (legacy function for compatibility)
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
