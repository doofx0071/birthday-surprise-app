-- Create system_configurations table for storing application settings
CREATE TABLE IF NOT EXISTS system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- System Configuration Section
  birth_date TIMESTAMP WITH TIME ZONE NOT NULL,
  birthday_person_name VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Manila',
  
  -- Countdown Settings Section
  enable_countdown BOOLEAN DEFAULT true,
  countdown_start_date DATE,
  
  -- Application Features Section
  enable_email_notifications BOOLEAN DEFAULT true,
  require_message_approval BOOLEAN DEFAULT true,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_logs table for real-time logging
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  category VARCHAR(100), -- e.g., 'auth', 'email', 'database', 'api'
  details JSONB, -- Additional structured data
  user_id VARCHAR(255), -- Admin user who triggered the action (if applicable)
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient log querying
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- Insert default system configuration if none exists
INSERT INTO system_configurations (
  birth_date,
  birthday_person_name,
  timezone,
  enable_countdown,
  countdown_start_date,
  enable_email_notifications,
  require_message_approval
) 
SELECT
  '2025-09-08T00:00:00+08:00'::TIMESTAMP WITH TIME ZONE,
  'Gracela Elmera C. Betarmos',
  'Asia/Manila',
  true,
  NULL,
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM system_configurations WHERE is_active = true);

-- Add email field to admin_users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

-- Add password reset fields to admin_users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'reset_token'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN reset_token VARCHAR(255);
    ALTER TABLE admin_users ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create RLS policies for system_configurations
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read system configurations
CREATE POLICY "Allow authenticated users to read system configurations" ON system_configurations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow service role to manage system configurations
CREATE POLICY "Allow service role to manage system configurations" ON system_configurations
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read system logs
CREATE POLICY "Allow authenticated users to read system logs" ON system_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow service role to manage system logs
CREATE POLICY "Allow service role to manage system logs" ON system_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for system_configurations
DROP TRIGGER IF EXISTS update_system_configurations_updated_at ON system_configurations;
CREATE TRIGGER update_system_configurations_updated_at
  BEFORE UPDATE ON system_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
  p_level VARCHAR(20),
  p_message TEXT,
  p_category VARCHAR(100) DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_user_id VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO system_logs (
    level,
    message,
    category,
    details,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_level,
    p_message,
    p_category,
    p_details,
    p_user_id,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the logging function
GRANT EXECUTE ON FUNCTION log_system_event TO authenticated, service_role;
