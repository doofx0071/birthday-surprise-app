-- Add birthday email tracking to system_configurations table
-- This prevents duplicate email sending between countdown trigger and cron job

-- Add columns to track birthday email sending status
ALTER TABLE system_configurations 
ADD COLUMN IF NOT EXISTS birthday_emails_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS birthday_emails_sent_at TIMESTAMPTZ;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_configurations_birthday_emails 
ON system_configurations (birthday_emails_sent, is_active);

-- Add helpful comments
COMMENT ON COLUMN system_configurations.birthday_emails_sent IS 'Tracks whether birthday celebration emails have been sent to prevent duplicates';
COMMENT ON COLUMN system_configurations.birthday_emails_sent_at IS 'Timestamp when birthday emails were sent';

-- Create a function to reset birthday email status (for testing/next year)
CREATE OR REPLACE FUNCTION reset_birthday_email_status()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE system_configurations 
  SET 
    birthday_emails_sent = FALSE,
    birthday_emails_sent_at = NULL
  WHERE is_active = TRUE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION reset_birthday_email_status() TO service_role;

COMMENT ON FUNCTION reset_birthday_email_status() IS 'Resets birthday email status for testing or next year preparation';
