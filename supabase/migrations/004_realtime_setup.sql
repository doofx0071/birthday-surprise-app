-- Migration: Enable real-time subscriptions
-- This migration configures real-time functionality for live updates

-- 1. Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Enable real-time for media_files table  
ALTER PUBLICATION supabase_realtime ADD TABLE media_files;

-- 3. Enable real-time for email_notifications table (for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE email_notifications;

-- Note: Real-time policies are already configured in 002_rls_policies.sql
-- This migration just enables the tables for real-time subscriptions
