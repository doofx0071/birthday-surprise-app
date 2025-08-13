# Database Setup

This directory contains the database schema and setup instructions for the Birthday Surprise App.

## Quick Setup

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project dashboard
   - Go to the SQL Editor

2. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

3. **Verify Setup**
   - Go to the Table Editor
   - You should see the `messages` table
   - Go to Storage and verify the `birthday-media` bucket exists

## Database Schema

### Messages Table

The `messages` table stores all birthday message submissions:

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  message TEXT NOT NULL,
  wants_reminders BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);
```

### Security Policies

- **Insert**: Anyone can submit messages
- **Select**: Only approved messages are publicly readable
- **Update/Delete**: Only service role can modify messages

### Storage Bucket

- **Name**: `birthday-media`
- **Purpose**: Store uploaded images and videos
- **Access**: Public read, authenticated upload

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Database

After setup, you can test the database connection:

1. **Submit a message** through the form
2. **Check the database** in Supabase dashboard
3. **Verify the API** by visiting `/api/messages`

## Message Status Workflow

1. **Pending**: New messages start as pending
2. **Approved**: Admin approves messages for display
3. **Rejected**: Admin rejects inappropriate messages

## Indexes

The schema includes optimized indexes for:
- `created_at` (for chronological sorting)
- `status` (for filtering by approval status)
- `email` (for user lookups)

## Backup and Migration

- All schema changes should be added to `schema.sql`
- Use Supabase's built-in backup features
- Test schema changes on a staging environment first
