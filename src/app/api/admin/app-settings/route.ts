import { NextRequest, NextResponse } from 'next/server'
import { envManager } from '@/lib/env-manager'

export async function GET() {
  try {
    // Get application settings from environment variables
    const settings = {
      enableMessageApproval: envManager.getEnvVariable('ENABLE_MESSAGE_APPROVAL') !== 'false',
      enableEmailReminders: envManager.getEnvVariable('ENABLE_EMAIL_REMINDERS') === 'true',
      enableFileUploads: envManager.getEnvVariable('ENABLE_FILE_UPLOADS') !== 'false',
      maxFileSize: parseInt(envManager.getEnvVariable('MAX_FILE_SIZE') || '10'),
      allowedFileTypes: envManager.getEnvVariable('ALLOWED_FILE_TYPES') || 'image/*,video/*',
      enableMaintenanceMode: envManager.getEnvVariable('MAINTENANCE_MODE') === 'true',
      maintenanceMessage: envManager.getEnvVariable('MAINTENANCE_MESSAGE') || '',
      enableAnalytics: envManager.getEnvVariable('ENABLE_ANALYTICS') !== 'false',
      enableRealTimeUpdates: envManager.getEnvVariable('ENABLE_REALTIME_UPDATES') !== 'false',
      sessionTimeout: parseInt(envManager.getEnvVariable('SESSION_TIMEOUT') || '60'),
      maxMessagesPerUser: parseInt(envManager.getEnvVariable('MAX_MESSAGES_PER_USER') || '5'),
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching app settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate numeric fields
    if (body.maxFileSize && (body.maxFileSize < 1 || body.maxFileSize > 100)) {
      return NextResponse.json(
        { error: 'Max file size must be between 1 and 100 MB' },
        { status: 400 }
      )
    }

    if (body.sessionTimeout && (body.sessionTimeout < 15 || body.sessionTimeout > 1440)) {
      return NextResponse.json(
        { error: 'Session timeout must be between 15 and 1440 minutes' },
        { status: 400 }
      )
    }

    if (body.maxMessagesPerUser && (body.maxMessagesPerUser < 1 || body.maxMessagesPerUser > 100)) {
      return NextResponse.json(
        { error: 'Max messages per user must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Update environment variables
    const updates: Record<string, string> = {}

    if (body.enableMessageApproval !== undefined) {
      updates.ENABLE_MESSAGE_APPROVAL = body.enableMessageApproval.toString()
    }
    if (body.enableEmailReminders !== undefined) {
      updates.ENABLE_EMAIL_REMINDERS = body.enableEmailReminders.toString()
    }
    if (body.enableFileUploads !== undefined) {
      updates.ENABLE_FILE_UPLOADS = body.enableFileUploads.toString()
    }
    if (body.maxFileSize !== undefined) {
      updates.MAX_FILE_SIZE = body.maxFileSize.toString()
    }
    if (body.allowedFileTypes !== undefined) {
      updates.ALLOWED_FILE_TYPES = body.allowedFileTypes
    }
    if (body.enableMaintenanceMode !== undefined) {
      updates.MAINTENANCE_MODE = body.enableMaintenanceMode.toString()
    }
    if (body.maintenanceMessage !== undefined) {
      updates.MAINTENANCE_MESSAGE = body.maintenanceMessage
    }
    if (body.enableAnalytics !== undefined) {
      updates.ENABLE_ANALYTICS = body.enableAnalytics.toString()
    }
    if (body.enableRealTimeUpdates !== undefined) {
      updates.ENABLE_REALTIME_UPDATES = body.enableRealTimeUpdates.toString()
    }
    if (body.sessionTimeout !== undefined) {
      updates.SESSION_TIMEOUT = body.sessionTimeout.toString()
    }
    if (body.maxMessagesPerUser !== undefined) {
      updates.MAX_MESSAGES_PER_USER = body.maxMessagesPerUser.toString()
    }

    const success = envManager.updateEnvVariables(updates)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update application settings' },
        { status: 500 }
      )
    }

    // Return updated settings
    const updatedSettings = {
      enableMessageApproval: envManager.getEnvVariable('ENABLE_MESSAGE_APPROVAL') !== 'false',
      enableEmailReminders: envManager.getEnvVariable('ENABLE_EMAIL_REMINDERS') === 'true',
      enableFileUploads: envManager.getEnvVariable('ENABLE_FILE_UPLOADS') !== 'false',
      maxFileSize: parseInt(envManager.getEnvVariable('MAX_FILE_SIZE') || '10'),
      allowedFileTypes: envManager.getEnvVariable('ALLOWED_FILE_TYPES') || 'image/*,video/*',
      enableMaintenanceMode: envManager.getEnvVariable('MAINTENANCE_MODE') === 'true',
      maintenanceMessage: envManager.getEnvVariable('MAINTENANCE_MESSAGE') || '',
      enableAnalytics: envManager.getEnvVariable('ENABLE_ANALYTICS') !== 'false',
      enableRealTimeUpdates: envManager.getEnvVariable('ENABLE_REALTIME_UPDATES') !== 'false',
      sessionTimeout: parseInt(envManager.getEnvVariable('SESSION_TIMEOUT') || '60'),
      maxMessagesPerUser: parseInt(envManager.getEnvVariable('MAX_MESSAGES_PER_USER') || '5'),
      lastUpdated: new Date().toISOString(),
    }
    
    return NextResponse.json({
      ...updatedSettings,
      message: 'Application settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating app settings:', error)
    return NextResponse.json(
      { error: 'Failed to update application settings' },
      { status: 500 }
    )
  }
}
