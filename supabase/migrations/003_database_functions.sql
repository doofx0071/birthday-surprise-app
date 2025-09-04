-- Migration: Create database functions and triggers
-- This migration adds utility functions and automated triggers

-- 1. Update Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for messages table
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Message Statistics Function
CREATE OR REPLACE FUNCTION get_message_stats()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_messages', (SELECT COUNT(*) FROM messages WHERE is_approved = true),
    'total_countries', (SELECT COUNT(DISTINCT location_country) FROM messages WHERE location_country IS NOT NULL AND is_approved = true),
    'total_media', (SELECT COUNT(*) FROM media_files mf JOIN messages m ON mf.message_id = m.id WHERE m.is_approved = true),
    'latest_message', (SELECT created_at FROM messages WHERE is_approved = true ORDER BY created_at DESC LIMIT 1),
    'pending_messages', (SELECT COUNT(*) FROM messages WHERE is_approved = false),
    'total_with_reminders', (SELECT COUNT(*) FROM messages WHERE wants_reminders = true AND is_approved = true)
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get messages by country
CREATE OR REPLACE FUNCTION get_messages_by_country()
RETURNS TABLE(country VARCHAR(100), message_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    location_country as country,
    COUNT(*) as message_count
  FROM messages 
  WHERE location_country IS NOT NULL 
    AND is_approved = true 
    AND is_visible = true
  GROUP BY location_country
  ORDER BY message_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get recent messages with media
CREATE OR REPLACE FUNCTION get_recent_messages_with_media(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name VARCHAR(100),
  message TEXT,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  created_at TIMESTAMPTZ,
  media_count BIGINT,
  has_media BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.message,
    m.location_city,
    m.location_country,
    m.created_at,
    COUNT(mf.id) as media_count,
    COUNT(mf.id) > 0 as has_media
  FROM messages m
  LEFT JOIN media_files mf ON m.id = mf.message_id
  WHERE m.is_approved = true AND m.is_visible = true
  GROUP BY m.id, m.name, m.message, m.location_city, m.location_country, m.created_at
  ORDER BY m.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to schedule email notifications
CREATE OR REPLACE FUNCTION schedule_birthday_reminder(
  user_email VARCHAR(255),
  reminder_date TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO email_notifications (
    email,
    notification_type,
    scheduled_for,
    status
  ) VALUES (
    user_email,
    'birthday_reminder',
    reminder_date,
    'pending'
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to clean up old temporary files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- This function would clean up media files that don't have associated messages
  -- For now, we'll just return 0 as a placeholder
  -- In a real implementation, this would check storage and remove orphaned files
  deleted_count := 0;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to validate message content
CREATE OR REPLACE FUNCTION validate_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure message length is within bounds
  IF length(NEW.message) < 10 THEN
    RAISE EXCEPTION 'Message must be at least 10 characters';
  END IF;
  
  -- Ensure name is valid
  IF length(NEW.name) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be between 2 and 100 characters';
  END IF;
  
  -- Validate email format (basic check)
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger for messages
DROP TRIGGER IF EXISTS validate_message_before_insert ON messages;
CREATE TRIGGER validate_message_before_insert
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION validate_message_content();
