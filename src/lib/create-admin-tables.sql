-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  sender_name VARCHAR(255) DEFAULT 'Cela''s Birthday',
  sender_email VARCHAR(255) DEFAULT 'birthday@example.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'success')),
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  user_id VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at ON email_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);

-- Enable RLS (Row Level Security)
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates (allow all operations for now)
CREATE POLICY "Allow all operations on email_templates" ON email_templates
  FOR ALL USING (true);

-- Create policies for system_logs (allow all operations for now)
CREATE POLICY "Allow all operations on system_logs" ON system_logs
  FOR ALL USING (true);

-- Insert some sample log entries
INSERT INTO system_logs (level, category, message, details) VALUES
  ('info', 'system', 'Admin dashboard initialized', 'System started successfully'),
  ('info', 'auth', 'Admin login successful', 'Admin user authenticated'),
  ('success', 'email', 'Email configuration updated', 'SMTP settings configured'),
  ('info', 'messages', 'New message received', 'Message from user submitted for approval');
