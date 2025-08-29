import fs from 'fs'
import path from 'path'

interface EnvVariable {
  key: string
  value: string
  comment?: string
}

class EnvironmentManager {
  private envPath: string

  constructor() {
    this.envPath = path.join(process.cwd(), '.env.local')
  }

  /**
   * Read all environment variables from .env.local
   */
  readEnvFile(): Record<string, string> {
    try {
      if (!fs.existsSync(this.envPath)) {
        return {}
      }

      const content = fs.readFileSync(this.envPath, 'utf-8')
      const env: Record<string, string> = {}

      content.split('\n').forEach(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '')
            env[key.trim()] = value
          }
        }
      })

      return env
    } catch (error) {
      console.error('Error reading .env.local:', error)
      return {}
    }
  }

  /**
   * Write environment variables to .env.local
   */
  writeEnvFile(variables: Record<string, string>): boolean {
    try {
      // Create backup
      this.createBackup()

      // Read existing content to preserve comments and structure
      let existingContent = ''
      if (fs.existsSync(this.envPath)) {
        existingContent = fs.readFileSync(this.envPath, 'utf-8')
      }

      // Parse existing content
      const lines = existingContent.split('\n')
      const updatedLines: string[] = []
      const processedKeys = new Set<string>()

      // Process existing lines
      lines.forEach(line => {
        const trimmedLine = line.trim()
        
        // Keep comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          updatedLines.push(line)
          return
        }

        // Parse variable line
        const [key] = trimmedLine.split('=')
        if (key) {
          const cleanKey = key.trim()
          if (variables.hasOwnProperty(cleanKey)) {
            // Update existing variable
            const value = variables[cleanKey]
            updatedLines.push(`${cleanKey}=${this.formatValue(value)}`)
            processedKeys.add(cleanKey)
          } else {
            // Keep existing variable
            updatedLines.push(line)
          }
        }
      })

      // Add new variables that weren't in the original file
      Object.entries(variables).forEach(([key, value]) => {
        if (!processedKeys.has(key)) {
          updatedLines.push(`${key}=${this.formatValue(value)}`)
        }
      })

      // Write updated content
      const newContent = updatedLines.join('\n')
      fs.writeFileSync(this.envPath, newContent, 'utf-8')

      return true
    } catch (error) {
      console.error('Error writing .env.local:', error)
      return false
    }
  }

  /**
   * Update specific environment variables
   */
  updateEnvVariables(updates: Record<string, string>): boolean {
    const existing = this.readEnvFile()
    const merged = { ...existing, ...updates }
    return this.writeEnvFile(merged)
  }

  /**
   * Get a specific environment variable
   */
  getEnvVariable(key: string): string | undefined {
    const env = this.readEnvFile()
    return env[key] || process.env[key]
  }

  /**
   * Set a specific environment variable
   */
  setEnvVariable(key: string, value: string): boolean {
    return this.updateEnvVariables({ [key]: value })
  }

  /**
   * Create a backup of the current .env.local file
   */
  private createBackup(): void {
    try {
      if (fs.existsSync(this.envPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupPath = `${this.envPath}.backup.${timestamp}`
        fs.copyFileSync(this.envPath, backupPath)
        
        // Keep only the last 5 backups
        this.cleanupBackups()
      }
    } catch (error) {
      console.error('Error creating backup:', error)
    }
  }

  /**
   * Clean up old backup files
   */
  private cleanupBackups(): void {
    try {
      const dir = path.dirname(this.envPath)
      const files = fs.readdirSync(dir)
      const backupFiles = files
        .filter(file => file.startsWith('.env.local.backup.'))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          stat: fs.statSync(path.join(dir, file))
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())

      // Keep only the 5 most recent backups
      if (backupFiles.length > 5) {
        backupFiles.slice(5).forEach(backup => {
          fs.unlinkSync(backup.path)
        })
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error)
    }
  }

  /**
   * Format value for .env file (add quotes if needed)
   */
  private formatValue(value: string): string {
    // Add quotes if value contains spaces or special characters
    if (value.includes(' ') || value.includes('#') || value.includes('=')) {
      return `"${value.replace(/"/g, '\\"')}"`
    }
    return value
  }

  /**
   * Get system configuration from environment variables
   */
  getSystemConfig() {
    return {
      birthdayDate: this.getEnvVariable('NEXT_PUBLIC_BIRTHDAY_DATE') || '',
      birthdayPersonName: this.getEnvVariable('NEXT_PUBLIC_GIRLFRIEND_NAME') || '',
      timezone: this.getEnvVariable('NEXT_PUBLIC_TIMEZONE') || 'Asia/Manila',
      countdownStartDate: this.getEnvVariable('NEXT_PUBLIC_COUNTDOWN_START_DATE') || '',
      enableCountdown: this.getEnvVariable('NEXT_PUBLIC_ENABLE_COUNTDOWN') === 'true',
      enableEmailNotifications: this.getEnvVariable('ENABLE_EMAIL_NOTIFICATIONS') === 'true',
      enableMessageApproval: this.getEnvVariable('ENABLE_MESSAGE_APPROVAL') !== 'false', // default true
    }
  }

  /**
   * Update system configuration in environment variables
   */
  updateSystemConfig(config: {
    birthdayDate?: string
    birthdayPersonName?: string
    timezone?: string
    countdownStartDate?: string
    enableCountdown?: boolean
    enableEmailNotifications?: boolean
    enableMessageApproval?: boolean
  }): boolean {
    const updates: Record<string, string> = {}

    if (config.birthdayDate !== undefined) {
      updates.NEXT_PUBLIC_BIRTHDAY_DATE = config.birthdayDate
    }
    if (config.birthdayPersonName !== undefined) {
      updates.NEXT_PUBLIC_GIRLFRIEND_NAME = config.birthdayPersonName
    }
    if (config.timezone !== undefined) {
      updates.NEXT_PUBLIC_TIMEZONE = config.timezone
    }
    if (config.countdownStartDate !== undefined) {
      updates.NEXT_PUBLIC_COUNTDOWN_START_DATE = config.countdownStartDate
    }
    if (config.enableCountdown !== undefined) {
      updates.NEXT_PUBLIC_ENABLE_COUNTDOWN = config.enableCountdown.toString()
    }
    if (config.enableEmailNotifications !== undefined) {
      updates.ENABLE_EMAIL_NOTIFICATIONS = config.enableEmailNotifications.toString()
    }
    if (config.enableMessageApproval !== undefined) {
      updates.ENABLE_MESSAGE_APPROVAL = config.enableMessageApproval.toString()
    }

    return this.updateEnvVariables(updates)
  }

  /**
   * Get email configuration from environment variables
   */
  getEmailConfig() {
    return {
      senderName: this.getEnvVariable('EMAIL_SENDER_NAME') || "Cela's Birthday",
      senderEmail: this.getEnvVariable('EMAIL_SENDER_EMAIL') || '',
      replyToEmail: this.getEnvVariable('EMAIL_REPLY_TO') || '',
      smtpHost: this.getEnvVariable('SMTP_HOST') || '',
      smtpPort: this.getEnvVariable('SMTP_PORT') || '587',
      smtpUsername: this.getEnvVariable('SMTP_USERNAME') || '',
      smtpPassword: this.getEnvVariable('SMTP_PASSWORD') || '',
      enableTLS: this.getEnvVariable('SMTP_TLS') !== 'false', // default true
    }
  }

  /**
   * Update email configuration in environment variables
   */
  updateEmailConfig(config: {
    senderName?: string
    senderEmail?: string
    replyToEmail?: string
    smtpHost?: string
    smtpPort?: string
    smtpUsername?: string
    smtpPassword?: string
    enableTLS?: boolean
  }): boolean {
    const updates: Record<string, string> = {}

    if (config.senderName !== undefined) {
      updates.EMAIL_SENDER_NAME = config.senderName
    }
    if (config.senderEmail !== undefined) {
      updates.EMAIL_SENDER_EMAIL = config.senderEmail
    }
    if (config.replyToEmail !== undefined) {
      updates.EMAIL_REPLY_TO = config.replyToEmail
    }
    if (config.smtpHost !== undefined) {
      updates.SMTP_HOST = config.smtpHost
    }
    if (config.smtpPort !== undefined) {
      updates.SMTP_PORT = config.smtpPort
    }
    if (config.smtpUsername !== undefined) {
      updates.SMTP_USERNAME = config.smtpUsername
    }
    if (config.smtpPassword !== undefined) {
      updates.SMTP_PASSWORD = config.smtpPassword
    }
    if (config.enableTLS !== undefined) {
      updates.SMTP_TLS = config.enableTLS.toString()
    }

    return this.updateEnvVariables(updates)
  }
}

// Export singleton instance
export const envManager = new EnvironmentManager()
