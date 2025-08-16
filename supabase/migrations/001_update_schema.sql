-- Migration: Update database schema to match task requirements
-- This migration updates the existing schema while preserving data

-- 1. Update messages table to match task requirements
-- Add new columns for location breakdown
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add new approval/visibility columns
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Migrate existing status data to new approval system
UPDATE messages 
SET is_approved = CASE 
  WHEN status = 'approved' THEN true 
  WHEN status = 'rejected' THEN false 
  ELSE true 
END,
is_visible = CASE 
  WHEN status = 'rejected' THEN false 
  ELSE true 
END
WHERE is_approved IS NULL OR is_visible IS NULL;

-- Parse existing location data into city/country if possible
-- This is a best-effort migration for existing data
UPDATE messages 
SET 
  location_city = CASE 
    WHEN location LIKE '%,%' THEN TRIM(SPLIT_PART(location, ',', 1))
    ELSE location
  END,
  location_country = CASE 
    WHEN location LIKE '%,%' THEN TRIM(SPLIT_PART(location, ',', -1))
    ELSE NULL
  END
WHERE location IS NOT NULL AND (location_city IS NULL OR location_country IS NULL);

-- Update message length constraint to match task requirements
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_check;
ALTER TABLE messages ADD CONSTRAINT messages_message_check 
  CHECK (length(message) >= 10 AND length(message) <= 500);

-- Update name length constraint to match task requirements  
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_name_check;
ALTER TABLE messages ADD CONSTRAINT messages_name_check 
  CHECK (length(name) >= 2 AND length(name) <= 100);

-- 2. Update media_files table to match task requirements
-- Change file_type constraint to match task spec
ALTER TABLE media_files DROP CONSTRAINT IF EXISTS media_files_file_type_check;
ALTER TABLE media_files 
ALTER COLUMN file_type TYPE VARCHAR(50),
ALTER COLUMN file_name TYPE VARCHAR(255),
ALTER COLUMN storage_path TYPE VARCHAR(500),
ALTER COLUMN thumbnail_path TYPE VARCHAR(500);

-- Change file_size to INTEGER to match task spec
ALTER TABLE media_files ALTER COLUMN file_size TYPE INTEGER;

-- 3. Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_approved_visible ON messages(is_approved, is_visible);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_location_country ON messages(location_country);
CREATE INDEX IF NOT EXISTS idx_media_files_message_id ON media_files(message_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_scheduled ON email_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Birthday messages from users';
COMMENT ON TABLE media_files IS 'Media files attached to birthday messages';
COMMENT ON TABLE email_notifications IS 'Email notifications for birthday reminders';
