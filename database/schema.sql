-- Birthday Surprise App Database Schema
-- Run this in your Supabase SQL Editor

-- Create messages table for birthday message submissions
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  message TEXT NOT NULL CHECK (char_length(message) >= 10),
  wants_reminders BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_name CHECK (char_length(name) >= 2 AND char_length(name) <= 50)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting messages (anyone can submit)
CREATE POLICY "Anyone can insert messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Create policy for reading approved messages (anyone can read approved messages)
CREATE POLICY "Anyone can read approved messages" ON public.messages
  FOR SELECT USING (status = 'approved');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO public.messages (name, email, location, message, wants_reminders, status) VALUES
  ('John Doe', 'john@example.com', 'New York, USA', 'Happy birthday! Hope you have an amazing day filled with joy and laughter!', true, 'approved'),
  ('Jane Smith', 'jane@example.com', 'London, UK', 'Wishing you all the best on your special day. May this year bring you happiness and success!', false, 'approved'),
  ('Mike Johnson', 'mike@example.com', 'Toronto, Canada', 'Happy birthday! Thank you for being such an amazing person. Enjoy your celebration!', true, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for file uploads (for Task 07)
INSERT INTO storage.buckets (id, name, public) VALUES ('birthday-media', 'birthday-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for file uploads
CREATE POLICY "Anyone can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'birthday-media');

CREATE POLICY "Anyone can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'birthday-media');

-- Create admin view for message management (optional)
CREATE OR REPLACE VIEW public.messages_admin AS
SELECT 
  id,
  name,
  email,
  location,
  message,
  wants_reminders,
  status,
  created_at,
  updated_at,
  ip_address,
  user_agent,
  char_length(message) as message_length
FROM public.messages
ORDER BY created_at DESC;

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT ON public.messages_admin TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT ON public.messages TO anon;
GRANT INSERT ON public.messages TO anon;
