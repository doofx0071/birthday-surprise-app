-- Email tracking and analytics tables
-- This migration adds email tracking functionality for the birthday notification system

-- Create email tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id VARCHAR(255) NOT NULL UNIQUE, -- Unique identifier for each email sent
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL, -- birthday_notification, contributor_notification, etc.
    message_id VARCHAR(255), -- External message ID from email service
    
    -- Tracking timestamps
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Tracking flags
    delivered BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    clicked BOOLEAN DEFAULT FALSE,
    bounced BOOLEAN DEFAULT FALSE,
    unsubscribed BOOLEAN DEFAULT FALSE,
    
    -- Additional data
    clicked_url TEXT, -- URL that was clicked
    bounce_reason TEXT, -- Reason for bounce
    error_message TEXT, -- Any error messages
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_id ON email_tracking(email_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_recipient ON email_tracking(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(email_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON email_tracking(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_tracking_delivered ON email_tracking(delivered);
CREATE INDEX IF NOT EXISTS idx_email_tracking_opened ON email_tracking(opened);

-- Create email batches table for tracking bulk sends
CREATE TABLE IF NOT EXISTS email_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL UNIQUE,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Batch statistics
    total_recipients INTEGER NOT NULL DEFAULT 0,
    total_sent INTEGER NOT NULL DEFAULT 0,
    total_delivered INTEGER NOT NULL DEFAULT 0,
    total_failed INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    scheduled_for TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for email batches
CREATE INDEX IF NOT EXISTS idx_email_batches_batch_id ON email_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_email_batches_type ON email_batches(email_type);
CREATE INDEX IF NOT EXISTS idx_email_batches_status ON email_batches(status);
CREATE INDEX IF NOT EXISTS idx_email_batches_scheduled ON email_batches(scheduled_for);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_email_tracking_updated_at 
    BEFORE UPDATE ON email_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_batches_updated_at 
    BEFORE UPDATE ON email_batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get email analytics
CREATE OR REPLACE FUNCTION get_email_analytics(
    p_email_type VARCHAR(50) DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_sent BIGINT,
    total_delivered BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    total_bounced BIGINT,
    total_unsubscribed BIGINT,
    delivery_rate NUMERIC,
    open_rate NUMERIC,
    click_rate NUMERIC,
    bounce_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as sent,
            COUNT(*) FILTER (WHERE delivered = true) as delivered,
            COUNT(*) FILTER (WHERE opened = true) as opened,
            COUNT(*) FILTER (WHERE clicked = true) as clicked,
            COUNT(*) FILTER (WHERE bounced = true) as bounced,
            COUNT(*) FILTER (WHERE unsubscribed = true) as unsubscribed
        FROM email_tracking
        WHERE 
            (p_email_type IS NULL OR email_type = p_email_type)
            AND sent_at >= NOW() - (p_hours || ' hours')::INTERVAL
    )
    SELECT 
        s.sent,
        s.delivered,
        s.opened,
        s.clicked,
        s.bounced,
        s.unsubscribed,
        CASE WHEN s.sent > 0 THEN ROUND((s.delivered::NUMERIC / s.sent::NUMERIC) * 100, 2) ELSE 0 END,
        CASE WHEN s.delivered > 0 THEN ROUND((s.opened::NUMERIC / s.delivered::NUMERIC) * 100, 2) ELSE 0 END,
        CASE WHEN s.opened > 0 THEN ROUND((s.clicked::NUMERIC / s.opened::NUMERIC) * 100, 2) ELSE 0 END,
        CASE WHEN s.sent > 0 THEN ROUND((s.bounced::NUMERIC / s.sent::NUMERIC) * 100, 2) ELSE 0 END
    FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old tracking data
CREATE OR REPLACE FUNCTION cleanup_old_email_tracking(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_tracking 
    WHERE sent_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON email_tracking TO authenticated;
GRANT ALL ON email_batches TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_email_tracking TO authenticated;

-- Add RLS policies
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all operations for authenticated users" ON email_tracking
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON email_batches
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial test data (optional)
-- This can be removed in production
INSERT INTO email_tracking (
    email_id,
    recipient_email,
    email_type,
    delivered,
    opened
) VALUES 
    ('test_email_001', 'test@example.com', 'thank_you', true, true),
    ('test_email_002', 'test2@example.com', 'thank_you', true, false)
ON CONFLICT (email_id) DO NOTHING;
