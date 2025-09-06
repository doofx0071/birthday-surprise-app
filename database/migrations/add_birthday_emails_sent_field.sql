-- Add birthday_emails_sent field to system_configurations table
-- This field tracks whether birthday emails have been sent to prevent duplicate sends

ALTER TABLE system_configurations 
ADD COLUMN IF NOT EXISTS birthday_emails_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS birthday_emails_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_configurations_birthday_emails_sent 
ON system_configurations(birthday_emails_sent);

-- Add comment for documentation
COMMENT ON COLUMN system_configurations.birthday_emails_sent IS 'Flag to track if birthday emails have been sent for this configuration';
COMMENT ON COLUMN system_configurations.birthday_emails_sent_at IS 'Timestamp when birthday emails were sent';
