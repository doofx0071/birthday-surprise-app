-- Migration: Set up Row Level Security policies
-- This migration configures RLS policies for all tables

-- 1. Messages Table RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public message insertion" ON messages;
DROP POLICY IF EXISTS "Allow public to read approved messages" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON messages;

-- Enable RLS (should already be enabled, but ensure it)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert messages
CREATE POLICY "Allow public message insertion" ON messages
  FOR INSERT TO anon WITH CHECK (true);

-- Allow public to read approved and visible messages
CREATE POLICY "Allow public to read approved messages" ON messages
  FOR SELECT TO anon USING (is_approved = true AND is_visible = true);

-- Allow authenticated users to manage all messages
CREATE POLICY "Allow authenticated users full access" ON messages
  FOR ALL TO authenticated USING (true);

-- 2. Media Files Table RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public media insertion" ON media_files;
DROP POLICY IF EXISTS "Allow public media reading" ON media_files;

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Allow public to insert media files
CREATE POLICY "Allow public media insertion" ON media_files
  FOR INSERT TO anon WITH CHECK (true);

-- Allow public to read media files for approved messages
CREATE POLICY "Allow public media reading" ON media_files
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = media_files.message_id 
      AND messages.is_approved = true 
      AND messages.is_visible = true
    )
  );

-- Allow authenticated users full access to media files
CREATE POLICY "Allow authenticated media management" ON media_files
  FOR ALL TO authenticated USING (true);

-- 3. Email Notifications Table RLS Policies
-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can manage email notifications
CREATE POLICY "Allow authenticated email management" ON email_notifications
  FOR ALL TO authenticated USING (true);

-- 4. Storage Policies
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

-- Allow public uploads to birthday-media bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'birthday-media');

-- Allow public downloads from birthday-media bucket
CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'birthday-media');

-- Allow authenticated users full access to storage
CREATE POLICY "Allow authenticated storage management" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'birthday-media');

-- 5. Real-time Policies
-- Allow real-time subscriptions for approved messages
DROP POLICY IF EXISTS "Allow real-time for approved messages" ON messages;
CREATE POLICY "Allow real-time for approved messages" ON messages
  FOR SELECT TO anon USING (is_approved = true AND is_visible = true);

-- Allow real-time for media files of approved messages
CREATE POLICY "Allow real-time for approved media" ON media_files
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = media_files.message_id 
      AND messages.is_approved = true 
      AND messages.is_visible = true
    )
  );
