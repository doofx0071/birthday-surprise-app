-- Create email_configurations table for storing email settings
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name VARCHAR(255) NOT NULL DEFAULT 'Cela''s Birthday',
  sender_email VARCHAR(255) NOT NULL,
  reply_to_email VARCHAR(255),
  webhook_url VARCHAR(500),
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_events table for storing Mailtrap webhook events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- delivery, open, click, bounce, etc.
  message_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  sending_stream VARCHAR(50), -- transactional, bulk
  category VARCHAR(100),
  custom_variables JSONB,
  sending_domain_name VARCHAR(255),
  reason TEXT, -- for bounce/rejection events
  response TEXT, -- for bounce events
  response_code INTEGER, -- for bounce events
  bounce_category VARCHAR(100), -- for bounce events
  ip_address INET, -- for open/click events
  user_agent TEXT, -- for open/click events
  url TEXT, -- for click events
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_message_id ON email_events(message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Create email_statistics view for real-time analytics
CREATE OR REPLACE VIEW email_statistics AS
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_type = 'delivery' THEN 1 END) as delivered,
  COUNT(CASE WHEN event_type = 'open' THEN 1 END) as opened,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicked,
  COUNT(CASE WHEN event_type IN ('bounce', 'soft_bounce') THEN 1 END) as bounced,
  COUNT(CASE WHEN event_type = 'spam' THEN 1 END) as spam,
  COUNT(CASE WHEN event_type = 'unsubscribe' THEN 1 END) as unsubscribed,
  ROUND(
    (COUNT(CASE WHEN event_type = 'delivery' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type IN ('delivery', 'bounce', 'soft_bounce') THEN 1 END), 0)) * 100, 
    2
  ) as delivery_rate,
  ROUND(
    (COUNT(CASE WHEN event_type = 'open' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type = 'delivery' THEN 1 END), 0)) * 100, 
    2
  ) as open_rate,
  ROUND(
    (COUNT(CASE WHEN event_type = 'click' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type = 'delivery' THEN 1 END), 0)) * 100, 
    2
  ) as click_rate,
  ROUND(
    (COUNT(CASE WHEN event_type IN ('bounce', 'soft_bounce') THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type IN ('delivery', 'bounce', 'soft_bounce') THEN 1 END), 0)) * 100, 
    2
  ) as bounce_rate
FROM email_events;

-- Insert default email configuration if none exists
INSERT INTO email_configurations (sender_name, sender_email, reply_to_email)
SELECT 'Cela''s Birthday', 'birthday@example.com', 'noreply@example.com'
WHERE NOT EXISTS (SELECT 1 FROM email_configurations WHERE is_active = true);

-- Add RLS policies
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin only)
CREATE POLICY "Allow all operations for authenticated users" ON email_configurations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON email_events
  FOR ALL USING (auth.role() = 'authenticated');

-- Add updated_at trigger for email_configurations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_configurations_updated_at 
  BEFORE UPDATE ON email_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
