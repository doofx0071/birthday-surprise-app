-- Email Queue System for Production Email Handling
-- This table stores emails to be sent, allowing for better reliability and monitoring

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error TEXT,
  
  -- Indexes for performance
  CONSTRAINT email_queue_attempts_check CHECK (attempts >= 0 AND attempts <= max_attempts)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_queue_status_priority ON email_queue (status, priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue (scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue (created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email ON email_queue (to_email);

-- Create a function to clean up old processed emails (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_email_queue()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_queue 
  WHERE status IN ('sent', 'failed') 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get queue statistics
CREATE OR REPLACE FUNCTION get_email_queue_stats()
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  oldest_pending TIMESTAMPTZ,
  newest_pending TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eq.status,
    COUNT(*) as count,
    MIN(CASE WHEN eq.status = 'pending' THEN eq.created_at END) as oldest_pending,
    MAX(CASE WHEN eq.status = 'pending' THEN eq.created_at END) as newest_pending
  FROM email_queue eq
  GROUP BY eq.status
  ORDER BY eq.status;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access email queue
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Admin users can view email queue stats
CREATE POLICY "Admin users can view email queue" ON email_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON email_queue TO service_role;
GRANT SELECT ON email_queue TO authenticated;

-- Add helpful comments
COMMENT ON TABLE email_queue IS 'Queue system for reliable email delivery with retry logic';
COMMENT ON COLUMN email_queue.priority IS 'Email priority: high (birthday notifications), normal (thank you), low (reminders)';
COMMENT ON COLUMN email_queue.template_name IS 'Name of the email template to use (birthday_notification, contributor_notification, etc.)';
COMMENT ON COLUMN email_queue.template_data IS 'JSON data to pass to the email template';
COMMENT ON COLUMN email_queue.scheduled_for IS 'When the email should be sent (allows for scheduling)';
COMMENT ON FUNCTION cleanup_old_email_queue() IS 'Removes processed emails older than 30 days to keep table size manageable';
COMMENT ON FUNCTION get_email_queue_stats() IS 'Returns statistics about the email queue status';
